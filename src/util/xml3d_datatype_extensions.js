/** Contains useful extensions of XML3D's datatypes, i.e. XML3DBox, XML3DMatrix aso.
 *  Every data type will have a str() method for a pretty string representation. For other
 *  extensions see the code below.
 */

(function() {

    /**
     * @const
     */
    XML3D.EPSILON = 0.00001;

    /**
     * Compare two values for equality that differ at most by
     * XML3D.EPSILON.
     *
     * @param {number} a
     * @param {number} b
     * @param {number=} epsilon. Default: XML3D.EPSILON
     *
     * @return {boolean} true if a and b differ by at most XML3D.EPSILON
     */
    XML3D.epsilonEquals = function(a, b, epsilon) {

        if(epsilon === undefined)
            epsilon = XML3D.EPSILON;

        var diff = a - b;
        return (Math.abs(diff) <= XML3D.EPSILON);
    };
}());

// ========================================================================
// === XML3DBox ===
// ========================================================================
(function() {

    if(!window.XML3DBox)
        return;

    var p = window.XML3DBox.prototype;

    /**
     * @this {XML3DBox}
     * @return {number} the size of the bounding box
     */
    p.size = function() {

        return this.max.subtract(this.min);
    };

    /**
     * @this {XML3DBox}
     * @param {!XML3DBox} other the bounding box to test intersection with
     * @return {boolean} true if this and the other bbox intersect
     */
    p.intersects = function(other) {

        return (this.min.x < other.max.x) && (this.max.x > other.min.x)
        &&     (this.min.y < other.max.y) && (this.max.y > other.min.y)
        &&     (this.min.z < other.max.z) && (this.max.z > other.min.z);

    };

    /**
     * @this {XML3DBox}
     * @param {!XML3DVec3} point to test intersection with
     * @return {boolean} true if this and the other bbox intersect
     */
    p.contains = function(point) {
        if(this.min.x > point.x || this.min.y > point.y || this.min.z > point.z)
            return false;
        if(this.max.x < point.x || this.max.y < point.y || this.max.z < point.z)
            return false;

        return true;
    };

    /**
     * @this {XML3DBox}
     * @return {string} string representation of the bounding box
     */
    p.str = function() {
        return "[ min: " + this.min.str() + "; max: " + this.max.str() + "]";
    };

    /**
     * @this {XML3DBox}
     * @param {!XML3DBox} other the bounding box to test equality
     * @param {number=} epsilon. Default XML3D.EPSILON
     * @return {boolean} true if the two bounding boxes' components differ at most by XML3D.EPSILON
     */
    p.equals = function(other, epsilon)
    {
        return this.min.equals(other.min, epsilon)
            && this.max.equals(other.max, epsilon);
    };

    /**
     * Transforms the min and max of this box with the given matrix.
     * Afterwards validates it.
     *
     * @this {XML3DBox}
     * @param {!XML3DMatrix} mat the matrix to perform the transformation with.
     * @return {XML3DBox} this, the transformed bounding box
     */
    p.transform = function(mat)
    {
        var p1 = new window.XML3DVec3(this.min);
        var p2 = new window.XML3DVec3(this.min.x, this.min.y, this.max.z);
        var p3 = new window.XML3DVec3(this.min.x, this.max.y, this.min.z);
        var p4 = new window.XML3DVec3(this.max.x, this.min.y, this.min.z);
        var p5 = new window.XML3DVec3(this.min.x, this.max.y, this.max.z);
        var p6 = new window.XML3DVec3(this.max.x, this.max.y, this.min.z);
        var p7 = new window.XML3DVec3(this.max.x, this.min.y, this.max.z);
        var p8 = new window.XML3DVec3(this.max);

        this.makeEmpty();
        this.extend(mat.multiplyPt(p1));
        this.extend(mat.multiplyPt(p2));
        this.extend(mat.multiplyPt(p3));
        this.extend(mat.multiplyPt(p4));
        this.extend(mat.multiplyPt(p5));
        this.extend(mat.multiplyPt(p6));
        this.extend(mat.multiplyPt(p7));
        this.extend(mat.multiplyPt(p8));

        return this;
    };
}());

