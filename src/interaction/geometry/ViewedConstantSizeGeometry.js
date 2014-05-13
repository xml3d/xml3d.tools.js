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
    XML3D.tools.interaction.geometry.ViewedConstantSizeGeometry = new XML3D.tools.Class(
        XML3D.tools.interaction.geometry.Geometry, {

        /**
         *  @this {XML3D.tools.interaction.geometry.ViewedConstantSizeGeometry}
         *  @param {XML3D.tools.interaction.widgets.Widget} widget
         *  @param {Object=} options
         *
         *  options:
         *      o scale: a custom scale that should be applied to the geometry
         */
        initialize: function(widget, options)
        {
            if(!options)
                options = {};

            this.callSuper(widget);

            if(options.scale)
                this._customWidgetScale = new XML3DVec3(options.scale);
            else
                this._customWidgetScale = new XML3DVec3(1, 1, 1);
            this._initialRootScaling = new XML3DVec3(1,1,1);
        },

        /**
         *  @this {XML3D.tools.interaction.geometry.ViewedConstantSizeGeometry}
         *  @protected
         */
        onCreateGraph: function()
        {
            this.callSuper();

            var xfmable = this.geo.getGraphRootTransformable();
            this._initialRootScaling.set(xfmable.getScale().multiply(this._customWidgetScale));
            xfmable.setScale(this._initialRootScaling);
        },

        /** @inheritDoc */
        onViewXfmChanged: function() {

            this.callSuper();
            this._adaptWidgetScaleToViewPose();
        },

        /** This is called when the target transformation changes.
         *
         *  @this {XML3D.tools.interaction.geometry.Geometry}
         *  @protected
         */
        onTargetXfmChanged: function() {

            this.callSuper();
            this._adaptWidgetScaleToViewPose();
        },

        /**
         *  @this {XML3D.tools.interaction.geometry.ViewedConstantSizeGeometry}
         *  @private
         */
        _adaptWidgetScaleToViewPose: function() {

            var rootViewDist = this._getWidgetViewDistance();
            var rootViewScaling = new XML3DVec3(rootViewDist, rootViewDist, rootViewDist);
            var absoluteRootViewScaling = rootViewScaling.multiply(
                this._getWidgetParentInverseScaling());
            var finalRootScale = this._initialRootScaling.multiply(absoluteRootViewScaling);
            this.geo.getGraphRootTransformable().setScale(finalRootScale);
        },

        /**
         *  @this {XML3D.tools.interaction.geometry.ViewedConstantSizeGeometry}
         *  @private
         *  @return {number} distance between the widget's root node and the view
         */
        _getWidgetViewDistance: function() {

            var curView = XML3D.util.getOrCreateActiveView(this.widget.xml3d);;
            var viewPos = curView.getWorldMatrix().translation();

            var rootPos = this.geo.getGraphRoot().getWorldMatrix().translation();
            var viewDistance = rootPos.subtract(viewPos).length();
            if(viewDistance == 0) {
                return 1;
            }
            return viewDistance;
        },

        /**
         *  @this {XML3D.tools.interaction.geometry.ViewedConstantSizeGeometry}
         *  @private
         *  @return {window.XML3DVec3} world-to-local scaling vector of the widget's parent node
         */
        _getWidgetParentInverseScaling: function() {

            var parentWorldMatrix = this.geo.getGraphRoot().parentNode.getWorldMatrix();
            var scale = parentWorldMatrix.scaling();
            return new XML3DVec3(1/scale.x, 1/scale.y, 1/scale.z);
        }
    });
}());
