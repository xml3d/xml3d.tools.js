(function(){

    "use strict";

    /** This controller brings together the mouse control and XMOT.ExamineBehavior
     *  to provide examine mode navigation using the mouse.
     *
     *  @constructor
     */
    XMOT.MouseExamineController = new XMOT.Class(XMOT.MouseController, {

        // interaction types
        NONE: 0,
        ROTATE: 1,
        DOLLY: 2,

        /**
         *  @this {XMOT.MouseExamineController}
         *  @inheritDoc
         */
        initialize: function(targetViewGroup, options) {

            var options = options || {};
            if(options.eventDispatcher === undefined)
                options.eventDispatcher = this._createMouseEventDispatcher();

            this.callSuper(targetViewGroup, options);

            this.behavior = new XMOT.ExamineBehavior(this.target, options);
            this._currentAction = this.NONE;
        },

        /** Resets the camera pose to look at the whole scene.
         *
         *  @this {XMOT.MouseExamineController}
         *  @param {number=} distance to the scene center, default: scene's aabb diagonal
         *  @return {boolean} true if the transformation was actually performed
         */
        lookAtScene: function(distanceToSceneCenter) {
            return this.behavior.lookAtScene(distanceToSceneCenter);
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @param {window.XML3DVec3} targetPt
         *  @return {boolean} whether the transformation has been actually applied
         */
        lookAt: function(targetPt) {
            return this.behavior.lookAt(targetPt);
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @param {window.XML3DVec3} newExamineOrigin
         *  @param {number} distanceToExamineOrigin
         *  @return {boolean} true if the reset was successful
         */
        resetTargetPose: function(newExamineOrigin, distanceToExamineOrigin) {
            return this.behavior.resetTargetPose(newExamineOrigin, distanceToExamineOrigin);
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @param {number} delta the value of how much to dolly from the current pose
         *  @return {boolean} true if the dolly action was actually performed
         */
        dolly: function(delta) {
            return this.behavior.dolly(delta);
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @param {window.XML3DRotation} orientation
         *  @return {boolean} true if the rotate action was actually performed
         */
        rotate: function(orientation) {
            return this.behavior.rotate(orientation);
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @param {number} deltaXAxis the value on how much to scale on the x-axis
         *  @param {number} deltaYAxis the value on how much to scale on the y-axis
         *  @return {boolean} true if the rotate action was actually performed
         */
        rotateByAngles: function(deltaXAxis, deltaYAxis) {
            return this.behavior.rotateByAngles(deltaXAxis, deltaYAxis);
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @inheritDoc
         */
        onAttach: function() {
            this.callSuper();
            this.behavior.attach();
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @inheritDoc
         */
        onDetach: function() {
            this.callSuper();
            this.behavior.detach();
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @override
         */
        onDragStart: function(action) {

            this._currentAction = this.ROTATE;
            if(action.evt.button === XMOT.MOUSEBUTTON_RIGHT)
                this._currentAction = this.DOLLY;
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @override
         */
        onDrag: function(action) {

            switch (this._currentAction) {
            case this.DOLLY:
                this.behavior.dolly(action.delta.y);
                break;

            case this.ROTATE:
                this.behavior.rotateByAngles(action.delta.y, action.delta.x);
                break;
            }
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @override
         */
        onDragEnd: function(action) {
            this._currentAction = this.NONE;
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @private
         */
        _createMouseEventDispatcher: function() {

            var disp = new XMOT.util.EventDispatcher();

            disp.registerCustomHandler("mousedown", function(evt){
                if(evt.button === XMOT.MOUSEBUTTON_LEFT
                || evt.button === XMOT.MOUSEBUTTON_RIGHT)
                    return true;

                return false;
            });

            return disp;
        }
    });
}());
