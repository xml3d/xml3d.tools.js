(function(){

    "use strict";

    /**
     * ConstraintCollection
     * Combines a number of constraints
     * @constructor
     * @implements {Constraint}
     */
    XMOT.ConstraintCollection = new XMOT.Class({

        /**
         * @param {Array.<Constraint>|undefined} constraints
         * @param {boolean} breakEarly do not check all constraints if one fail
         */
        initialize: function(constraints, breakEarly){
            /**
             * Collection of Contraints
             * @private
             * @type {Array.<Constraint>|undefined}
             */
            this.constraints = constraints == undefined ? [] : constraints;
            /**
             * break early flag
             * @private
             * @type{boolean}
             */
            this.breakEarly = (breakEarly !== undefined) ? breakEarly : true;
        },

        /** @inheritDoc */
        constrainRotation: function(newRotation, opts){
            var constraints = this.constraints;
            var length = constraints.length;
            var i = 0;
            var ret = true;
            var breakEarly = this.breakEarly;

            while( i<length && (ret || !breakEarly) ){
                ret = ret && constraints[i].constrainRotation(newRotation, opts);
                i++;
            }
            return ret;
        },

        /** @inheritDoc */
        constrainTranslation: function(newPosition, opts){
            var constraints = this.constraints;
            var length = constraints.length;
            var i = 0;
            var ret = true;
            var breakEarly = this.breakEarly;
            while( i<length && (ret || !breakEarly) ){
                ret = ret && constraints[i].constrainTranslation(newPosition, opts);
                i++;
            }
            return ret;
        },

        /** @inheritDoc */
        constraintScaling: function(newScale, opts) {
            var constraints = this.constraints;
            var length = constraints.length;
            var i = 0;
            var ret = true;
            var breakEarly = this.breakEarly;
            while( i<length && (ret || !breakEarly) ){
                ret = ret && constraints[i].constraintScaling(newScale, opts);
                i++;
            }
            return ret;
        },

        /**
         * Adds a constraint to the collection
         * @param {Constraint} constraint
         */
        addConstraint: function(constraint){
            this.constraints.push(constraint);
        },

        /**
         * Removes a constraint from the collection
         * @param {Constraint} constraint
         */
        removeContraint: function(constraint){
            var i = this.constraints.indexOf(constraint);
            //indexOf returns -1 if item was not found
            if(i !== -1) this.constraints.splice(i,1);
        }
    });
}());
