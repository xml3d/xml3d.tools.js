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
     * @param {Object=} opt Options: {number} Duration in ms; {Boolean} Loop;
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
     * @param {Object=} opt options: {string} Interpolationalgorithm: default: linear; {function} Callback at the end of the movement;
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
     * @param {KeyframeAnimation} keyframeAnimation Keyframeanimation
     * @return {Animatable} the Animatable
     */
    a.addAnimation = function(keyframeAnimation){};

    /**
     * Starts an animation
     * @param {string} name animation, that will be started
     * @param {Object=} opt options: {number} duration (in ms); {boolean} loop;
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
     * A KeyframeAnimation
     * @interface
     */
    var KeyframeAnimation = function(){};
    var k = KeyframeAnimation.prototype;

    /**
     * Starts the Animation, allows to add additional options for this certain animation.
     * @param {Animatable} animatable the animatable, which will be animated
     * @param {Object=} opt Options: {number} duration in ms; {boolean} loop
     */
    k.start = function(animatable, opt){};

    /**
     * Stops the animation.
     * @param {Animatable} animatable the animatable, whose animation will be stopped
     */
    k.stop = function(animatable){};



    /**
     * A Humanoid
     * @extends Animatable
     * @interface
     */
    var Humanoid = function(){};
    var h = Humanoid.prototype;
    //TODO define functions of the Humanoid



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