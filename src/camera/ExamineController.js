(function(){

    "use strict";

    /** This controller brings together mouse control, touch control and XMOT.ExamineBehavior
     *  to provide examine mode navigation using the mouse or the touchpad.
     *
     *  @constructor
     */
    XMOT.ExamineController = new XMOT.Class(XMOT.util.Attachable, {

        // interaction types
        NONE: 0,
        ROTATE: 1,
        DOLLY: 2,

        /**
         *  @this {XMOT.MouseExamineController}
         *  @inheritDoc
         */
        initialize: function(targetViewGroup, options) {

            this.callSuper();

            this.target = XMOT.util.getOrCreateTransformable(targetViewGroup);

            var options = options || {};
            if(options.mouseEventDispatcher === undefined)
                options.mouseEventDispatcher = this._createMouseEventDispatcher();
            if(options.touchEventDispatcher === undefined)
                options.touchEventDispatcher = this._createTouchEventDispatcher();

            this._mouseController = new XMOT.MouseController(this.target, options);
            this._mouseController.setEventDispatcher(options.mouseEventDispatcher);
            this._mouseController.onDragStart = this.callback("onMouseDragStart");
            this._mouseController.onDrag = this.callback("onMouseDrag");
            this._mouseController.onDragEnd = this.callback("onMouseDragEnd");

            this._touchController = new XMOT.TouchController(this.target, options);
            this._touchController.setEventDispatcher(options.touchEventDispatcher);
            this._touchController.onDragStart = this.callback("onTouchDragStart");
            this._touchController.onDrag = this.callback("onTouchDrag");
            this._touchController.onDragEnd = this.callback("onTouchDragEnd");

            this.behavior = new XMOT.ExamineBehavior(this.target, options);
            this._currentAction = this.NONE;
        },

        /** Resets the camera pose to look at the whole scene.
         *
         *  @this {XMOT.MouseExamineController}
         *  @param {number=} distance to the scene center, default: scene's aabb diagonal
         */
        lookAtScene: function(distanceToSceneCenter) {
            this.behavior.lookAtScene(distanceToSceneCenter);
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @param {window.XML3DVec3} targetPt
         *  @param {number=} distanceToPoint. Default: examine origin reset distance
         */
        lookAt: function(targetPt, distanceToPoint) {
            this.behavior.lookAt(targetPt, distanceToPoint);
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
            this._mouseController.attach();
            this._touchController.attach();
            this.behavior.attach();
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @inheritDoc
         */
        onDetach: function() {
            this._mouseController.detach();
            this._touchController.detach();
            this.behavior.detach();
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @override
         */
        onMouseDragStart: function(action) {

            this._currentAction = this.ROTATE;
            if(action.evt.button === XMOT.MOUSEBUTTON_RIGHT)
                this._currentAction = this.DOLLY;
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @override
         */
        onMouseDrag: function(action) {

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
         *  @this {XMOT.MouseExamineController}
         *  @override
         */
        onMouseDragEnd: function(action) {
            this._currentAction = this.NONE;
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @override
         */
        onTouchDragStart: function(action) {

            this._currentAction = this.ROTATE;
            if(action.evt.touches.length > 1)
                this._currentAction = this.DOLLY;
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @override
         */
        onTouchDrag: function(action) {

            switch (this._currentAction) {
                case this.DOLLY:
                    this.behavior.dolly(action.zoom);
                    break;

                case this.ROTATE:
                    this.behavior.rotateByAngles(-action.deltas[0].y, -action.deltas[0].x);
                    break;
            }
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @override
         */
        onTouchDragEnd: function(action) {
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
        },

        /**
         *  @this {XMOT.MouseExamineController}
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
