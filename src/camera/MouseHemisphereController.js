(function(){

    "use strict";

    /** This controller brings together the mouse control and XMOT.HemisphereControllerBehavior
     *  to provide examine mode navigation using the mouse.
     *
     *  @constructor
     */
    XMOT.MouseHemisphereController = new XMOT.Class(XMOT.MouseExamineController, {

        /**
         *  @this {XMOT.MouseHemisphereController}
         *  @inheritDoc
         */
        initialize: function(targetViewGroup, options) {

            var options = options || {};
            options.behaviorType = XMOT.HemisphereControllerBehavior;
            this.callSuper(targetViewGroup, options);
        }
    });
}());
