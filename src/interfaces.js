/*
Copyright (c) 2010-2014
              DFKI - German Research Center for Artificial Intelligence
              www.dfki.de

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
 so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
/** @namespace **/
XML3D.tools = XML3D.tools || {};

(function() {

    /**
     * A MotionFactory.
     * @interface
     */
    var MotionFactory = function() {};
    var m = MotionFactory.prototype;

    /**
     * Creates a Transformable out of the given object
     * @param {Object} object base for the Transformable
     * @param {Constraint} constraint Constrain movement
     * @return {Transformable} created Transformable
     */
    m.createTransformable = function(object, constraint){};

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
     * @param {{duration: number, loop: number, delay: number, easing: Function, callback: Function}=} opt options
     * @return {Animation} created KeyFrameAnimation
     */
    m.createKeyframeAnimation = function(name, type, element, opt){};

    /**
     * Creates a ParameterAnimation
     * @param {string} name name
     * @param {Object} element ParameterAnimation, keys and corresponding parameters
     * @param {{duration: number, loop: number, delay: number, easing: Function, callback: Function}=} opt options
     * @return {Animation} created ParameterAnimation
     */
    m.createParameterAnimation = function(name, element, opt){};


    /**
     * A Transformable.
     * @interface
     */
    var Transformable = function() {};
    var p = Transformable.prototype;

    /**
     * Sets the absolute position of the Transformable in local space.
     * @param {XML3DVec3} position position as 3d vector in local space
     * @return {boolean} true if a setting was permitted by the constraint
     */
    p.setPosition = function(position){};

    /**
     * Sets the absolute orientation of the Movebale in local space.
     * @param {XML3DRotation>} orientation orientation as quaternion in local space
     * @return {boolean} true if a setting was permitted by the constraint
     */
    p.setOrientation = function(orientation){};

    /**
     * Sets a new scale factor
     * @param {XML3DVec3} scale scale factor
     * @return {boolean} true if a setting was permitted by the constraint
     */
    p.setScale = function(scale){};

    /**
     * Gets the current position
     * @return {XML3DVec3} position
     */
    p.getPosition = function(){};

    /**
     * Gets the current orientation as quaternion
     * @return {XML3DRotation} orientation
     */
    p.getOrientation = function(){};

    /**
     * Gets the current scale factor
     * @return {XML3DVec3} scale factor
     */
    p.getScale = function(){};

    /**
     * Translate the Transformable by a given Vector.
     * @param {XML3DVec3} translation 3d Vector
     * @return {boolean} true if a setting was permitted by the constraint
     */
    p.translate = function(translation){};

    /**
     * Rotates the Transformable by a given Quaternion.
     * @param {XML3DRotation} rotation Quaternion
     * @return {boolean} true if a setting was permitted by the constraint
     */
    p.rotate = function(rotation){};

    /**
     * Scales the transformable by a given vector
     * @param {XML3DVec3} factor scale factor
     * @return {boolean} true if a setting was permitted by the constraint
     */
    p.scale = function(factor){};

    /**
     * Interpolated translation over time to position in local space.
     * The animation is put into a fifo-queue and will be eventually executed.
     * @param {XML3DVec3|undefined} position local space Vector
     * @param {XML3DRotation|undefined} orientation orientation Quaternion
     * @param {number} time when to reach the position, in milliseconds
     * @param {{delay: number, easing: Function, queueing: Boolean, callback: Function}=} opt options
     * @return {Transformable} the Transformable
     */
    p.moveTo = function(position, orientation, time, opt){};

    /**
     * Returns true if a movement is currently in progress
     * @return {Boolean}
     */
    p.movementInProgress = function(){};

    /**
     * Stops the current movement and cancels every queued movement.
     * @return {Transformable} the Transformable
     */
    p.stop = function(){};

    /**
     * Sets a constraint for the Transformable. The constraint is checked
     * @param {Constraint} constraint Set a constraint to the Transformable
     */
    p.setConstraint = function(constraint){};


    /**
     * An Animatable
     * @extends Transformable
     * @interface
     */
    var Animatable = function(){};
    var a = Animatable.prototype;

    /**
     * Add an Animation to the Animatable
     * @param {Animation} animation Animation
     * @param {{duration: number, loop: number, delay: number, easing: Function, callback: Function}=} opt options
     * @return {Animatable} the Animatable
     */
    a.addAnimation = function(animation, opt){};

    /**
     * Starts an animation
     * @param {string} name animation, that will be started
     * @param {{duration: number, loop: number, delay: number, easing: Function, callback: Function}=} opt options
     * @return {number} id id of the animation
     */
    a.startAnimation = function(name, opt){};

    /**
     * Stops an animation
     * @param {string} id Animation ID
     * @return {Animatable} the Animatable
     */
    a.stopAnimation = function(id){};


    /**
     * An Animation
     * @interface
     */
    var Animation = function(){};
    var k = Animation.prototype;

    /**
     * Sets the state of the animatable at time x of the animation
     * @param {Animatable} animatable
     * @param {number} currentTime
     * @param {number} startTime
     * @param {number} endTime
     * @param {Function=} easing
     */
    k.applyAnimation = function(animatable, currentTime, startTime, endTime, easing){};

	/**
	 * Set Options
	 * @param {{duration: number, loop: number, delay: number, easing: Function, callback: Function}} opt options
	 */
	k.setOptions = function(opt){};

	/**
	 * Gets the value of an option, the option can be requested by its name
	 * @return {{duration: number, loop: number, delay: number, easing: Function, callback: Function}} opt options the requested option value
	 */
	k.getOptions = function(){};


	/**
     * A Constraint
     * @interface
     */
    var Constraint = function(){};
    var c = Constraint.prototype;

    /**
     * Checks if a rotation operation is valid. The first argument might be
     * further constrained inside the method.
     *
     * @param {XML3DRotation} newRotation Quaternion, the new rotation
     * @param {{transformable: Transformable}} [opts] options for the constraint-check
     * @return {boolean} returns true if the operation is valid, false otherwise
     */
    c.constrainRotation = function(newRotation, opts){};

    /**
     * Checks if a translation operation is valid. The first argument might be
     * further constrained inside the method.
     *
     * @param {XML3DVec3} newTranslation, the new translation
     * @param {{transformable: Transformable}} [opts] options for the constraint-check
     * @return {boolean} returns true if the operation is valid, false otherwise
     */
    c.constrainTranslation = function(newTranslation, opts){};

    /**
     * Checks if a scaling operation is valid. The first argument might be
     * further constrained inside the method.
     *
     * @param {XML3DVec3} newScale the new scaling
     * @param {{transformable: Transformable}} [opts] options for the constraint-check
     * @return {boolean} returns true if the operation is valid, false otherwise
     */
    c.constrainScaling = function(newScale, opts){};
}());
