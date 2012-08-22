(function() {


//The functions inherit and base are taken out of the google closure project.
//Those functions are part of the Apache License (see Appache_License file)

/**
 * Inherit the prototype methods from one constructor into another.
 * Usage:
 * function Parent(a, b) {}
 * Parent.prototype.foo = function(a) {}
 * function Child(a, b, c) {
 *   base(this, a, b);
 * }
 * inherit(Child, Parent);
 *
 * var child = new Child('a', 'b', 'see');
 * child.foo(); // works
 *
 * A superclass' implementation of a method can be invoked as follows:
 * Child.prototype.foo = function(a) {
 *   Child.superClass_.foo.call(this, a);
 *   // other code
 * };
 * @param {Function} child Child class.
 * @param {Function} parent Parent class.
 */
function inherit(child, parent) {
	/** @constructor */
	function tmp() {};
	tmp.prototype = parent.prototype;
	child.superClass_ = parent.prototype;
	child.prototype = new tmp();
	child.prototype.constructor = child;
};

/**
 * Call up to the superclass.
 *
 * If this is called from a constructor, then this calls the superclass
 * contructor with arguments 1-N.
 *
 * If this is called from a prototype method, then you must pass
 * the name of the method as the second argument to this function. If
 * you do not, you will get a runtime error. This calls the superclass'
 * method with arguments 2-N.
 *
 * This function only works if you use inherit to express
 * inheritance relationships between your classes.
 *
 * This function is a compiler primitive. At compile-time, the
 * compiler will do macro expansion to remove a lot of
 * the extra overhead that this function introduces. The compiler
 * will also enforce a lot of the assumptions that this function
 * makes, and treat it as a compiler error if you break them.
 *
 * @param {!Object} me Should always be "this".
 * @param {*=} opt_methodName The method name if calling a super method.
 * @param {...*} var_args The rest of the arguments.
 * @return {*} The return value of the superclass method.
 */
function base(me, opt_methodName, var_args) {
	var caller = arguments.callee.caller;
	if (caller.superClass_) {
		// This is a constructor. Call the superclass constructor.
		return caller.superClass_.constructor.apply( me, Array.prototype.slice.call(arguments, 1) );
	}
	var args = Array.prototype.slice.call(arguments, 2);
	var foundCaller = false;
	for (var ctor = me.constructor; ctor; ctor = ctor.superClass_ && ctor.superClass_.constructor) {
		if (ctor.prototype[opt_methodName] === caller) {
			foundCaller = true;
		} else if (foundCaller) {
			return ctor.prototype[opt_methodName].apply(me, args);
		}
	}
	// If we did not find the caller in the prototype chain,
	// then one of two things happened:
	// 1) The caller is an instance method.
	// 2) This method was not called by the right caller.
	if (me[opt_methodName] === caller){
		return me.constructor.prototype[opt_methodName].apply(me, args);
	} else {
		throw "base called from a method of one name to a method of a different name";
	}
};

// ----------------------------------------------------------------------------

/**
 * global variable, used to check if an animation or movement is currently in progress
 */
var animating = false;

/**
 * global variable, set a function, which is called within the animation loop
 */
var animationHook = undefined;

/**
 * a cameracontroller register here and the update of the gamepad is called
 */
var registeredCameraController = undefined;

/**
 * Updates all the Tweens until all animations are finished and calls the hook.
 */
function animate(){
	if(TWEEN.getAll().length || XMOT.animationHook || XMOT.registeredCameraController) {
		window.requestAnimFrame(XMOT.animate);
		if(XMOT.animationHook) XMOT.animationHook();
		if(XMOT.registeredCameraController) XMOT.registeredCameraController.update();
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
};

/**
 * Normalizes a 3D vector
 * @param {Array.<number>} vector
 * @return {Array.<number>} normalized vector
 */
function normalizeVector(vector){
	var length = Math.sqrt( vector[0]*vector[0] + vector[1]*vector[1] + vector[2]*vector[2] );
	if(length == 0) return vector;
	return [vector[0]/length, vector[1]/length, vector[2]/length];
};

/**
 * Converts a quaternion into an axis angle representation
 * @param {Array.<number>} quat
 * @return {{axis: Array.<number>, angle:number}}
 */
function quaternionToAxisAngle(quat){
	quat4.normalize(quat); //normalise to avoid erros that may happen if qw > 1
	var angle = 2*Math.acos(quat[3]);
	var s = Math.sqrt(1-quat[3]*quat[3]);
	if(s < 0.00001 ) s = 1; //avoid div by zero, direction not important for small s
	var x = quat[0]/s;
	var y = quat[1]/s;
	var z = quat[2]/s;
	return {axis:[x,y,z], angle:angle};
};

/**
 * Interpolate between two quaternions the shortest way
 * See: http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/
 * @param{Array.<number>} a quaternion a
 * @param{Array.<number>} b quaternion b
 * @param{number} t interpolation parameter
 */
function slerp(a, b, t) {
	// quaternion to return
	var qm = {x:0, y:0, z:0, w:0};
	var qa = {x:a[0], y:a[1], z:a[2], w:a[3]};
	var qb = {x:b[0], y:b[1], z:b[2], w:b[3]};
	// Calculate angle between them.
	var cosHalfTheta = qa.w * qb.w + qa.x * qb.x + qa.y * qb.y + qa.z * qb.z;
	// if qa=qb or qa=-qb then theta = 0 and we can return qa
	if (Math.abs(cosHalfTheta) >= 1.0){
		qm.w = qa.w;
		qm.x = qa.x;
		qm.y = qa.y;
		qm.z = qa.z;
		return [qm.x, qm.y, qm.z, qm.w];
	}
	// Calculate temporary values.
	var halfTheta = Math.acos(cosHalfTheta);
	var sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta*cosHalfTheta);
	// if theta = 180 degrees then result is not fully defined
	// we could rotate around any axis normal to qa or qb
	if (Math.abs(sinHalfTheta) < 0.001){ // fabs is floating point absolute
		qm.w = (qa.w * 0.5 + qb.w * 0.5);
		qm.x = (qa.x * 0.5 + qb.x * 0.5);
		qm.y = (qa.y * 0.5 + qb.y * 0.5);
		qm.z = (qa.z * 0.5 + qb.z * 0.5);
		return [qm.x, qm.y, qm.z, qm.w];
	}
	var ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
	var ratioB = Math.sin(t * halfTheta) / sinHalfTheta;
	//calculate Quaternion.
	qm.w = (qa.w * ratioA + qb.w * ratioB);
	qm.x = (qa.x * ratioA + qb.x * ratioB);
	qm.y = (qa.y * ratioA + qb.y * ratioB);
	qm.z = (qa.z * ratioA + qb.z * ratioB);
	return [qm.x, qm.y, qm.z, qm.w];
};

/**
 * Merges two optionsobjects
 * @param {{duration: number, loop: number, delay: number, easing: Function, callback: Function}} high options with high priority
 * @param {{duration: number, loop: number, delay: number, easing: Function, callback: Function}} low options with low priority
 * @return {{duration: number, loop: number, delay: number, easing: Function, callback: Function}} merged options
 */
function mergeOptions(high, low){
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

//export
XMOT.inherit = inherit;
XMOT.base = base;
XMOT.animate = animate;
XMOT.animating = animating;
XMOT.animationHook = animationHook;
XMOT.registeredCameraController = registeredCameraController;
XMOT.axisAngleToQuaternion = axisAngleToQuaternion;
XMOT.normalizeVector = normalizeVector;
XMOT.quaternionToAxisAngle = quaternionToAxisAngle;
XMOT.slerp = slerp;
XMOT.mergeOptions = mergeOptions;
}());