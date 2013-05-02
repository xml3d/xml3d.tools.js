(function(){

    /**
     * SimpleConstraint
     * @constructor
     * @implements {Constraint}
     */
    XMOT.SimpleConstraint = new XMOT.Class({

        /**
         * @param {boolean} [allowedToMove]
         * @param {boolean} [allowedToRotate]
         * @param {boolean} [allowedToScale]
         */
        initialize: function(allowedToMove, allowedToRotate, allowedToScale){
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
        },

        /** @inheritDoc */
        constrainRotation: function(newRotation, opts){
            return this.allowedToRotate;
        },

        /** @inheritDoc */
        constrainTranslation: function(newPosition, opts){
            return this.allowedToMove;
        },

        constrainScaling: function(newScale, opts){
            return this.allowedToScale;
        }
    });
}());
