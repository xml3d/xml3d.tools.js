(function() {

    "use strict";

    /**
     * global variable, used to check if an animation or movement is currently in progress
     */
    XMOT.animating = false;

    /**
     * global variable, set a function, which is called within the animation loop
     */
    XMOT.animationHook = undefined;

    /**
     * a cameracontroller register here and the update of the gamepad is called
     */
    XMOT.registeredCameraController = undefined;

    /**
     * Updates all the Tweens until all animations are finished and calls the hook.
     */
    XMOT.animate = function(){
        if(TWEEN.getAll().length || XMOT.animationHook || XMOT.registeredCameraController) {
            window.requestAnimFrame(XMOT.animate, undefined);
            if(XMOT.animationHook) XMOT.animationHook();
            if(XMOT.registeredCameraController) XMOT.registeredCameraController.update();
            TWEEN.update();
        }
        else
            XMOT.animating = false;
    };

    /**
     * Merges two optionsobjects
     * @param {{duration: number, loop: number, delay: number, easing: Function, callback: Function}} high options with high priority
     * @param {{duration: number, loop: number, delay: number, easing: Function, callback: Function}} low options with low priority
     * @return {{duration: number, loop: number, delay: number, easing: Function, callback: Function}} merged options
     */
    XMOT.mergeOptions = function(high, low){
        var ret = {};
        high = high || {};
        low = low || {};
        ret.duration 	= high.duration || low.duration;
        ret.loop 		= high.loop 	|| low.loop;
        ret.delay 		= high.delay 	|| low.delay;
        ret.easing 		= high.easing 	|| low.easing;
        ret.callback 	= high.callback || low.callback;
        return ret;
    };

    /**
     *  Creates a namespace and subnamespaces, that are contained in the path.
     *
     *  @param {string} fullName the full name of the namespace
     *
     *  Example:
     *
     *  namespace("XMOT.interaction.behaviors"]) will create:
     *
     *  XMOT.interaction.behaviors
     */
    XMOT.namespace = function(fullName)
    {
        var curParentNS = window;

        var namespacePath = fullName.split(".");

        for(var i = 0; i < namespacePath.length; i++)
        {
            var ns = namespacePath[i];

            if(!curParentNS[ns])
                curParentNS[ns] = {};

            curParentNS = curParentNS[ns];
        }
    };

    /** Extend the target object with all attributes from the source object
     *
     *  @param tarobj the object to be extended
     *  @param srcobj the object from which to take the attributes
     */
    XMOT.extend = function(tarobj, srcobj)
    {
        for(var attr in srcobj)
            tarobj[attr] = srcobj[attr];
    };
}());
