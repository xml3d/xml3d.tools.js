(function(){

    "use strict";

    /** This controller brings together the mouse control and XMOT.ExamineControllerBehavior
     *  to provide examine mode navigation using the mouse.
     *
     *  @constructor
     */
    XMOT.MouseKeyboardFlyController = new XMOT.Class(XMOT.util.Attachable, {

        /**
         *  options:
         *  o behavior: options to be passed to XMOT.FlyControllerBehavior
         *  o mouse: options to be passed to XMOT.MouseController
         *  o keyboard: options to be passed to XMOT.KeyboardController
         *
         *  By default, the view can be rotated using the left mouse button,
         *  and movement can be done using W,A,S,D keys.
         *
         *  @this {XMOT.MouseKeyboardFlyController}
         */
        initialize: function(targetViewTransformable, options) {

            this.callSuper();

            var options = options || {};
            options.behavior = options.behavior || {};
            options.mouse = options.mouse || {};
            options.keyboard = options.keyboard || {};

            this.target = targetViewTransformable;

            this._behavior = new XMOT.FlyControllerBehavior(targetViewTransformable, options.behavior);

            if(options.mouse.eventDispatcher === undefined)
                options.mouse.eventDispatcher = this._createMouseEventDispatcher();

            this._mouseCtrl = new XMOT.MouseController(targetViewTransformable, options.mouse);
            this._mouseCtrl.onDrag = this.callback("_onDrag");

            this._keyCtrl = new XMOT.KeyboardController(targetViewTransformable, options.keyboard);
            this._keyCtrl.onKeyDown = this.callback("_onKeyDown");
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
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         *  @protected
         *  @override
         */
        onDetach: function() {
            this._mouseCtrl.detach();
            this._keyCtrl.detach();
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         *  @private
         */
        _onDrag: function(action) {
            this._behavior.rotate(action.delta.x, action.delta.y);
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         *  @private
         */
        _onKeyDown: function(evt) {

            switch(evt.keyCode) {
            case XMOT.KEY_W:
                this._behavior.moveForward();
                break;
            case XMOT.KEY_S:
                this._behavior.moveBackward();
                break;
            case XMOT.KEY_A:
                this._behavior.stepLeft();
                break;
            case XMOT.KEY_D:
                this._behavior.stepRight();
                break;
            }
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