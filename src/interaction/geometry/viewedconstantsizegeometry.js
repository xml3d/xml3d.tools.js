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
