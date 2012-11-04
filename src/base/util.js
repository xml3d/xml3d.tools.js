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
	function tmp() {}
	tmp.prototype = parent.prototype;
	child.superClass_ = parent.prototype;
	child.prototype = new tmp();
	child.prototype.constructor = child;
}

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
}

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
		window.requestAnimFrame(XMOT.animate, undefined);
		if(XMOT.animationHook) XMOT.animationHook();
		if(XMOT.registeredCameraController) XMOT.registeredCameraController.update();
		TWEEN.update();
	}
	else
		XMOT.animating = false;
}

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
}

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
function namespace(fullName)
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
}

//export
XMOT.inherit = inherit;
XMOT.base = base;
XMOT.animate = animate;
XMOT.animating = animating;
XMOT.animationHook = animationHook;
XMOT.registeredCameraController = registeredCameraController;
XMOT.mergeOptions = mergeOptions;
XMOT.namespace = namespace; 
}());