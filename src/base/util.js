(function() {

    "use strict";

    /**
     * global variable, used to check if an animation or movement is currently in progress
     */
    XML3D.tools.animating = false;

    /**
     * global variable, set a function, which is called within the animation loop
     */
    XML3D.tools.animationHook = undefined;

    /**
     * a cameracontroller register here and the update of the gamepad is called
     */
    XML3D.tools.registeredCameraController = undefined;

    /**
     * Updates all the Tweens until all animations are finished and calls the hook.
     */
    XML3D.tools.animate = function(){
        if(TWEEN.getAll().length || XML3D.tools.animationHook || XML3D.tools.registeredCameraController) {
            window.requestAnimFrame(XML3D.tools.animate, undefined);
            if(XML3D.tools.animationHook) XML3D.tools.animationHook();
            if(XML3D.tools.registeredCameraController) XML3D.tools.registeredCameraController.update();
            TWEEN.update();
        }
        else
            XML3D.tools.animating = false;
    };

    /**
     * Merges two optionsobjects
     * @param {{duration: number, loop: number, delay: number, easing: Function, callback: Function}} high options with high priority
     * @param {{duration: number, loop: number, delay: number, easing: Function, callback: Function}} low options with low priority
     * @return {{duration: number, loop: number, delay: number, easing: Function, callback: Function}} merged options
     */
    XML3D.tools.mergeOptions = function(high, low){
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
     *  namespace("XML3D.tools.interaction.behaviors"]) will create:
     *
     *  XML3D.tools.interaction.behaviors
     */
    XML3D.tools.namespace = function(fullName)
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
     *  @return {Object} the given, updated target object
     */
    XML3D.tools.extend = function(tarobj, srcobj)
    {
        for(var attr in srcobj)
            tarobj[attr] = srcobj[attr];

        return tarobj;
    };
}());
