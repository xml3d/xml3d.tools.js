/** @namespace **/
//var XMOT = XMOT || {};
goog.provide("XMOT");

/** @define {string} */
XMOT.version = '%VERSION%';

(function() {

    /**
     * A MotionFactory.
     * @interface
     */
    var MotionFactory = function() {};
    var m = MotionFactory.prototype;

    /**
     * Creates a Moveable out of the given object
     * @param {Object} object base for the Moveable
     * @param {Constraint} constraint Constrain movement
     * @return {Moveable} created Moveable
     */
    m.createMoveable = function(object, constraint){};

    /**
     * Creates an Animatable out of the given object
     * @param {Object} object base for the Animatable
     * @param {Constraint} constraint Constrain movement
     * @return {Animatable} created Animatable
     */
    m.createAnimatable = function(object, constraint){};

    /**
     * Creates a KeyframeAnimation
     * @param {string} name name
     * @param {string} type "Position" or "Orientation"
     * @param {Object} element KeyframeAnimation, keyframes and corresponding positions or orientations
     * @param {Object=} opt Options: {number} duration in ms; {number} loop; {string} interpolation; {function} callback at the end of the animation;
     * @return {KeyframeAnimation} created KeyFrameAnimation
     */
    m.createKeyframeAnimation = function(name, type, element, opt){};



    /**
     * A Moveable.
     * @interface
     */
    var Moveable = function() {};
    var p = Moveable.prototype;

    /**
     * Sets the absolute position of the Moveable in local space.
     * @param {Array.<number>} position position as 3d vector in local space
     * @return {Moveable} the Moveable
     */
    p.setPosition = function(position){};

    /**
     * Sets the absolute orientation of the Movebale in local space.
     * @param {Array.<number>} orientation orientation as quaternion in local space
     * @return {Moveable} the Moveable
     */
    p.setOrientation = function(orientation){};

    /**
     * Translate the Moveable by a given Vector.
     * @param {Array.<number>} translation 3d Vector
     * @return {Moveable} the Moveable
     */
    p.translate = function(translation){};

    /**
     * Rotates the Moveable by a given Quaternion.
     * @param {Array.<number>} rotation Quaternion
     * @return {Moveable} the Moveable
     */
    p.rotate = function(rotation){};

    /**
     * Interpolated translation over time to position in local space.
     * The animation is put into a fifo-queue and will be eventually executed.
     * @param {Array.<number>|undefined} position local space Vector
     * @param {Array.<number>|undefined} orientation orientation Quaternion
     * @param {number} time when to reach the position, in milliseconds
     * @param {Object=} opt options: {string} interpolation: default: linear; {function} callback at the end of the movement;
     * @return {Moveable} the Moveable
     */
    p.moveTo = function(position, orientation, time, opt){};

    /**
     * Stops the current movement and cancels every queued movement.
     * @return {Moveable} the Moveable
     */
    p.stop = function(){};

    /**
     * Sets a constraint for the Moveable. The constraint is checked
     * @param {Constraint} constraint Set a constraint to the Moveable
     */
    p.setContraint = function(constraint){};



    /**
     * An Animatable
     * @extends Moveable
     * @interface
     */
    var Animatable = function(){};
    var a = Animatable.prototype;

    /**
     * Add an Animation to the Animatable
     * @param {Animation} animation Animation
     * @param {Object=} opt options: {number} duration (in ms); {number} loop; {string} interpolation; {function} callback at the end of the animation;
     * @return {Animatable} the Animatable
     */
    a.addAnimation = function(animation, opt){};

    /**
     * Starts an animation
     * @param {string} name animation, that will be started
     * @param {Object=} opt options: {number} duration (in ms); {number} loop; {string} interpolation; {function} callback at the end of the animation;
     * @return {number} id id of the animation, which was started. The id is valid until the end of the animation
     */
    a.startAnimation = function(name, opt){};

    /**
     * Stops an animation
     * @param {string} id Animation ID
     * @return {Animatable} the Animatable
     */
    a.stopAnimation = function(id){};



    /**
     * A RigidBodyAnimatable
     * @extends Animatable
     */
    var RigidBodyAnimatable = function(){};
    var r = RigidBodyAnimatable.prototype;

    /**
     * Interpolated translation and rotation of a single animation step between two keys
     * The animation step is put into a fifo-queue and will be eventually executed.
     * This is called by the KeyFrameAnimation, but should not be called otherwise, this can be seen as a major desig flaw. TODO
     * @param {number} id Animation ID
     * @param {Array.<number>|undefined} position local space Vector
     * @param {Array.<number>|undefined} orientation orientation Quaternion
     * @param {number} time when to reach the position, in milliseconds
     * @param {Object=} opt options: {string} interpolation: default: linear; {function} callback at the end of the movement;
     * @return {Moveable} the Moveable
     */
    r.animationStep = function(id, position, orientation, time, opt){};



    /**
     * A XFlowAnimatable aka Humanoid
     * @extends Animatable
     * @interface
     */
    var Humanoid = function(){};



    /**
     * A Animation
     * @interface
     */
    var Animation = function(){};
    var k = Animation.prototype;

    /**
     * Starts the Animation, allows to add additional options for this certain animation.
     * @param {Animatable} animatable the animatable, which will be animated
     * @param {Object=} opt options: {number} duration (in ms); {number} loop; {string} interpolation; {function} callback at the end of the animation;
     */
    k.start = function(animatable, opt){};

	/**
	 * Set Options
	 *{Object} opt options: {string} interpolation: default: linear; {function} callback at the end of the movement;
	 */
	k.setOptions = function(opt){};



	/**
	 * A KeyFrameAnimation
	 * @extends Animation
	 * @interface
	 */
	var KeyFrameAnimation = function(){};



    /**
     * A XFlowAnimation
     * @extends Animation
     * @interface
     */
	var XFlowAnimation = function(){};



    /**
     * A Constraint
     * @interface
     */
    var Constraint = function(){};
    var c = Constraint.prototype;

    /**
     * Checks if a rotation operation is valid.
     * @param {Array.<number>} rotation Quaternion
     * @param {Moveable} moveable Moveable
     * @return {boolean} returns true if the operation is valid, false otherwise
     */
    c.constrainRotation = function(rotation, moveable){};

    /**
     * Checks if a translation operation is valid.
     * @param {Array.<number>} translation 3d Vector
     * @param {Moveable} moveable Moveable
     * @return {boolean} returns true if the operation is valid, false otherwise
     */
    c.constrainTranslation = function(translation, moveable){};
}());