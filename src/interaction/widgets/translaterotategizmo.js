
XMOT.namespace("XMOT.interaction.widgets");

/**
 *  A TranslateRotateGizmo simply combines TranslateGizmo and RotateGizmo.
 *
 *  @extends XMOT.interaction.widgets.OverlayWidget
 */
XMOT.interaction.widgets.TranslateRotateGizmo = new XMOT.Class(
    XMOT.interaction.widgets.OverlayWidget, {

    /**
     *  @this {XMOT.interaction.widgets.TranslateRotateGizmo}
     *  @override
     *  @protected
     */
    onCreateBehavior: function()
    {
        this.behavior["translater"] = new XMOT.interaction.widgets.TranslateGizmo(
            this.globalID("translater"), {mirror: this.mirror()}
        );
        this.behavior["translater"].attach();

        this.behavior["rotater"] = new XMOT.interaction.widgets.RotateGizmo(
            this.globalID("rotater"), {mirror: this.mirror()}
        );
        this.behavior["rotater"].attach();
    }
});
