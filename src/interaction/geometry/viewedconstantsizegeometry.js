(function(){

    "use strict";

    XMOT.namespace("XMOT.interaction.geometry");

    /**
     */
    XMOT.interaction.geometry.ViewedConstantSizeGeometry = new XMOT.Class(
        XMOT.interaction.geometry.Geometry, {

        /**
         *  @this {XMOT.interaction.geometry.ViewedConstantSizeGeometry}
         *  @param {XMOT.interaction.widgets.Widget} widget
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

            this._customWidgetScale = new XML3DVec3(options.scale);
            this._initialRootScaling = new XML3DVec3(1,1,1);
        },

        /**
         *  @this {XMOT.interaction.geometry.ViewedConstantSizeGeometry}
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
         *  @this {XMOT.interaction.geometry.Geometry}
         *  @protected
         */
        onTargetXfmChanged: function() {

            this.callSuper();
            this._adaptWidgetScaleToViewPose();
        },

        /**
         *  @this {XMOT.interaction.geometry.ViewedConstantSizeGeometry}
         *  @private
         */
        _adaptWidgetScaleToViewPose: function() {

            var curView = XML3D.util.getOrCreateActiveView(this.widget.xml3d);;
            var viewPos = curView.getWorldMatrix().translation();

            var rootPos = this.geo.getGraphRoot().getWorldMatrix().translation();
            var rootViewDist = rootPos.subtract(viewPos).length();

            var scaling = new XML3DVec3(rootViewDist, rootViewDist, rootViewDist);
            var rootScale = this._initialRootScaling.multiply(scaling);

            this.geo.getGraphRootTransformable().setScale(rootScale);
        }
    });
}());
