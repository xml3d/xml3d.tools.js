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
(function(){

    "use strict";

    /**
     * KeyframeAnimation implementation
     * @implements{Animation}
     */
    XML3D.tools.KeyframeAnimation = new XML3D.tools.Class({

        /**
         * @param{string} name name of the animation
         * @param{Array.<number>} keys keys
         * @param{Array.<number>|undefined} positionValues
         * @param{Array.<number>|undefined} orientationValues
         * @param{Array.<number>|undefined} scaleValues
         * @param{Object} opt
         */
        initialize: function(name, keys, positionValues, orientationValues, scaleValues, opt)
        {
            /**
             * name of animation
             * @type {string}
             */
            this.name = name;

            /**
             * Array of the keys
             * @private
             * @type{Array.<number>}
             */
            this._keys = keys;
            /**
             * Array fo the position values
             * @private
             * @type{Array.<number>|undefined}
             */
            this._positionValues = positionValues;
            /**
             * Array of the orientation values
             * @private
             * @type{Array.<number>|undefined}
             */
            this._orientationValues = orientationValues;
            /**
             * Array of the scale values
             * @private
             * @type{Array.<number>|undefined}
             */
            this._scaleValues = scaleValues;

            //options - set defaults
            /**
             * loop
             * @private
             * @type {number}
             */
            this._loop = 1;
            /**
             * delay
             * @private
             * @type{number}
             */
            this._delay = 0;
            /**
             * Duration of the animation
             * @private
             * @type {number}
             */
            this._duration = 1000;
            /**
             * easing
             * @private
             * @type {Function}
             */
            this._easing = TWEEN.Easing.Linear.None;
            /**
             * Callback, executed as soon as the animation ended
             * @private
             * @type {Function}
             */
            this._callback = function(){};
            if(opt)
                this.setOptions(opt);
        },

        /** @inheritDoc */
        applyAnimation: function(animatable, currentTime, startTime, endTime, easing)
        {
            var t = (currentTime - startTime) / (endTime - startTime);
            if(easing && typeof(easing) === "function")
                t = easing(t); //otherwise its linear

            var indexOfLastKey = this._keys.length - 1;
            if (t <= this._keys[0])
                this._setValueByKeyIndex(animatable, 0);
            else if (t >= this._keys[indexOfLastKey])
                this._setValueByKeyIndex(animatable, indexOfLastKey);
            else
                this._interpolateKeyValue(animatable, t);
        },

        /** @inheritDoc */
        getOptions: function()
        {
            return {
                duration: this._duration,
                loop: this._loop,
                delay: this._delay,
                easing: this._easing,
                callback: this._callback
            };
        },

        /** @inheritDoc */
        setOptions: function(opt)
        {
            if(opt.loop)
                this._loop = opt.loop;
            if(opt.duration)
                this._duration = opt.duration;
            if(opt.easing && typeof(opt.easing) === "function")
                this._easing = opt.easing;
            if(opt.callback && typeof(opt.callback) === "function")
                this._callback = opt.callback;
        },

        _setValueByKeyIndex: function(animatable, keyIndex)
        {
            this._setValue(animatable, this._getPosition(keyIndex),
                this._getOrientation(keyIndex), this._getScale(keyIndex));
        },

        /**
         * Set position and animation of the animatable
         * @private
         * @param {Animatable} animatable
         * @param {XML3DVec3} position
         * @param {XML3DRotation} orientation
         * @param {XML3DVec3} scale
         */
        _setValue: function(animatable, position, orientation, scale)
        {
            if(this._positionValues !== undefined)
                animatable.setPosition(position);
            if(this._orientationValues != undefined)
                animatable.setOrientation(orientation);
            if(this._scaleValues != undefined)
                animatable.setScale(scale);
        },

        /**
         * Interpolates positionvalues between index i and index i+1 with parameter t
         * @private
         * @param {number} index
         * @param {number} t interpolationparameter
         * @return {XML3DVec3} Position
         */
        _getInterpolatedPosition: function(index, t)
        {
            return this._interpolateXML3DVec3(this._getPosition(index), this._getPosition(index+1), t);
        },

        /**
         * Interpolates scalevalues between index i and index i+1 with parameter t
         * @private
         * @param {number} index
         * @param {number} t interpolationparameter
         * @return {XML3DVec3} Position
         */
        _getInterpolatedScale: function(index, t)
        {
            return this._interpolateXML3DVec3(this._getScale(index), this._getScale(index+1), t);
        },

        /**
         * Interpolate the values of two arrays
         * @private
         * @param {XML3DVec3} vec1
         * @param {XML3DVec3} vec2
         * @param {number} t interpolationparameter
         * @return {XML3DVec3} interpolated array
         */
        _interpolateXML3DVec3: function(vec1, vec2, t)
        {
            var interpolatedX = vec1.x + ( vec2.x - vec1.x ) * t;
            var interpolatedY = vec1.y + ( vec2.y - vec1.y ) * t;
            var interpolatedZ = vec1.z + ( vec2.z - vec1.z ) * t;
            return new XML3DVec3( interpolatedX, interpolatedY, interpolatedZ );
        },

        /**
         * Interpolates keyvalues between index i and index i+1 with parameter t
         * @private
         * @param {number} index
         * @param {number} t interpolationparameter
         * @return {Array.<number>} Orientation
         */
        _getInterpolatedOrientation: function(index, t)
        {
            var start = this._getOrientation(index);
            var end = this._getOrientation(index+1);
            return XML3D.tools.math.slerp(start, end, t);
        },

        /**
         * Gets a position corresponding to a key
         * @private
         * @param {number} key
         * @return {XML3DVec3|undefined} Position
         */
        _getPosition: function(key)
        {
            if(this._positionValues === undefined)
                return new XML3DVec3();

            if(key > this._keys.length - 1)
                key = this._keys.length - 1;
            var index = key*3;
            return new XML3DVec3(this._positionValues[index],
                this._positionValues[index+1], this._positionValues[index+2]);
        },

        /**
         * Gets a sacle corresponding to a key
         * @private
         * @param {number} key
         * @return {XML3DVec3|undefined} Position
         */
        _getScale: function(key)
        {
            if(this._scaleValues === undefined)
                return new XML3DVec3(1,1,1);

            if(key > this._keys.length - 1)
                key = this._keys.length - 1;
            var index = key*3;
            return new XML3DVec3(this._scaleValues[index], this._scaleValues[index+1],
                this._scaleValues[index+2] );
        },

        /**
         * Gets an orientation corresponding to a key
         * @private
         * @param {number} key
         * @return {XML3DRotation} Orientation
         */
        _getOrientation: function(key)
        {
            if(this._orientationValues === undefined)
                return new XML3DRotation();

            if(key > this._keys.length - 1)
                key = this._keys.length - 1;
            var index = key*4;
            var ret = new XML3DRotation();
            ret.setQuaternion( new XML3DVec3(
                this._orientationValues[index], this._orientationValues[index+1],
                this._orientationValues[index+2]), this._orientationValues[index+3]);
            return ret;
        },

        _interpolateKeyValue: function(animatable, keyValue)
        {
            var keyIndex = this._getInterpolationKeyIndex(keyValue);
            var interpolatedValue = this._interpolateKeys(keyValue, keyIndex);
            this._setInterpolatedValueByKeyIndex(animatable, keyIndex, interpolatedValue);
        },

        _getInterpolationKeyIndex: function(keyValue)
        {
            var indexOfLastKey = this._keys.length - 1;
            for(var i = 0; i < indexOfLastKey; i++)
            {
                if(this._keys[i] <= keyValue && keyValue <= this._keys[i + 1])
                    return i;
            }

            return indexOfLastKey;
        },

        _interpolateKeys: function(keyValue, keyIndex)
        {
            return (keyValue - this._keys[keyIndex]) / (this._keys[keyIndex + 1] - this._keys[keyIndex]);
        },

        _setInterpolatedValueByKeyIndex: function(animatable, keyIndex, interpolatedValue)
        {
            var position = this._getInterpolatedPosition(keyIndex, interpolatedValue);
            var orientation = this._getInterpolatedOrientation(keyIndex, interpolatedValue);
            var scale = this._getInterpolatedScale(keyIndex, interpolatedValue);
            this._setValue(animatable, position, orientation, scale);
        }
    });
}());
