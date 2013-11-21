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


        /**
         *  @this {XMOT.interaction.widgets.TranslateRotateGizmo}
         *
         *  options:
         *  o geometry.scale: a custom scaling of the widget geometry
         */
        initialize: function(id, options)
        {
            this.callSuper(id, options);
            this._initialOptions = options;
            if(this._initialOptions === undefined)
                this._initialOptions = {};

            if(this._initialOptions.rotationSpeed === undefined)
                this._initialOptions._rotationSpeed = 1;
            this._initialOptions.mirror = this.mirror();
        },

        /**
         *  @this {XMOT.interaction.widgets.TranslateRotateGizmo}
         *  @override
         *  @protected
         */
        onCreateBehavior: function()
        {
            this.callSuper();

            this.behavior["translater"] = new XMOT.interaction.widgets.TranslateGizmo(
                this.globalID("translater"), this._initialOptions);
            this.behavior["translater"].attach();

            this.behavior["rotater"] = new XMOT.interaction.widgets.RotateGizmo(
                this.globalID("rotater"), this._initialOptions);
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
