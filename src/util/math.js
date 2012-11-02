/** 
 * This file constructs the XMOT.math namespace.
 */
(function() {
    
    if (!XMOT.math)
        XMOT.math = {};
    
    var m = XMOT.math; 

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