// ========================================================================
// === XML3DMatrix ===
// ========================================================================
(function() {

    if(!window.XML3DMatrix)
        return;

    var p = window.XML3DMatrix.prototype;

    /**
     * @this XML3DMatrix
     *
     * @param {!XML3DMatrix} other the other matrix to test equality with
     * @param {number=} epsilon. Default XML3D.EPSILON
     * @return {boolean} true if each of the matrices' components differ by at most XML3D.EPSILON
     */
    p.equals = function(other, epsilon) {

        var eq = XML3D.epsilonEquals;

        return eq(this.m11, other.m11, epsilon)
            && eq(this.m12, other.m12, epsilon)
            && eq(this.m13, other.m13, epsilon)
            && eq(this.m14, other.m14, epsilon)
            && eq(this.m21, other.m21, epsilon)
            && eq(this.m22, other.m22, epsilon)
            && eq(this.m23, other.m23, epsilon)
            && eq(this.m24, other.m24, epsilon)
            && eq(this.m31, other.m31, epsilon)
            && eq(this.m32, other.m32, epsilon)
            && eq(this.m33, other.m33, epsilon)
            && eq(this.m34, other.m34, epsilon)
            && eq(this.m41, other.m41, epsilon)
            && eq(this.m42, other.m42, epsilon)
            && eq(this.m43, other.m43, epsilon)
            && eq(this.m44, other.m44, epsilon);
    };

    /** Multiplies this matrix with the given vector
     *
     *  @this {XML3DMatrix}
     *  @param {!XML3DVec3} vec
     *  @return {XML3DVec3}
     */
    p.multiplyDir = function(vec) {

        return this.multiplyPt(vec, 0);
    };

    /** Multiplies this matrix with the given point, that
     *  is represented by a 3D vector and a scalar w for the 4th dimension.
     *
     *  @this {XML3DMatrix}
     *
     *  @param {!XML3DVec3} vec the first 3 components of the point stored in a vector
     *  @param {!number} w the 4th component of the point
     *
     *  @return {XML3DVec3} the result of multiplication. The 4th component w of the point is
     *      calculated into the first 3 components (they're normalized by w).
     */
    p.multiplyPt = function(vec, w) {

        if(w === undefined || w === null)
            w = 1;

        var _x = 0; var _y = 0; var _z = 0; var _w = w;

        // column-major multiplication: translation in last column
        _x = this.m11 * vec.x + this.m21 * vec.y + this.m31 * vec.z + this.m41 * w;
        _y = this.m12 * vec.x + this.m22 * vec.y + this.m32 * vec.z + this.m42 * w;
        _z = this.m13 * vec.x + this.m23 * vec.y + this.m33 * vec.z + this.m43 * w;
        _w = this.m14 * vec.x + this.m24 * vec.y + this.m34 * vec.z + this.m44 * w;

        if(_w != 0)
        {
            _x = _x/_w;
            _y = _y/_w;
            _z = _z/_w;
        }

        return new window.XML3DVec3(_x, _y, _z);
    };

    /**
     * Convert the matrix to a string, optionally using a HTML table. The returned string
     * is output row-major (although XML3DMatrix is column-major).
     *
     * @this {XML3DMatrix}
     * @param {boolean} pretty if true does a pretty output by wrapping the matrix in a table.
     * @return {string}
     */
    p.str = function(pretty) {

        var ret = ""; // return string
        var es = " "; // element separator
        var rs = ""; // row start
        var re = " | "; // row end

        if(pretty)
        {
            var td_style = "width:50px;";
            ret = "<table>";
            es = "</td><td style=\"" + td_style + "\">";
            rs = "<tr><td style=\"" + td_style + "\">";
            re = "</td></tr>";
        }

        ret += rs + this.m11.toFixed(3) + es + this.m21.toFixed(3) + es + this.m31.toFixed(3) + es + this.m41.toFixed(3) + re;
        ret += rs + this.m12.toFixed(3) + es + this.m22.toFixed(3) + es + this.m32.toFixed(3) + es + this.m42.toFixed(3) + re;
        ret += rs + this.m13.toFixed(3) + es + this.m23.toFixed(3) + es + this.m33.toFixed(3) + es + this.m43.toFixed(3) + re;
        ret += rs + this.m14.toFixed(3) + es + this.m24.toFixed(3) + es + this.m34.toFixed(3) + es + this.m44.toFixed(3) + re;

        if(pretty)
            ret += "</table>";

        return ret;
    };

    if(!p.transpose)
    {
        /**
         * Transposes the matrix.
         *
         * @this {XML3DMatrix}
         * @return {XML3DMatrix} the transposed matrix
         */
        p.transpose = function() {
            return new window.XML3DMatrix(
                this.m11, this.m21, this.m31, this.m41,
                this.m12, this.m22, this.m32, this.m42,
                this.m13, this.m23, this.m33, this.m43,
                this.m14, this.m24, this.m34, this.m44
            );
        };
    }

    /**
     * Return the translation of this matrix as XML3DVec3.
     *
     * @this {XML3DMatrix}
     *
     * @return {XML3DVec3} the translation component of the matrix
     */
    p.translation = function()
    {
        return new window.XML3DVec3(this.m41, this.m42, this.m43);
    };

    /**
     * Return the scaling factor of this matrix as XML3DVec3.
     *
     * @this {XML3DMatrix}
     *
     * @return {XML3DVec3} the scale component of the matrix
     */
    p.scaling = function()
    {
        var v = new window.XML3DVec3();

        // scale factor are the magnitudes of the first three basis vectors
        // cf. http://www.gamedev.net/topic/491578-get-scale-factor-from-a-matrix/
        v.x = this.m11; v.y = this.m12; v.z = this.m13;
        var sx = v.length();

        v.x = this.m21; v.y = this.m22; v.z = this.m23;
        var sy = v.length();

        v.x = this.m31; v.y = this.m32; v.z = this.m33;
        var sz = v.length();

        return new window.XML3DVec3(sx, sy, sz);
    };

    /**
     * Return the rotation of this matrix as XML3DRotation.
     *
     * @this {XML3DMatrix}
     *
     * @return {XML3DRotation} the rotation component of the matrix
     */
    p.rotation = function()
    {
        return window.XML3DRotation.fromMatrix(this);
    };
}());

