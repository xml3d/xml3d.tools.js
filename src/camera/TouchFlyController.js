(function(){

    "use strict";

    /** This controller brings together the touch control and XML3D.tools.FlyBehavior
     *  to provide fly mode navigation using touch.
     *
     *  @constructor
     */
    XML3D.tools.TouchFlyController = new XML3D.tools.Class(XML3D.tools.util.Attachable, {

        /**
         *  @this {XML3D.tools.TouchFlyController}
         *  @param {Element|Transformable} targetViewGroup
         *  @param {Object} options
         *
         *  options:
         *  o behavior: options to be passed to XML3D.tools.FlyBehavior
         *  o touch: options to be passed to XML3D.tools.TouchController
         *
         *  By default, the view can be rotated using the movement of a single finger,
         *  and movement can be done using zoom/pinch gestures.
         */
        initialize: function(targetViewGroup, options) {

            this.callSuper();

            var options = options || {};
            options.behavior = options.behavior || {};
            options.touch = options.touch || {};

            this.target = XML3D.tools.util.getOrCreateTransformable(targetViewGroup);

            this._behavior = new XML3D.tools.FlyBehavior(this.target, options.behavior);

            this._touchCtrl = new XML3D.tools.TouchController(this.target, options.touch);
            this._touchCtrl.onDrag = this.callback("_onDrag");
        },

        lookAt: function(point) {
            this._behavior.lookAt(point);
        },

        /**
         *  @this {XML3D.tools.TouchFlyController}
         */
        setPosition: function(position) {
            this._behavior.setPosition(position);
        },

        /**
         *  @this {XML3D.tools.TouchFlyController}
         */
        setOrientation: function(orientation) {
            this._behavior.setOrientation(orientation);
        },

        /**
         *  @this {XML3D.tools.TouchFlyController}
         */
        getPosition: function() {
            return this._behavior.getPosition();
        },

        /**
         *  @this {XML3D.tools.TouchFlyController}
         */
        getOrientation: function() {
            return this._behavior.getOrientation();
        },

        /**
         *  @this {XML3D.tools.TouchFlyController}
         */
        getMoveSpeed: function() {
            return this._behavior.getMoveSpeed();
        },

        /**
         *  @this {XML3D.tools.TouchFlyController}
         */
        setMoveSpeed: function(speed) {
            this._behavior.setMoveSpeed(speed);
        },

        /**
         *  @this {XML3D.tools.TouchFlyController}
         */
        getRotationSpeed: function() {
            return this._behavior.getRotationSpeed();
        },

        /**
         *  @this {XML3D.tools.TouchFlyController}
         */
        setRotationSpeed: function(speed) {
            this._behavior.setRotationSpeed(speed);
        },

        /**
         *  @this {XML3D.tools.TouchFlyController}
         *  @protected
         *  @override
         */
        onAttach: function() {
            this._touchCtrl.attach();
        },

        /**
         *  @this {XML3D.tools.TouchFlyController}
         *  @protected
         *  @override
         */
        onDetach: function() {
            this._touchCtrl.detach();
        },

        /**
         *  @this {XML3D.tools.TouchFlyController}
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
        }
    });
}());
