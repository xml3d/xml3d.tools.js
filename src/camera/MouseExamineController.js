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
         *  options:
         *  o behaviorType: the behavior to be instantiated. Default: XMOT.ExamineControllerBehavior
         *
         *  @this {XMOT.MouseExamineController}
         */
        initialize: function(targetViewTransformable, options) {

            var options = options || {};
            if(options.eventDispatcher === undefined)
                options.eventDispatcher = this._createMouseEventDispatcher();

            this.callSuper(targetViewTransformable, options);

            var BehaviorType = options.behaviorType || XMOT.ExamineControllerBehavior;
            this._controller = new BehaviorType(targetViewTransformable, options);
            this._currentAction = this.NONE;
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
                this._controller.dolly(action.delta.x, action.delta.y);
                break;

            case this.ROTATE:
                this._controller.rotate(action.delta.x, action.delta.y);
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
