
XMOT.namespace("XMOT.interaction.widgets");

/**
 * The UniformScaler widget will attach interactive cubes at the edges of the bounding box
 * of the target node. If the cubes are dragged uniform scaling is performed on the target node.
 *
 * @extends XMOT.interaction.widgets.Widget
 */
XMOT.interaction.widgets.UniformScaler = new XMOT.Class(
    XMOT.interaction.widgets.Widget, {

    GeoConstructorType: XMOT.interaction.geometry.UniformScalerGeoConstructor,

    /**
     *  @this {XMOT.interaction.widgets.UniformScaler}
     *  @override
     *  @protected
     */
    onTargetXfmChanged: function()
    {
        var targetInvScale = XMOT.math.vecInverseScale(
            this.target.object.getWorldMatrix().scaling().scale(1.15));

        var cubeFac = 0.1; // scaling of cubes (also here those boxes)
        var cube_scale = targetInvScale.scale(cubeFac);

        var cubeScaleStr = cube_scale.x + " " + cube_scale.y + " " + cube_scale.z;
        this.geo.updateTransforms([
            "t_cube_frontleft", "t_cube_frontright", "t_cube_backleft", "t_cube_backright"
        ], {scale: cubeScaleStr});
    },

    /**
     *  @this {XMOT.interaction.widgets.UniformScaler}
     *  @override
     *  @protected
     */
    onCreateBehavior: function()
    {
        var scalehandle = document.getElementById(this.globalID("scale"));

        this.behavior["scale"] = new XMOT.interaction.behaviors.Scaler(
            this.globalID("scaleSensor"), [scalehandle], this.root, true);

        // setup listeners
        this.behavior["scale"].addListener("dragstart", this.callback("_activateHandles"));
        this.behavior["scale"].addListener("dragend", this.callback("_deactivateHandles"));
    },

    // --------------------------------
    // -- Behavior --
    // --------------------------------

    /**
     *  @this {XMOT.interaction.widgets.UniformScaler}
     *  @private
     */
    _activateHandles: function()
    {
        XMOT.util.shader(this.element("scale"),
                         this.element("s_scale_highlight"));
    },

    /**
     *  @this {XMOT.interaction.widgets.UniformScaler}
     *  @private
     */
    _deactivateHandles: function()
    {
        XMOT.util.shader(this.element("scale"),
                         this.element("s_scale"));
    }
});
