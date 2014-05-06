(function(){

    "use strict";

    /** This controller brings together the mouse control and XML3D.tools.FlyBehavior
     *  to provide fly mode navigation using the mouse and keyboard.
     *
     *  @constructor
     */
    XML3D.tools.MouseKeyboardFlyController = new XML3D.tools.Class(XML3D.tools.util.Attachable, {

        /**
         *  @this {XML3D.tools.MouseKeyboardFlyController}
         *  @param {Element|Transformable} targetViewGroup
         *  @param {Object} options
         *
         *  options:
         *  o disableMovement: if true, no movement will be possible
         *  o disableRotation: if true, no looking around is possible
         *  o controls: an object that describes custom controls
         *
         *  Controls object attributes:
         *  o forward/backward/left/right: keys for movement, default w/s/a/d
         *  o useRotationActivator: whether to use a mouse button to activate view rotation
         *  o rotationActivator: the mouse button used to activate view rotation
         *
         *  For other options see FlyBehavior.
         *
         *  By default, the view can be rotated using the left mouse button,
         *  and movement can be done using W,A,S,D keys.
         */
        initialize: function(targetViewGroup, options) {

            this.callSuper();

            var options = options || {};
            options.controls = options.controls || {};

            this.target = XML3D.tools.util.getOrCreateTransformable(targetViewGroup);
            this.behavior = new XML3D.tools.FlyBehavior(this.target, options);
            this._initControllers();
            this._controls = this._createControls(options);

            this._continuousInputProcessing = false;
            /** map keyvalue => boolean */
            this._currentlyPressedKeys = {};
            this._disableMovement = (options.disableMovement === true);
            this._disableRotation = (options.disableRotation === true);
        },

        _initControllers: function() {

            this._mouseCtrl = new XML3D.tools.MouseController(this.target, {
                eventDispatcher: this._createMouseEventDispatcher()
            });
            this._mouseCtrl.onDrag = this.callback("_onDrag");

            this._keyCtrl = new XML3D.tools.KeyboardController(this.target);
            this._keyCtrl.onKeyDown = this.callback("_onKeyDown");
            this._keyCtrl.onKeyUp = this.callback("_onKeyUp");
        },

        _createControls: function(options) {

            var controls = {
                forward: options.controls.forward || XML3D.tools.KEY_W,
                left: options.controls.left || XML3D.tools.KEY_A,
                right: options.controls.right || XML3D.tools.KEY_D,
                backward: options.controls.backward || XML3D.tools.KEY_S,
                useRotationActivator: true,
                rotationActivator: options.controls.rotationActivator || XML3D.tools.MOUSEBUTTON_LEFT
            };

            if(options.useRotationActivator !== undefined)
                controls.useRotationActivator = options.useRotationActivator;

            return controls;
        },

        lookAt: function(point) {
            this.behavior.lookAt(point);
        },

        /**
         *  @this {XML3D.tools.MouseKeyboardFlyController}
         */
        getMoveSpeed: function() {
            return this.behavior.getMoveSpeed();
        },

        /**
         *  @this {XML3D.tools.MouseKeyboardFlyController}
         */
        setMoveSpeed: function(speed) {
            this.behavior.setMoveSpeed(speed);
        },

        /**
         *  @this {XML3D.tools.MouseKeyboardFlyController}
         */
        getRotationSpeed: function() {
            return this.behavior.getRotationSpeed();
        },

        /**
         *  @this {XML3D.tools.MouseKeyboardFlyController}
         */
        setRotationSpeed: function(speed) {
            this.behavior.setRotationSpeed(speed);
        },

        /**
         *  @this {XML3D.tools.MouseKeyboardFlyController}
         *  @protected
         *  @override
         */
        onAttach: function() {
            if(!this._disableRotation)
                this._mouseCtrl.attach();
            if(!this._disableMovement)
                this._keyCtrl.attach();
            this._startInputProcessingLoop();
        },

        /**
         *  @this {XML3D.tools.MouseKeyboardFlyController}
         *  @protected
         *  @override
         */
        onDetach: function() {
            this._mouseCtrl.detach();
            this._keyCtrl.detach();
            this._stopInputProcessingLoop();
        },

        /**
         *  @this {XML3D.tools.MouseKeyboardFlyController}
         *  @private
         */
        _onDrag: function(action) {
            // we want mouse x-axis movement to map to y-axis rotation
            // so we flip the delta values
            this.behavior.rotateByAngles(-action.delta.y, -action.delta.x);
        },

        /**
         *  @this {XML3D.tools.MouseKeyboardFlyController}
         *  @private
         */
        _onKeyDown: function(evt) {

            this._currentlyPressedKeys[evt.keyCode] = true;
        },

        /**
         *  @this {XML3D.tools.MouseKeyboardFlyController}
         *  @private
         */
        _onKeyUp: function(evt) {

            this._currentlyPressedKeys[evt.keyCode] = false;
        },

        /**
         *  @this {XML3D.tools.MouseKeyboardFlyController}
         *  @private
         */
        _startInputProcessingLoop: function() {
            this._continuousInputProcessing = true;
            this._inputProcessingLoop();
        },

        /**
         *  @this {XML3D.tools.MouseKeyboardFlyController}
         *  @private
         */
        _stopInputProcessingLoop: function() {
            this._continuousInputProcessing = false;
        },

        /**
         *  @this {XML3D.tools.MouseKeyboardFlyController}
         *  @private
         */
        _inputProcessingLoop: function() {

            if(!this._continuousInputProcessing) {
                return;
            }

            if(this._currentlyPressedKeys[this._controls.forward] === true) {
                this.behavior.moveForward();
            }
            if(this._currentlyPressedKeys[this._controls.backward] === true) {
                this.behavior.moveBackward();
            }
            if(this._currentlyPressedKeys[this._controls.left] === true) {
                this.behavior.stepLeft();
            }
            if(this._currentlyPressedKeys[this._controls.right] === true) {
                this.behavior.stepRight();
            }

            window.requestAnimationFrame(this.callback("_inputProcessingLoop"));
        },

        /**
         *  @this {XML3D.tools.MouseKeyboardFlyController}
         *  @private
         */
        _createMouseEventDispatcher: function() {

            var disp = new XML3D.tools.util.EventDispatcher();
            disp.registerCustomHandler("mousedown", function(evt){
                if(!this._controls.useRotationActivator)
                    return true;

                return evt.button === this._controls.rotationActivator;
            }.bind(this));

            return disp;
        }
    });
}());
