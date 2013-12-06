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
         */
        initialize: function(targetViewGroup, options) {

            var options = options || {};
            if(options.eventDispatcher === undefined)
                options.eventDispatcher = this._createMouseEventDispatcher();

            this.callSuper(targetViewGroup, options);

            this.behavior = new XML3D.tools.ExamineBehavior(this.target, options);
            this._currentAction = this.NONE;
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

            this._currentAction = this.ROTATE;
            if(action.evt.button === XML3D.tools.MOUSEBUTTON_RIGHT)
                this._currentAction = this.DOLLY;
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
                if(evt.button === XML3D.tools.MOUSEBUTTON_LEFT
                || evt.button === XML3D.tools.MOUSEBUTTON_RIGHT)
                    return true;

                return false;
            });

            return disp;
        }
    });
}());