// ========================================================================
// === XML3DRay ===
// ========================================================================
(function() {

    if(!window.XML3DRay)
        return;

    var p = window.XML3DRay.prototype;

    /**
     * Returns a string representation of the ray.
     *
     * @this {XML3DRay}
     * @return {string}
     */
    p.str = function() {
        return "[ pos: " + this.origin.str() + "; dir: " + this.direction.str() + "]";
    };

    /**
     * @this {XML3DRay}
     *
     * @param {!XML3DRay} other the other ray to test equality with
     * @param {number=} epsilon. Default XML3D.EPSILON
     * @return {boolean} true if each component of the rays differ by at most XML3D.EPSILON
     */
    p.equals = function(other, epsilon) {

        return this.origin.equals(other.origin, epsilon)
            && this.direction.equals(other.direction, epsilon);
    };

    /**
     * Transforms the origin and direction of this ray by the given matrix.
     * This ray is not modified
     *
     * @this {XML3DRay}
     * @param {!XML3DMatrix} mat the matrix to perform the transformation with.
     * @return {XML3DRay} this, the transformed ray
     */
    p.transform = function(mat)
    {
        var to = mat.multiplyPt(this.origin);
        var td = mat.multiplyDir(this.direction);

        return new window.XML3DRay(to, td);
    };
}());

