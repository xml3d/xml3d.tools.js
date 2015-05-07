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
     * CascadedConstraint
     * Establishes a parent-child relationship between two given constraints.
     * That means at first the child constraint is applied and afterwards the
     * parent constraint, on the already modified value of the child.
     *
     * @constructor
     * @implements {Constraint}
     */
    XML3D.tools.CascadedConstraint = new XML3D.tools.Class({

        /**
         * @param {Constraint} parentConstraint
         * @param {Constraint} childConstraint
         */
        initialize: function(parentConstraint, childConstraint)
        {
            this._parentConstraint = parentConstraint;
            this._childConstraint = childConstraint;
        },

        /** @inheritDoc */
        constrainRotation: function(newRotation, opts)
        {
            if(!this._childConstraint.constrainRotation(newRotation, opts))
                return false;

            return this._parentConstraint.constrainRotation(newRotation, opts);
        },

        /** @inheritDoc */
        constrainTranslation: function(newPosition, opts)
        {
            if(!this._childConstraint.constrainTranslation(newPosition, opts))
                return false;

            return this._parentConstraint.constrainTranslation(newPosition, opts);
        },

        /** @inheritDoc */
        constrainScaling: function(newScale, opts)
        {
            if(!this._childConstraint.constrainScaling(newScale, opts))
                return false;

            return this._parentConstraint.constrainScaling(newScale, opts);
        }
    });
}());
