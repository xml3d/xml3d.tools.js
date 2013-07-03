(function(){

    "use strict";

    /** This controller brings together the touch control and XMOT.FlyBehavior
     *  to provide fly mode navigation using touch.
     *
     *  @constructor
     */
    XMOT.TouchFlyController = new XMOT.Class(XMOT.util.Attachable, {

        /**
         *  @this {XMOT.TouchFlyController}
         *  @param {Element|Transformable} targetViewGroup
         *  @param {Object} options
         *
         *  options:
         *  o behavior: options to be passed to XMOT.FlyBehavior
         *  o touch: options to be passed to XMOT.TouchController
         *
         *  By default, the view can be rotated using the movement of a single finger,
         *  and movement can be done using zoom/pinch gestures.
         */
        initialize: function(targetViewGroup, options) {

            this.callSuper();

            var options = options || {};
            options.behavior = options.behavior || {};
            options.touch = options.touch || {};

            this.target = XMOT.util.getOrCreateTransformable(targetViewGroup);

            this._behavior = new XMOT.FlyBehavior(this.target, options.behavior);

            if(options.touch.eventDispatcher === undefined)
                options.touch.eventDispatcher = this._createTouchEventDispatcher();

            this._touchCtrl = new XMOT.TouchController(this.target, options.touch);
            this._touchCtrl.onDrag = this.callback("_onDrag");
        },

        lookAt: function(point) {
            this._behavior.lookAt(point);
        },

        /**
         *  @this {XMOT.TouchFlyController}
         */
        setPosition: function(position) {
            this._behavior.setPosition(position);
        },

        /**
         *  @this {XMOT.TouchFlyController}
         */
        setOrientation: function(orientation) {
            this._behavior.setOrientation(orientation);
        },

        /**
         *  @this {XMOT.TouchFlyController}
         */
        getPosition: function() {
            return this._behavior.getPosition();
        },

        /**
         *  @this {XMOT.TouchFlyController}
         */
        getOrientation: function() {
            return this._behavior.getOrientation();
        },

        /**
         *  @this {XMOT.TouchFlyController}
         */
        getMoveSpeed: function() {
            return this._behavior.getMoveSpeed();
        },

        /**
         *  @this {XMOT.TouchFlyController}
         */
        setMoveSpeed: function(speed) {
            this._behavior.setMoveSpeed(speed);
        },

        /**
         *  @this {XMOT.TouchFlyController}
         */
        getRotationSpeed: function() {
            return this._behavior.getRotationSpeed();
        },

        /**
         *  @this {XMOT.TouchFlyController}
         */
        setRotationSpeed: function(speed) {
            this._behavior.setRotationSpeed(speed);
        },

        /**
         *  @this {XMOT.TouchFlyController}
         *  @protected
         *  @override
         */
        onAttach: function() {
            this._touchCtrl.attach();
        },

        /**
         *  @this {XMOT.TouchFlyController}
         *  @protected
         *  @override
         */
        onDetach: function() {
            this._touchCtrl.detach();
        },

        /**
         *  @this {XMOT.TouchFlyController}
         *  @private
         */
        _onDrag: function(action) {
            if (action.evt.touches.length > 1) {
                if (action.zoom > 1.0) { this._behavior.moveForward(); }
                if (action.zoom < 1.0) { this._behavior.moveBackward(); }
            } else {
                //invert delta to represent touch-"dragging" of a point
                this._behavior.rotate(-action.deltas[0].y, -action.deltas[0].x);
            }
        },


        /**
         *  @this {XMOT.TouchFlyController}
         *  @private
         */
        _createTouchEventDispatcher: function() {

            var disp = new XMOT.util.EventDispatcher();

            disp.registerCustomHandler('touchstart', function(evt){
                if(evt.type === 'touchstart')
                    return true;

                return false;
            });

            return disp;
        }
    });
}());
