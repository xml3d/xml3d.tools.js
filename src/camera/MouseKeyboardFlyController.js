(function(){

    "use strict";

    /** This controller brings together the mouse control and XMOT.FlyBehavior
     *  to provide fly mode navigation using the mouse and keyboard.
     *
     *  @constructor
     */
    XMOT.MouseKeyboardFlyController = new XMOT.Class(XMOT.util.Attachable, {

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         *  @param {Element|Transformable} targetViewGroup
         *  @param {Object} options
         *
         *  options:
         *  o behavior: options to be passed to XMOT.FlyBehavior
         *  o mouse: options to be passed to XMOT.MouseController
         *  o keyboard: options to be passed to XMOT.KeyboardController
         *
         *  By default, the view can be rotated using the left mouse button,
         *  and movement can be done using W,A,S,D keys.
         */
        initialize: function(targetViewGroup, options) {

            this.callSuper();

            var options = options || {};
            options.behavior = options.behavior || {};
            options.mouse = options.mouse || {};
            options.keyboard = options.keyboard || {};

            this.target = XMOT.util.getOrCreateTransformable(targetViewGroup);

            this._behavior = new XMOT.FlyBehavior(this.target, options.behavior);

            if(options.mouse.eventDispatcher === undefined)
                options.mouse.eventDispatcher = this._createMouseEventDispatcher();

            this._mouseCtrl = new XMOT.MouseController(this.target, options.mouse);
            this._mouseCtrl.onDrag = this.callback("_onDrag");

            this._keyCtrl = new XMOT.KeyboardController(this.target, options.keyboard);
            this._keyCtrl.onKeyDown = this.callback("_onKeyDown");
            this._keyCtrl.onKeyUp = this.callback("_onKeyUp");

            this._continuousInputProcessing = false;

            /** map keyvalue => boolean */
            this._currentlyPressedKeys = {};
        },

        lookAt: function(point) {
            this._behavior.lookAt(point);
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         */
        setPosition: function(position) {
            this._behavior.setPosition(position);
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         */
        setOrientation: function(orientation) {
            this._behavior.setOrientation(orientation);
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         */
        getPosition: function() {
            return this._behavior.getPosition();
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         */
        getOrientation: function() {
            return this._behavior.getOrientation();
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         */
        getMoveSpeed: function() {
            return this._behavior.getMoveSpeed();
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         */
        setMoveSpeed: function(speed) {
            this._behavior.setMoveSpeed(speed);
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         */
        getRotationSpeed: function() {
            return this._behavior.getRotationSpeed();
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         */
        setRotationSpeed: function(speed) {
            this._behavior.setRotationSpeed(speed);
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         *  @protected
         *  @override
         */
        onAttach: function() {
            this._mouseCtrl.attach();
            this._keyCtrl.attach();
            this._startInputProcessingLoop();
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         *  @protected
         *  @override
         */
        onDetach: function() {
            this._mouseCtrl.detach();
            this._keyCtrl.detach();
            this._stopInputProcessingLoop();
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         *  @private
         */
        _onDrag: function(action) {
            // we want mouse x-axis movement to map to y-axis rotation
            // so we flip the delta values
            this._behavior.rotate(action.delta.y, action.delta.x);
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         *  @private
         */
        _onKeyDown: function(evt) {

            this._currentlyPressedKeys[evt.keyCode] = true;
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         *  @private
         */
        _onKeyUp: function(evt) {

            this._currentlyPressedKeys[evt.keyCode] = false;
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         *  @private
         */
        _startInputProcessingLoop: function() {
            this._continuousInputProcessing = true;
            this._inputProcessingLoop();
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         *  @private
         */
        _stopInputProcessingLoop: function() {
            this._continuousInputProcessing = false;
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         *  @private
         */
        _inputProcessingLoop: function() {

            if(!this._continuousInputProcessing) {
                return;
            }

            if(this._currentlyPressedKeys[XMOT.KEY_W] === true) {
                this._behavior.moveForward();
            }
            if(this._currentlyPressedKeys[XMOT.KEY_S] === true) {
                this._behavior.moveBackward();
            }
            if(this._currentlyPressedKeys[XMOT.KEY_A] === true) {
                this._behavior.stepLeft();
            }
            if(this._currentlyPressedKeys[XMOT.KEY_D] === true) {
                this._behavior.stepRight();
            }

            window.requestAnimationFrame(this.callback("_inputProcessingLoop"));
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         *  @private
         */
        _createMouseEventDispatcher: function() {

            var disp = new XMOT.util.EventDispatcher();

            disp.registerCustomHandler("mousedown", function(evt){
                if(evt.button === XMOT.MOUSEBUTTON_LEFT)
                    return true;

                return false;
            });

            return disp;
        }
    });
}());
