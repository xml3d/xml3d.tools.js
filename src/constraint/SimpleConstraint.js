(function(){
    /**
     * SimpleConstraint
     * @constructor
     * @param {boolean} [allowedToMove]
     * @param {boolean} [allowedToRotate]
     * @param {boolean} [allowedToScale]
     * @implements {Constraint}
     */
    var SimpleConstraint = function(allowedToMove, allowedToRotate, allowedToScale){
        /**
         * allowed to move
         * @private
         * @type {boolean}
         */
        this.allowedToMove = (allowedToMove !== undefined) ? allowedToMove : true;
        /**
         * allowed to Rotate
         * @private
         * @type {boolean}
         */
        this.allowedToRotate = (allowedToRotate !== undefined) ? allowedToRotate : true;
        /**
         * allowed to scale
         * @private
         * @type {boolean}
         */
        this.allowedToScale = (allowedToScale !== undefined) ? allowedToScale: true;
    };
    var s = SimpleConstraint.prototype;

    /** @inheritDoc */
    s.constrainRotation = function(newRotation, opts){
        return this.allowedToRotate;
    };

    /** @inheritDoc */
    s.constrainTranslation = function(newPosition, opts){
        return this.allowedToMove;
    };

    s.constrainScaling = function(newScale, opts){
        return this.allowedToScale;
    };

    //export
    XMOT.SimpleConstraint = SimpleConstraint;
}());
