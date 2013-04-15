(function(){

    "use strict";

    /**
     *  @constructor
     */
    XMOT.MouseController = new XMOT.Class(XMOT.util.Attachable, {

        initialize: function(targetViewTransformable, options) {

            var options = options || {};

            this.target = targetViewTransformable;

            /** @private */
            this._targetXml3d = XMOT.util.getXml3dRoot(targetViewTransformable.object);

            /** @private */
            this._canvasWidth = this._targetXml3d.width || 800;

            /** @private */
            this._canvasHeight = this._targetXml3d.height || 600;

            /** @private */
            this._currentAction = this.NONE;

            /** @private */
            this._lastMousePos = {
                x : -1,
                y : -1
            };

            /** @private */
            if(options.eventDispatcher)
                this._eventDispatcher = options.eventDispatcher;
            else
                this._eventDispatcher = this._createDefaultEventDispatcher();
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @protected
         */
        doActivate: function(action) {},

        /**
         *  @this {XMOT.MouseExamineController}
         *  @protected
         */
        doDeactivate: function(action) {},

        /**
         *  @this {XMOT.MouseExamineController}
         *  @protected
         */
        doAction: function(action) {},

        /**
         *  @this {XMOT.MouseExamineController}
         */
        getScene: function() {
            return this._targetXml3d;
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @protected
         *  @override
         */
        onAttach: function() {
            this._toggleAttached(true);
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @protected
         *  @override
         */
        onDetach: function() {
            this._toggleAttached(false);
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @private
         */
        _toggleAttached: function(doAttach) {

            var regFn = this._eventDispatcher.on.bind(this._eventDispatcher);

            if(!doAttach) {
                regFn = this._eventDispatcher.off.bind(this._eventDispatcher);
            }

            regFn(this._targetXml3d, "mousedown", this._onXML3DMouseDown.bind(this));
            regFn(document.body, "mousemove", this._onBodyMouseMove.bind(this));
            regFn(document.body, "mouseup", this._onBodyMouseUp.bind(this));
        },

        // --- Callbacks ---

        /**
         *  @this {XMOT.MouseExamineController}
         *  @private
         */
        _onXML3DMouseDown: function(evt) {

            this.doActivate(this._constructAction(evt));
            this._rememberPosition(evt);
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @private
         */
        _onBodyMouseMove: function(evt) {

            this.doAction(this._constructAction(evt));
            this._rememberPosition(evt);
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @private
         */
        _onBodyMouseUp: function(evt) {
            this.doDeactivate(this._constructAction(evt));
            this._rememberPosition(evt);
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @private
         */
        _rememberPosition: function(evt) {
            this._lastMousePos.x = evt.pageX;
            this._lastMousePos.y = evt.pageY;
        },

        // --- Utils ---

        /**
         *  @this {XMOT.MouseExamineController}
         *  @private
         */
        _createDefaultEventDispatcher: function() {

            var disp = new XMOT.util.EventDispatcher();

            disp.registerCustomHandler("mousedown", function(evt){
                if(evt.button === XMOT.MOUSEBUTTON_LEFT
                || evt.button === XMOT.MOUSEBUTTON_RIGHT)
                    return true;

                return false;
            });

            return disp;
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @private
         */
        _constructAction: function(evt) {

            var deltaX = (evt.pageX - this._lastMousePos.x) / this._canvasWidth;
            var deltaY = (evt.pageY - this._lastMousePos.y) / this._canvasHeight;

            return {
                evt: evt,
                pos: {x: evt.pageX / this._canvasWidth, y: evt.pageY / this._canvasHeight},
                delta: {x: deltaX, y: deltaY}
            };
        }
    });
}());