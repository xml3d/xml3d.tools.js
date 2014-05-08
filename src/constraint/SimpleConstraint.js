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

    /**
     * SimpleConstraint
     * @constructor
     * @implements {Constraint}
     */
    XML3D.tools.SimpleConstraint = new XML3D.tools.Class({

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
