(function(){

    "use strict";

    XMOT.namespace("XMOT.interaction.geometry");

    /**
     */
    XMOT.interaction.geometry.TargetScaledGeometry = new XMOT.Class(
        XMOT.interaction.geometry.Geometry, {

        /** This is called when the graph is created. The geometry's root
         *  is already initialized.
         *
         *  @this {XMOT.interaction.geometry.Geometry}
         *  @override
         *  @protected
         */
        onCreateGraph: function()
        {
            this.callSuper();

            XMOT.util.fireWhenMeshesLoaded(this.widget.target.object,
                this.callback("_adaptWidgetScaleToViewPose"));
        },

        /** This is called when the target transformation changes.
         *
         *  @this {XMOT.interaction.geometry.TargetScaledGeometry}
         *  @protected
         */
        onTargetXfmChanged: function() {
            this.callSuper();
            this._adaptWidgetScaleToViewPose();
        },

        /**
         *  @this {XMOT.interaction.geometry.TargetScaledGeometry}
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
