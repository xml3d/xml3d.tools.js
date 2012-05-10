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
     * @param {Object=} options Interpolationalgorithm as string; Callback, as soon as position is reached;  all values are optional
     * @return {Moveable} the Moveable
     */
    p.moveTo = function(position, time, opt){};

    /**
     * Stops the current (moveTo) animation.
     * @return {Moveable} the Moveable
     */
    p.stop = function(){};

    /**
     * Sets a constraint for the Moveable. The constraint is checked
     * @param {Constraint} constraint Set a constraint to the Moveable
     */
    p.setContraint = function(constraint){};

    /**
     * A Animatable
     * @interface
     */
    var Animatable = function(){};
    var a = Animatable.prototype;
    //TODO define functions of the Animatable

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