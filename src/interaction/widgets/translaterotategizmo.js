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

        listenerTypes: [
            "translation:dragstart", "translation:dragend",
            "rotation:dragstart", "rotation:dragend"
        ],

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


            this.behavior["translater"].addListener("dragstart", this.callback("_onTranslationDragStart"));
            this.behavior["translater"].addListener("dragend", this.callback("_onTranslationDragEnd"));
            this.behavior["rotater"].addListener("dragstart", this.callback("_onRotationDragStart"));
            this.behavior["rotater"].addListener("dragend", this.callback("_onRotationDragEnd"));
        },

        _onTranslationDragStart: function()
        {
            this.notifyListeners("translation:dragstart", this);
        },

        _onTranslationDragEnd: function()
        {
            this.notifyListeners("translation:dragend", this);
        },

        _onRotationDragStart: function()
        {
            this.notifyListeners("rotation:dragstart", this);
        },

        _onRotationDragEnd: function()
        {
            this.notifyListeners("rotation:dragend", this);
        }
    });
}());
