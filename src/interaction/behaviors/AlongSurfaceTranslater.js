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

    XML3D.tools.namespace("XML3D.tools.interaction.behaviors");

    /** A translater which permits movement along the surface only. It does this by
     *  attaching a XML3D.tools.AlongSurfaceTranslationConstraint to the target
     *  transformable.
     *
     *  @extends XML3D.tools.interaction.behaviors.Translater
     */
    XML3D.tools.interaction.behaviors.AlongSurfaceTranslater = new XML3D.tools.Class(
        XML3D.tools.interaction.behaviors.Translater,
    {
        /**
         *  @this {XML3D.tools.interaction.behaviors.AlongSurfaceTranslater}
         *  @override
         *  @public
         */
        initialize: function(id, pickGrps, targetTransformable, eventDispatcher)
        {
            if(!targetTransformable)
                targetTransformable = XML3D.tools.MotionFactory.createTransformable(pickGrps[0]);
            targetTransformable = this._createCustomTransformable(targetTransformable);
            this.callSuper(id, pickGrps, targetTransformable, new XML3DVec3(0, 1, 0), eventDispatcher);
        },

        /**
         *  @this {XML3D.tools.interaction.behaviors.AlongSurfaceTranslater}
         *  @private
         */
        _createCustomTransformable: function(targetTransformable)
        {
            this._constraint = new XML3D.tools.AlongSurfaceTranslationConstraint(targetTransformable);
            var cascadedConstraint = new XML3D.tools.CascadedConstraint(
                targetTransformable.constraint, this._constraint);
            return XML3D.tools.MotionFactory.createTransformable(
                targetTransformable.object, cascadedConstraint);
        },

        /**
         *  @this {XML3D.tools.interaction.behaviors.AlongSurfaceTranslater}
         *  @public
         */
        enableConstraint: function()
        {
            this._constraint.enable();
        },

        /**
         *  @this {XML3D.tools.interaction.behaviors.AlongSurfaceTranslater}
         *  @public
         */
        disableConstraint: function()
        {
            this._constraint.disable();
        }
    });
}());
