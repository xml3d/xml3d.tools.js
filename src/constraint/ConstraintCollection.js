/*
Copyright (c) 2010-2014
              DFKI - German Research Center for Artificial Intelligence
              www.dfki.de

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
 so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
(function(){

    "use strict";

    /**
     * ConstraintCollection
     * Combines a number of constraints
     * @constructor
     * @implements {Constraint}
     */
    XML3D.tools.ConstraintCollection = new XML3D.tools.Class({

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
