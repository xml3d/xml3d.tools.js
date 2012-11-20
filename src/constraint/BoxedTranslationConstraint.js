(function(){
    /**
     * BoxedTranslationConstraint
     * 
     * Constrains the translation to a box. Translation values outside are clipped. 
     *  
     * @constructor
     * @param {XML3DBox} [box] the box constraint. Default: infinitely large box, i.e. no constraint
     * @implements {Constraint}
     */
    var BoxedTranslationConstraint = function(box){
        
        /** 
         * The box within which the translation is to be performed. 
         * @private
         * @type {XML3DBox}
         */
        this.box = null; 
        
        if(box)
            this.box = new window.XML3DBox(box);
        else
        {
            var min = new window.XML3DVec3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE); 
            var max = new window.XML3DVec3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE); 
            
            this.box = new window.XML3DBox(min, max); 
        }
    };
    var c = BoxedTranslationConstraint.prototype;

    /** @inheritDoc */
    c.constrainTranslation = function(newTranslation){
        
        var t = newTranslation; 
        
		t.x = this.clipValue(t.x, this.box.min.x, this.box.max.x);
		t.y = this.clipValue(t.y, this.box.min.y, this.box.max.y);
		t.z = this.clipValue(t.z, this.box.min.z, this.box.max.z);
        
        return true; 
    };

    /** @inheritDoc */
    c.constrainRotation = function(newRotation){
        return true;
    };

    /** @inheritDoc */
    c.constrainScaling = function(newScale){
        return true;
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
