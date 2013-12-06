(function(){

    "use strict";

    /**
     * ProhibitAxisMovementConstraint
     * prohibit axismovement, but allow movement around an epsilon of a specified center
     * @constructor
     * @implements {Constraint}
     */
    XML3D.tools.ProhibitAxisMovementConstraint = new XML3D.tools.Class({

        /**
         * @param {Boolean} x prohibit x axis
         * @param {Boolean} y prohibit y axis
         * @param {Boolean} z prohibit z axis
         * @param {number} epsilon
         * @param {number} center
         */
        initialize: function(x,y,z, epsilon, center){
            /**
             * prohibit x axis
             * @private
             * @type {Boolean}
             */
            this.x = x;
            /**
             * prohibit y axis
             * @private
             * @type {Boolean}
             */
            this.y = y;
            /**
             * prohibit z axis
             * @private
             * @type {Boolean}
             */
            this.z = z;
            /**
             * epsilon
             * @private
             * @type {number}
             */
            this.epsilon = epsilon ? epsilon : 0;
            /**
             * center
             * @private
             * @type {number}
             */
            this.center =  center ? center : 0;

        },

        /** @inheritDoc */
        constrainRotation: function(newRotation, opts){
            return true;
        },

        /** @inheritDoc */
        constrainTranslation: function(newPosition, opts){
            if(!opts || !opts.transformable)
                throw "ProhibitAxisMovementConstraint.constrainTranslation: no transformable in options given.";

            var center = this.center;
            var epsilon = this.epsilon;
            var currentPosition = opts.transformable.getPosition();

            if(this.x && Math.abs(center - newPosition.x) > epsilon) newPosition.x = currentPosition.x;
            if(this.y && Math.abs(center - newPosition.y) > epsilon) newPosition.y = currentPosition.y;
            if(this.z && Math.abs(center - newPosition.z) > epsilon) newPosition.z = currentPosition.z;

            return true;
        }
    });
}());
