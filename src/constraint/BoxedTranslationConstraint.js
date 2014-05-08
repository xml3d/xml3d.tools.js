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
     * BoxedTranslationConstraint
     *
     * Constrains the translation to a box. Translation values outside are clipped.
     *
     * @implements {Constraint}
     * @constructor
     */
    XML3D.tools.BoxedTranslationConstraint = new XML3D.tools.Class({

        /**
         * @param {XML3DBox} [box] the box constraint. Default: infinitely large box, i.e. no constraint
         */
        initialize: function(box){

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
        },

        /** @inheritDoc */
        constrainTranslation: function(newTranslation){

            var t = newTranslation;

            t.x = this.clipValue(t.x, this.box.min.x, this.box.max.x);
            t.y = this.clipValue(t.y, this.box.min.y, this.box.max.y);
            t.z = this.clipValue(t.z, this.box.min.z, this.box.max.z);

            return true;
        },

        /** @inheritDoc */
        constrainRotation: function(newRotation){
            return true;
        },

        /** @inheritDoc */
        constrainScaling: function(newScale){
            return true;
        },

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
        clipValue: function(value, min, max){
            if(value < min)
                return min;
            if(value > max)
                return max;
            return value;
        }
    });
}());
