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
     * 
     * @return {boolean} true if a and b differ by at most XML3D.EPSILON
     */
    XML3D.epsilonEquals = function(a, b) {
        var diff;

        diff = a - b;
        if ((diff < 0 ? -diff : diff) > XML3D.EPSILON) {
            return false;
        }
        return true;
    };
    
    // ========================================================================
    // === XML3DBox === 
    // ========================================================================
    
    if(window.XML3DBox)
    {
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
         * @return {string} string representation of the bounding box
         */
        p.str = function() { 
            return "[ min: " + this.min.str() + "; max: " + this.max.str() + "]";  
        };
    
        /** 
         * @this {XML3DBox} 
         * @param {!XML3DBox} other the bounding box to test equality 
         * @return {boolean} true if the two bounding boxes' components differ at most by XML3D.EPSILON 
         */
        p.equals = function(other)
        {
            return this.min.equals(other.min)
                && this.max.equals(other.max); 
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
            this.min.set(mat.multiplyPt(this.min)); 
            this.max.set(mat.multiplyPt(this.max));     
            
            /* The transformation of the box might mix up the actual min
             * and maximum values of the bounding box, since the box is 
             * always axis-aligned. Thus, we validate it and bring min 
             * and max back in order. 
             */ 
            this.validate(); 
            
            return this; 
        }; 
    
        /** 
         * Extract a vector where the given function is applied to each 
         * component. 
         * 
         * @param {!XML3DVec3} v1 
         * @param {!XML3DVec3} v2 
         * @param {!function(number, number)} f
         * @return {XML3DVec3} XML3DVec3(f(v1.x,v2.x),f(v1.y,v2.y), f(v1.z,v2.z))
         */
        function extractVec(v1, v2, f)
        {
            var vec = new window.XML3DVec3(); 
            vec.x = f(v1.x, v2.x); 
            vec.y = f(v1.y, v2.y);
            vec.z = f(v1.z, v2.z); 
            
            return vec; 
        };
    
        /** 
         * Returns the box that sets the min and max properties to 
         * the minimal and maximal vectors of min and max, respectively. 
         * 
         * \sa XML3DBox.transform()
         * 
         * @this {XML3DBox} 
         * @return {XML3DBox} this, the validated bounding box 
         */
        p.validate = function() 
        {
            var mi = new window.XML3DVec3(this.min); 
            var ma = new window.XML3DVec3(this.max); 
            
            this.min.set(extractVec(mi, ma, Math.min)); 
            this.max.set(extractVec(mi, ma, Math.max));
            
            return this; 
        };
    } // if(XML3DBox)
    
    // ========================================================================
    // === XML3DMatrix === 
    // ========================================================================
    
    if(window.XML3DMatrix)
    {
        var p = window.XML3DMatrix.prototype; 
        
        /** 
         * @this XML3DMatrix 
         * 
         * @param {!XML3DMatrix} the other matrix to test equality with
         * @return {boolean} true if each of the matrices' components differ by at most XML3D.EPSILON
         */
        p.equals = function(other) { 
            
            var eq = XML3D.epsilonEquals; 
            
            return eq(this.m11, other.m11) 
                && eq(this.m12, other.m12) 
                && eq(this.m13, other.m13) 
                && eq(this.m14, other.m14) 
                && eq(this.m21, other.m21) 
                && eq(this.m22, other.m22) 
                && eq(this.m23, other.m23) 
                && eq(this.m24, other.m24) 
                && eq(this.m31, other.m31) 
                && eq(this.m32, other.m32) 
                && eq(this.m33, other.m33) 
                && eq(this.m34, other.m34) 
                && eq(this.m41, other.m41) 
                && eq(this.m42, other.m42) 
                && eq(this.m43, other.m43) 
                && eq(this.m44, other.m44);                 
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
        }

        /** 
         * Return the scale of this matrix as XML3DVec3. 
         * 
         * @this {XML3DMatrix} 
         * 
         * @return {XML3DVec3} the scale component of the matrix 
         */
        p.scale = function() 
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
        
    } // if(XML3DMatrix)
    
    // ========================================================================
    // === XML3DRay === 
    // ========================================================================
    
    if(window.XML3DRay)
    {   
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
         * @return {boolean} true if each component of the rays differ by at most XML3D.EPSILON
         */
        p.equals = function(other) { 
           
            return this.origin.equals(other.origin) 
                && this.direction.equals(other.direction); 
        }; 
    }
    
    // ========================================================================
    // === XML3DRotation === 
    // ========================================================================

    if(window.XML3DRotation)
    {       
        var p = window.XML3DRotation.prototype; 
        
        /** 
         * Returns a string representation of XML3DRotation. It can be used 
         * to set attributes such as the <transform>'s rotation attribute. 
         * 
         * @this {XML3DRotation}
         * @return {string}
         */
        p.str = function() {
            return this.axis.str() + " " + this.angle; 
        };
        
        /** 
         * @this {XML3DRotation}          
         * @param {!XML3DRotation} other the other rotation to test equality with 
         * @return {boolean} true if axis and angle of both rotations differ by at most XML3D.EPSILON
         */
        p.equals = function(other) { 
            
            return this.axis.equals(other.axis) 
                && XML3D.epsilonEquals(this.angle, other.angle); 
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
                
                var q = new window.XML3DRotation();
                var trace = mat.m11 + mat.m22 + mat.m33;
                if (trace > 0) {        
                    var s = 2.0 * Math.sqrt(trace + 1.0);
                    q.w = 0.25 * s;
                    q.x = (mat.m23 - mat.m32) / s;
                    q.y = (mat.m31 - mat.m13) / s;
                    q.z = (mat.m12 - mat.m21) / s;
                } else {
                    if (mat.m11 > mat.m22 && mat.m11 > mat.m33) {
                        var s = 2.0 * Math.sqrt(1.0 + mat.m11 - mat.m22 - mat.m33);
                        q.w = (mat.m23 - mat.m32) / s;
                        q.x = 0.25 * s;
                        q.y = (mat.m21 + mat.m12) / s;
                        q.z = (mat.m31 + mat.m13) / s;
                    } else if (mat.m22 > mat.m33) {
                        var s = 2.0 * Math.sqrt(1.0 + mat.m22 - mat.m11 - mat.m33);
                        q.w = (mat.m31 - mat.m13) / s;
                        q.x = (mat.m21 + mat.m12) / s;
                        q.y = 0.25 * s;
                        q.z = (mat.m32 + mat.m23) / s;
                    } else {
                        var s = 2.0 * Math.sqrt(1.0 + mat.m33 - mat.m11 - mat.m22);
                        q.w = (mat.m12 - mat.m21) / s;
                        q.x = (mat.m31 + mat.m13) / s;
                        q.y = (mat.m32 + mat.m23) / s;
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
    }
    
    // ========================================================================
    // === XML3DVec3 === 
    // ========================================================================
    
    if(window.XML3DVec3)
    {
        var p = window.XML3DVec3.prototype; 
        
        /** 
         * Returns a string representation of the vector. It can be used e.g. to set 
         * the <transform>'s translation attribute. 
         * 
         * @this {XML3DVec3} 
         * @return {string}
         */
        p.str = function() { 
            return this.x.toFixed(3) + " " + this.y.toFixed(3) + " " + this.z.toFixed(3); 
        };

        /** 
         * Compares the vector with the given one and returns true if all 
         * components differ by at most XML3D.EPSILON. 
         * 
         * @this {XML3DVec3} 
         * @param {XML3DVec3} other
         * @return {boolean}
         */
        p.equals = function(other) { 
            
            if(!other)
                return false; 
            
            return XML3D.epsilonEquals(this.x, other.x) 
                && XML3D.epsilonEquals(this.y, other.y) 
                && XML3D.epsilonEquals(this.z, other.z);
        };         
    }
}()); 
