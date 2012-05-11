/** @namespace **/
var XMOT = XMOT || {};

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
     * @return {Moveable} created Moveable
     */
    m.createMoveable = function(object){};

    /**
     * Creates an Animatable out of the given object
     * @param {Obvject} object base for the Animatable
     * @return {Animatable} created Animatable
     */
    m.createAnimatable = function(object){};

    /**
     * Creates a KeyframeAnimation
     * @param {Object} KeyframeAnimation, keyframes and corresponding positions or orientations
     * @return {KeyFrameAnimation} created KeyFrameAnimation
     */
    m.createKeyframeAnimation = function(object){};

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
     * @param {Array.<number>} position local space
     * @param {number} time when to reach the position, in milliseconds
     * @param {Object=} opt options: {string} Interpolationalgorithm: default: linear; {function} Callback;
     * @return {Moveable} the Moveable
     */
    p.moveTo = function(position, time, opt){};

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
     * @interface
     */
    var Animatable = function(){};
    var a = Animatable.prototype;

    /**
     * Add an Animation to the Animatable
     * @param {string} name
     * @param {string} type Rotation or Position
     * @param {KeyframeAnimation} keyframeAnimation Keyframeanimation
     * @param {Object=} opt options: {number} duration (in ms): default 1000; {boolean} loop: default: false
     * @return {Animatable} the Animatable
     */
    a.addAnimation = function(name, type, keyframeAnimation, opt){};

    /**
     * Starts an animation
     * @param {string} name animation, that will be started
     * @param {Object=} opt options: {number} duration (in ms); {boolean} loop; {string} id;
     * @return {Animatable} the Animatable
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
    //TODO define functions for the KeyFrameAnimation

    /**
     * A Humanoid
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
     * @return {boolean} returns true if the operation is valid, false otherwise
     */
    c.constrainRotation = function(rotation){};

    /**
     * Checks if a translation operation is valid.
     * @param {Array.<number>} translation 3d Vector
     * @return {boolean} returns true if the operation is valid, false otherwise
     */
    c.constrainTranslation = function(translation){};
}());