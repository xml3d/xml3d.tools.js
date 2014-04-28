(function(){

    "use strict";

    /** This controller brings together the mouse control and XML3D.tools.ExamineBehavior
     *  to provide examine mode navigation using the mouse.
     *
     *  @constructor
     */
    XML3D.tools.MouseExamineController = new XML3D.tools.Class(XML3D.tools.MouseController, {

        // interaction types
        NONE: 0,
        ROTATE: 1,
        DOLLY: 2,

        /**
         *  @this {XML3D.tools.MouseExamineController}
         *  @inheritDoc
         *
         *  The options can be a "controls" object with the following attributes:
         *  o rotate: which mouse button is used for rotation, default left
         *  o dolly: which mouse button is used for dolly, default right
         */
        initialize: function(targetViewGroup, options) {

            var options = options || {};
            options.controls = options.controls || {};
            options.eventDispatcher = this._createMouseEventDispatcher();
            this.callSuper(targetViewGroup, options);

            this.behavior = new XML3D.tools.ExamineBehavior(this.target, options);
            this._currentAction = this.NONE;

            this._controls = this._createControls(options);
        },

        _createControls: function(options) {

            return {
                rotate: options.controls.rotate || XML3D.tools.MOUSEBUTTON_LEFT,
                dolly: options.controls.dolly || XML3D.tools.MOUSEBUTTON_RIGHT
            };
        },

        /** Resets the camera pose to look at the whole scene.
         *
         *  @this {XML3D.tools.MouseExamineController}
         *  @param {number=} distance to the scene center, default: scene's aabb diagonal
         */
        lookAtScene: function(distanceToSceneCenter) {
            this.behavior.lookAtScene(distanceToSceneCenter);
        },

        /**
         *  @this {XML3D.tools.MouseExamineController}
         *  @param {window.XML3DVec3} targetPt
         *  @param {number=} distanceToPoint. Default: examine origin reset distance
         */
        lookAt: function(targetPt, distanceToPoint) {
            this.behavior.lookAt(targetPt, distanceToPoint);
        },

        /**
         *  @this {XML3D.tools.MouseExamineController}
         *  @param {number} delta the value of how much to dolly from the current pose
         *  @return {boolean} true if the dolly action was actually performed
         */
        dolly: function(delta) {
            return this.behavior.dolly(delta);
        },

        /**
         *  @this {XML3D.tools.MouseExamineController}
         *  @param {window.XML3DRotation} orientation
         *  @return {boolean} true if the rotate action was actually performed
         */
        rotate: function(orientation) {
            return this.behavior.rotate(orientation);
        },

        /**
         *  @this {XML3D.tools.MouseExamineController}
         *  @param {number} deltaXAxis the value on how much to scale on the x-axis
         *  @param {number} deltaYAxis the value on how much to scale on the y-axis
         *  @return {boolean} true if the rotate action was actually performed
         */
        rotateByAngles: function(deltaXAxis, deltaYAxis) {
            return this.behavior.rotateByAngles(deltaXAxis, deltaYAxis);
        },

        /**
         *  @this {XML3D.tools.MouseExamineController}
         *  @inheritDoc
         */
        onAttach: function() {
            this.callSuper();
            this.behavior.attach();
        },

        /**
         *  @this {XML3D.tools.MouseExamineController}
         *  @inheritDoc
         */
        onDetach: function() {
            this.callSuper();
            this.behavior.detach();
        },

        /**
         *  @this {XML3D.tools.MouseExamineController}
         *  @override
         */
        onDragStart: function(action) {

            this._currentAction = this.NONE;
            switch(action.evt.button)
            {
            case this._controls.rotate:
                this._currentAction = this.ROTATE;
                break;
            case this._controls.dolly:
                this._currentAction = this.DOLLY;
                break;
            }
        },

        /**
         *  @this {XML3D.tools.MouseExamineController}
         *  @override
         */
        onDrag: function(action) {

            switch (this._currentAction) {
            case this.DOLLY:
                this.behavior.dolly(action.delta.y);
                break;

            case this.ROTATE:
                this.behavior.rotateByAngles(-action.delta.y, -action.delta.x);
                break;
            }
        },

        /**
         *  @this {XML3D.tools.MouseExamineController}
         *  @override
         */
        onDragEnd: function(action) {
            this._currentAction = this.NONE;
        },

        /**
         *  @this {XML3D.tools.MouseExamineController}
         *  @private
         */
        _createMouseEventDispatcher: function() {

            var disp = new XML3D.tools.util.EventDispatcher();

            disp.registerCustomHandler("mousedown", function(evt){
                if(evt.button === this._controls.rotate
                || evt.button === this._controls.dolly)
                    return true;

                return false;
            }.bind(this));

            return disp;
        }
    });
}());
