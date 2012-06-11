(function() {
    
/**
 * global variable, used to check if an animation or movement is currently in progress
 */
var animating = false;

/**
 * global variable, set a function, which is called within the animation loop
 */
var animationHook = undefined;

/**
 * Updates all the Tweens until all animations are finished and calls the hook.
 */
function animate(){
	if(TWEEN.getAll().length || XMOT.animationHook) {
		window.requestAnimFrame(XMOT.animate);
		if(XMOT.animationHook !== undefined) XMOT.animationHook();
		TWEEN.update();
	}
	else
		XMOT.animating = false;
};

//export
XMOT.animate = animate;
XMOT.animating = animating;
XMOT.animationHook = animationHook;

}());