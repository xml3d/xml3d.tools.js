(function(){

    "use strict";

    /** This controller brings together the mouse control and XMOT.HemisphereControllerBehavior
     *  to provide examine mode navigation using the mouse.
     *
     *  @constructor
     */
    XMOT.MouseHemisphereController = new XMOT.Class(XMOT.MouseController, {

        // interaction types
        NONE: 0,
        ROTATE: 1,
        DOLLY: 2,

        /**
         *  @this {XMOT.MouseHemisphereController}
         */
        initialize: function(targetViewTransformable, options) {

            this.callSuper(targetViewTransformable, options);

            this._controller = new XMOT.HemisphereControllerBehavior(targetViewTransformable, options);
            this._currentAction = this.NONE;
        },

        /**
         *  @this {XMOT.MouseHemisphereController}
         *  @override
         */
        doActivate: function(action) {

            this._currentAction = this.ROTATE;
            if(action.evt.button === XMOT.MOUSEBUTTON_RIGHT)
                this._currentAction = this.DOLLY;
        },

        /**
         *  @this {XMOT.MouseHemisphereController}
         *  @override
         */
        doAction: function(action) {

            switch (this._currentAction) {
            case this.DOLLY:
                this._controller.doDollyAction(action.delta.x, action.delta.y);
                break;

            case this.ROTATE:
                this._controller.doRotateAction(action.delta.x, action.delta.y);
                break;
            }
        },

        /**
         *  @this {XMOT.MouseHemisphereController}
         *  @override
         */
        doDeactivate: function(action) {
            this._currentAction = this.NONE;
        }
    });
}());