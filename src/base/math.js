/**
 * This file constructs the XMOT.math namespace.
 */
(function() {

    "use strict";

    XMOT.namespace("XMOT.math");

    var m = XMOT.math;

    m.EPSILON = 1E-10;

    /**
     * Converts axis angle representation into an quaternion
     * @param {Array.<number>} axis
     * @param {number} angle
     * @return {Array.<number>} quaternion
     */
    m.axisAngleToQuaternion = function(axis, angle) {
        var normAxis = XMOT.math.normalizeVector(axis);
        var quat = [];
        var s = Math.sin(angle/2);
        quat[0] = normAxis[0] *s;
        quat[1] = normAxis[1] *s;
        quat[2] = normAxis[2] *s;
        quat[3] = Math.cos(angle/2);
        return quat;
    };

    /**
     * Normalizes a 3D vector
     * @param {Array.<number>} vector
     * @return {Array.<number>} normalized vector
     */
    m.normalizeVector = function(vector) {
        var length = Math.sqrt( vector[0]*vector[0] + vector[1]*vector[1] + vector[2]*vector[2] );
        if(length == 0) return vector;
        return [vector[0]/length, vector[1]/length, vector[2]/length];
    };

    /**
     * Converts a quaternion into an axis angle representation
     * @param {Array.<number>} quat
     * @return {{axis: Array.<number>, angle:number}}
     */
    m.quaternionToAxisAngle = function(quat) {
        quat4.normalize(quat); //normalise to avoid erros that may happen if qw > 1
        var angle = 2*Math.acos(quat[3]);
        var s = Math.sqrt(1-quat[3]*quat[3]);
        if(s < 0.00001 ) s = 1; //avoid div by zero, direction not important for small s
        var x = quat[0]/s;
        var y = quat[1]/s;
        var z = quat[2]/s;
        return {axis:[x,y,z], angle:angle};
    };

    /**
     * Interpolate between two quaternions the shortest way
     * @param{XML3DRotation} from quaternion from
     * @param{XML3DRotation} to quaternion to
     * @param{number} t interpolation parameter
     */
    m.slerp = function(from, to, t) {
        var result = new XML3DRotation();
        // Calculate angle between them -> dotProduct
        var fromAsArray = from.getQuaternion();
        var toAsArray = to.getQuaternion();
        var dotProduct = fromAsArray[0] * toAsArray[0] + fromAsArray[1] * toAsArray[1] + fromAsArray[2] * toAsArray[2] + fromAsArray[3] * toAsArray[3];
        //invert, to make sure we interpolate the shortest way
        if( dotProduct < 0 )
        {
            dotProduct = -dotProduct;
            toAsArray[0] = -toAsArray[0];
            toAsArray[1] = -toAsArray[1];
            toAsArray[2] = -toAsArray[2];
            toAsArray[3] = -toAsArray[3];
        }

        var p = 0;
        var q = 0;
        if( (1-dotProduct) > 0.0001 ) {
            //default case
            var omega = Math.acos(dotProduct);
            var sinomega = Math.sin(omega);
            p = Math.sin((1-t)*omega) / sinomega;
            q = Math.sin(t*omega) / sinomega;
        }
        else {
            //linear interpolation
            p = 1.0-t;
            q = t;
        }

        var x = p * fromAsArray[0] + q * toAsArray[0];
        var y = p * fromAsArray[1] + q * toAsArray[1];
        var z = p * fromAsArray[2] + q * toAsArray[2];
        var w = p * fromAsArray[3] + q * toAsArray[3];
        result.setQuaternion( new XML3DVec3(x, y, z), w);
		return result;
    };

    /** Convert degrees to radians.
     *
     *  @param {number} deg angle in degrees.
     *  @return {number} given angle in radians.
     */
    m.degToRad = function(deg)
    {
        return (deg*(Math.PI/180));
    };

    /** Convert radians to degrees
     *
     *  @param {number} rad angle in radians
     *  @return {number} given angle in degrees.
     */
    m.radToDeg = function(rad)
    {
        return (rad*(180/Math.PI));
    };

    /** Interpret the given vector as a scaling property and convert it
     *  to the inverse scaling, which is defined by 1 divided by the vector's
     *  components.
     *
     *  @param {XML3DVec3} vec the scaling vector to convert
     *  @return {XML3DVec3} the inverse scaling vector
     */
    m.vecInverseScale = function(vec)
    {
        return new XML3DVec3(1/vec.x, 1/vec.y, 1/vec.z);
    };

    /** Intersect a given ray with a plane formed by plOrigin and plNormal.
     *  It will store the hit point in the last given argument and return
     *  a number, which describes the intersection.
     *
     *  @param {XML3DRay} ray
     *  @param {XML3DVec3} plOrigin
     *  @param {XML3DVec3} plNormal
     *  @param {XML3DVec3} hitPoint
     *  @return {number} -1 if ray inside plane, 0 if no intersection, 1 if intersection at single point
     */
    m.intersectRayPlane = function(ray, plOrigin, plNormal, hitPoint)
    {
        // Algorithm taken from http://en.wikipedia.org/wiki/Line-plane_intersection

        var d = plOrigin.dot(plNormal);

        // calculate distance t on ray
        var num = d - ray.origin.dot(plNormal);
        var denom = ray.direction.dot(plNormal);

        if(Math.abs(denom) < XML3D.EPSILON)
        {
            if(Math.abs(num) < XML3D.EPSILON)
                return -1;
            else
                return 0;
        }

        var t = num / denom;

        // calculate hit point
        if(hitPoint !== undefined)
        {
            var scalDir = ray.direction.scale(t);
            var hit = ray.origin.add(scalDir);

            hitPoint.x = hit.x;
            hitPoint.y = hit.y;
            hitPoint.z = hit.z;
        }

        return 1;
    };

    /** Computes the transformation matrix from the given source plane to
     * the destination plane.
     *
     * @param {XML3DVec3} srcOrig
     * @param {XML3DVec3} srcNorm
     * @param {XML3DVec3} [destOrig] if not given, (0,0,0) is taken
     * @param {XML3DVec3} [destNorm]  if not given, (0,0,1) is taken
     *
     * @return {XML3DMatrix} a matrix that represents the transformation from
     *                  source to destination.
     */
    m.getTransformPlaneToPlane = function(srcOrig, srcNorm, destOrig, destNorm)
    {
        // default params
        if(!destOrig)
            destOrig = new window.XML3DVec3(0,0,0);
        if(!destNorm)
            destNorm = new window.XML3DVec3(0,0,1);

        // generate translation & rotation
        var transl = destOrig.subtract(srcOrig);
        var rot = new window.XML3DRotation();
        rot.setRotation(srcNorm, destNorm);

        // make matrix
        var xfmMat = new window.XML3DMatrix();
        xfmMat = xfmMat.translate(transl.x, transl.y, transl.z);
        xfmMat = xfmMat.rotateAxisAngle(rot.axis.x, rot.axis.y, rot.axis.z, rot.angle);

        return xfmMat;
    };
}());
