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

        /**
         *  @this {XMOT.MouseExamineController}
         *  @override
         */
        onAttach: function() {
            this.callSuper();
            this.behavior.lookAt(this.behavior.getExamineOrigin());
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
