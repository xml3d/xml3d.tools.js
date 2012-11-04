(function(){
    /**
     * BoxedTranslationConstraint
     * 
     * Constrains the translation to a box. Translation values outside are clipped. 
     *  
     * @constructor
     * @param {XML3DBox} [box] the box constraint. Default: infinitely large box, i.e. no constraint
     * @implements {PureConstraint}
     */
    var BoxedTranslationConstraint = function(box){
        
        /** 
         * The box within which the translation is to be performed. 
         * @private
         * @type {XML3DBox}
         */
        this.box = null; 
        
        if(box)
            this.box = new XML3DBox(box);
        else
        {
            var min = new XML3DVec3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE); 
            var max = new XML3DVec3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE); 
            
            this.box = new XML3DBox(min, max); 
        }
    };
    var c = BoxedTranslationConstraint.prototype;

    /** @inheritDoc */
    c.constrainTranslation = function(newTranslation){

        var t = newTranslation.slice(); 
        
        t[0] = this.clipValue(t[0], this.box.min.x, this.box.max.x);
        t[1] = this.clipValue(t[1], this.box.min.y, this.box.max.y); 
        t[2] = this.clipValue(t[2], this.box.min.z, this.box.max.z);
        
        return t; 
    };

    /** @inheritDoc */
    c.constrainRotation = function(newRotation){
        return newRotation;
    };

    /** @inheritDoc */
    c.constrainScaling = function(newScale){
        return newScale;
    };
    
    /** Clips a single value by min and maximum value. It returns 
     *  the value within the range of min and max.
     *  
     *  @param {number} value the value to clip
     *  @param {number} min  
     *  @param {number} max
     *  @return {number} 
     *  
     *  @private
     */
    c.clipValue = function(value, min, max){
        if(value < min)
            return min; 
        if(value > max)
            return max; 
        return value; 
    }; 

    //export
    XMOT.BoxedTranslationConstraint = BoxedTranslationConstraint;
}());
