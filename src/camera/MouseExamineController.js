(function(){

    "use strict";

    /** This controller brings together the mouse control and XMOT.ExamineControllerBehavior
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
         *
         *  options:
         *  o behaviorType: the behavior to be instantiated. Default: XMOT.ExamineControllerBehavior
         */
        initialize: function(targetViewGroup, options) {

            var options = options || {};
            if(options.eventDispatcher === undefined)
                options.eventDispatcher = this._createMouseEventDispatcher();

            this.callSuper(targetViewGroup, options);

            var BehaviorType = options.behaviorType || XMOT.ExamineControllerBehavior;
            this._controller = new BehaviorType(this.target, options);
            this._currentAction = this.NONE;
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @param {window.XML3DVec3} targetPt
         */
        lookAt: function(newExamineOrigin) {
            this._controller.lookAt(newExamineOrigin);
        },

        /** Resets the camera pose to look at the whole scene.
         *
         *  @this {XMOT.MouseExamineController}
         *  @param {number=} distance to the scene center, default: scene's aabb diagonal
         */
        lookAtScene: function(distanceToSceneCenter) {
            this._controller.lookAtScene(distanceToSceneCenter);
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @param {window.XML3DVec3} newExamineOrigin
         *  @param {number} distanceToExamineOrigin
         */
        resetTargetPose: function(newExamineOrigin, distanceToExamineOrigin) {
            this._controller.resetTargetPose(newExamineOrigin, distanceToExamineOrigin);
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @override
         */
        onAttach: function() {
            this.callSuper();
            this._controller.lookAt(this._controller.getExamineOrigin());
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
                this._controller.dolly(action.delta.y);
                break;

            case this.ROTATE:
                this._controller.rotate(action.delta.y, action.delta.x);
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
