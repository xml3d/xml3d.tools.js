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

    XML3D.tools.namespace("XML3D.tools.interaction.geometry");

    /**
     */
    XML3D.tools.interaction.geometry.TargetScaledGeometry = new XML3D.tools.Class(
        XML3D.tools.interaction.geometry.Geometry, {

        /** This is called when the graph is created. The geometry's root
         *  is already initialized.
         *
         *  @this {XML3D.tools.interaction.geometry.Geometry}
         *  @override
         *  @protected
         */
        onCreateGraph: function()
        {
            this.callSuper();

            XML3D.tools.util.fireWhenMeshesLoaded(this.widget.target.object,
                this.callback("_adaptWidgetScaleToViewPose"));
        },

        /** This is called when the target transformation changes.
         *
         *  @this {XML3D.tools.interaction.geometry.TargetScaledGeometry}
         *  @protected
         */
        onTargetXfmChanged: function() {
            this.callSuper();
            this._adaptWidgetScaleToViewPose();
        },

        /**
         *  @this {XML3D.tools.interaction.geometry.TargetScaledGeometry}
         *  @private
         */
        _adaptWidgetScaleToViewPose: function() {
            var scale = this._getWidgetScaling();
            this.geo.getGraphRootTransformable().setScale(scale);
        },

        _getWidgetScaling: function() {
            var target = this.widget.target;
            var scale = new window.XML3DVec3(target.getScale());

            if(!target.object.getBoundingBox().isEmpty())
            {
                var tarBBoxSize = target.object.getBoundingBox().size();
                scale = tarBBoxSize.multiply(new window.XML3DVec3(0.55, 0.55, 0.55));
            }

            var minScale = (scale.x + scale.y + scale.z) / 3;
            minScale /= 2;

            if(scale.x < minScale)
                scale.x = minScale;
            if(scale.y < minScale)
                scale.y = minScale;
            if(scale.z < minScale)
                scale.z = minScale;

            return scale;
        }
    });
}());
