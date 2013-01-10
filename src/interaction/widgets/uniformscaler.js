
XMOT.namespace("XMOT.interaction.widgets");

/**
 * The UniformScaler widget will attach interactive cubes at the edges of the bounding box
 * of the target node. If the cubes are dragged uniform scaling is performed on the target node.
 *
 * @extends XMOT.interaction.widgets.Widget
 */
XMOT.interaction.widgets.UniformScaler = new XMOT.Class(
    XMOT.interaction.widgets.Widget, {

    GeometryType: XMOT.interaction.geometry.UniformScaler,

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