// ========================================================================
// === XML3DRotation ===
// ========================================================================
(function() {

    if(!window.XML3DRotation)
        return;

    var p = window.XML3DRotation.prototype;

    /**
     * Returns a string representation of XML3DRotation. It can be used
     * to set attributes such as the <transform>'s rotation attribute.
     *
     * @this {XML3DRotation}
     * @return {string}
     */
    p.str = function() {
        return this.axis.str() + " " + this.angle.toFixed(3);
    };

    /**
     * @this {XML3DRotation}
     * @param {!XML3DRotation} other the other rotation to test equality with
     * @param {number=} epsilon. Default XML3D.EPSILON
     * @return {boolean} true if axis and angle of both rotations differ by at most XML3D.EPSILON
     */
    p.equals = function(other, epsilon) {

        return this.axis.equals(other.axis, epsilon)
            && XML3D.epsilonEquals(this.angle, other.angle, epsilon);
    };

    if(!window.XML3DRotation.fromMatrix)
    {
        /**
         * Constructs an instance of XML3DRotation from the given matrix.
         *
         * @param {!XML3DMatrix} mat
         * @return {XML3DRotation}
         */
        window.XML3DRotation.fromMatrix = function(mat) {

            var m = mat;
            var scal = mat.scaling();
            if(!scal.equals(new window.XML3DVec3(1,1,1)))
            {
                m = mat.scale(1/scal.x,1/scal.y,1/scal.z);
            }

            var q = new window.XML3DRotation();
            var trace = m.m11 + m.m22 + m.m33;
            if (trace > 0) {
                var s = 2.0 * Math.sqrt(trace + 1.0);
                q.w = 0.25 * s;
                q.x = (m.m23 - m.m32) / s;
                q.y = (m.m31 - m.m13) / s;
                q.z = (m.m12 - m.m21) / s;
            } else {
                if (m.m11 > m.m22 && m.m11 > m.m33) {
                    var s = 2.0 * Math.sqrt(1.0 + m.m11 - m.m22 - m.m33);
                    q.w = (m.m23 - m.m32) / s;
                    q.x = 0.25 * s;
                    q.y = (m.m21 + m.m12) / s;
                    q.z = (m.m31 + m.m13) / s;
                } else if (m.m22 > m.m33) {
                    var s = 2.0 * Math.sqrt(1.0 + m.m22 - m.m11 - m.m33);
                    q.w = (m.m31 - m.m13) / s;
                    q.x = (m.m21 + m.m12) / s;
                    q.y = 0.25 * s;
                    q.z = (m.m32 + m.m23) / s;
                } else {
                    var s = 2.0 * Math.sqrt(1.0 + m.m33 - m.m11 - m.m22);
                    q.w = (m.m12 - m.m21) / s;
                    q.x = (m.m31 + m.m13) / s;
                    q.y = (m.m32 + m.m23) / s;
                    q.z = 0.25 * s;
                }
            }
            var img = new window.XML3DVec3(q.x, q.y, q.z);
            if(img.equals(new window.XML3DVec3(0,0,0)))
            {
                q = new window.XML3DRotation();
            }
            else
                q.setQuaternion(img, q.w);

            return q;
        };
    }

    if(!p.inverse)
    {
        /**
         *  @this {window.XML3DRotation}
         *  @return {window.XML3DRotation}
         */
        p.inverse = function()
        {
            var invQuat = XML3D.math.quat.invert(XML3D.math.quat.create(), this._data);
            return new window.XML3DRotation(invQuat);
        }
    }

    if(!p.toEulerAngles)
    {

        /** Convert a given XML3DRotation to euler angles.
         *
         *  @this {window.XML3DRotation}
         *  @return {window.XML3DVec3}
         */
        p.toEulerAngles = function()
        {
            var q = this._data;

            var qxy = q[0]*q[1];
            var qxz = q[0]*q[2];
            var qyz = q[1]*q[2];
            var qwx = q[3]*q[0];
            var qwy = q[3]*q[1];
            var qwz = q[3]*q[2];

            var qxx = q[0]*q[0];
            var qyy = q[1]*q[1];
            var qzz = q[2]*q[2];
            var qww = q[3]*q[3];

            var xAngle = Math.atan2(2 * (qyz + qwx), qww - qxx - qyy + qzz);
            var yAngle = Math.asin(-2 * (qxz - qwy));
            var zAngle = Math.atan2(2 * (qxy + qwz), qww + qxx - qyy - qzz);

            return new window.XML3DVec3(xAngle, yAngle, zAngle);
        }
    }
}());

// ========================================================================
// === XML3DVec3 ===
// ========================================================================
(function() {

    if(!window.XML3DVec3)
        return;

    var p = window.XML3DVec3.prototype;

    /**
     * Returns a string representation of the vector. It can be used e.g. to set
     * the <transform>'s translation attribute.
     *
     * @this {XML3DVec3}
     * @return {string}
     */
    p.str = function()
    {
        return this.x.toFixed(3) + " " + this.y.toFixed(3) + " " + this.z.toFixed(3);
    };

    /**
     * Convert the vector to an array.
     *
     * @this {XML3DVec3}
     * @return {Array.<number>}
     */
    p.toArray = function()
    {
        return new Array(this.x, this.y, this.z);
    };

    /**
     * Compares the vector with the given one and returns true if all
     * components differ by at most XML3D.EPSILON.
     *
     * @this {XML3DVec3}
     * @param {XML3DVec3} other
     * @param {number=} epsilon. Default XML3D.EPSILON
     * @return {boolean}
     */
    p.equals = function(other, epsilon)
    {
        if(!other)
            return false;

        return XML3D.epsilonEquals(this.x, other.x, epsilon)
            && XML3D.epsilonEquals(this.y, other.y, epsilon)
            && XML3D.epsilonEquals(this.z, other.z, epsilon);
    };
}());
