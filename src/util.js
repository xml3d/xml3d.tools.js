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

/**
 * Converts axis angle representation into an quaternion
 * @param {Array.<number>} axis
 * @param {number} angle
 * @return {Array.<number>} quaternion
 */
function axisAngleToQuaternion(axis, angle){
	var normAxis = XMOT.normalizeVector(axis);
	var quat = [];
	var s = Math.sin(angle/2);
	quat[0] = normAxis[0] *s;
	quat[1] = normAxis[1] *s;
	quat[2] = normAxis[2] *s;
	quat[3] = Math.cos(angle/2);
	return quat;
}

/**
 * Normalizes a 3D vector
 * @param {Array.<number>} vector
 * @return {Array.<number>} normalized vector
 */
function normalizeVector(vector){
	var length = Math.sqrt( vector[0]*vector[0] + vector[1]*vector[1] + vector[2]*vector[2] );
	if(length == 0) return vector;
	return [vector[0]/length, vector[1]/length, vector[2]/length];
}

//export
XMOT.animate = animate;
XMOT.animating = animating;
XMOT.animationHook = animationHook;
XMOT.axisAngleToQuaternion = axisAngleToQuaternion;
XMOT.normalizeVector = normalizeVector;
}());