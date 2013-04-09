(function(){

    "use strict";

    XMOT.namespace("XMOT.interaction.widgets");

    /**
     *  A TranslateRotateGizmo simply combines TranslateGizmo and RotateGizmo.
     *
     *  @extends XMOT.interaction.widgets.OverlayWidget
     */
    XMOT.interaction.widgets.TranslateRotateGizmo = new XMOT.Class(
        XMOT.interaction.widgets.OverlayWidget, {

        initialize: function(id, options)
        {
            this.callSuper(id, options);

            if(options.rotationSpeed)
                this._rotationSpeed = options.rotationSpeed;
            else
                this._rotationSpeed = 1;
        },

        /**
         *  @this {XMOT.interaction.widgets.TranslateRotateGizmo}
         *  @override
         *  @protected
         */
        onCreateBehavior: function()
        {
            this.callSuper();

            var options = {
                mirror: this.mirror()
            };

            this.behavior["translater"] = new XMOT.interaction.widgets.TranslateGizmo(
                this.globalID("translater"), options);
            this.behavior["translater"].attach();

            options.rotationSpeed = this._rotationSpeed;

            this.behavior["rotater"] = new XMOT.interaction.widgets.RotateGizmo(
                this.globalID("rotater"), options);
            this.behavior["rotater"].attach();
        }
    });
}());
