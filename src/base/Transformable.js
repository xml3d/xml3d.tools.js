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
(function() {

    "use strict";

    /**
     * A Transformable implementation.
     * @constructor
     * @implements{Transformable}
     */
    XML3D.tools.Transformable = new XML3D.tools.Class({

        initialize: function(object, transform, constraint) {
            /**
             * Object which shall be transformable
             * @type {Object}
             */
            this.object = object;
            /**
             * Transform coords of the object and the Transformable
             * @protected
             * @type {Object}
             */
            this.transform = transform;

            /**
             * Constraint of the movement
             * @protected
             * @type {Constraint}
             */
            if(!constraint)
                constraint = new XML3D.tools.SimpleConstraint(true, true, true);
            this.constraint = constraint;

            /**
             * Queue of movements
             * @private
             * @type {Array.<{tween: tween, startPosition:Array.<number>, endPosition:Array.<number>, startOrientation:Array.<number>, endOrientation:Array.<number>}>}
             */
            this._motionQueue = [];
        },

        /** @inheritDoc */
        setPosition: function(position){
            if(this.constraint.constrainTranslation(position, {transformable: this})) {
                this.transform.translation.set(position);
                return true;
            }

            return false;
        },

        /** @inheritDoc */
        setOrientation: function(orientation){
            if(this.constraint.constrainRotation(orientation, {transformable: this})){
                this.transform.rotation.set(orientation);
                return true;
            }

            return false;
        },

        /** @inheritDoc */
        setScale: function(scale){
            if(this.constraint.constrainScaling(scale, {transformable: this})){
                this.transform.scale.set(scale);
                return true;
            }

            return false;
        },

        /** @inheritDoc */
        getPosition: function(){
            return new XML3DVec3(this.transform.translation);
        },

        /** @inheritDoc */
        getOrientation: function(){
            return new XML3DRotation(this.transform.rotation);
        },

        /** @inheritDoc */
        getScale: function(){
            return new XML3DVec3(this.transform.scale);
        },

        /** @inheritDoc */
        translate: function(translation){
            return this.setPosition( translation.add(this.getPosition()) );
        },

        /** @inheritDoc */
        rotate: function(orientation){
            var destination = new XML3DRotation(this.transform.rotation, undefined, undefined);
            destination = destination.multiply( orientation );

            if(this.constraint.constrainRotation(orientation, {transformable: this})) {
                this.transform.rotation.set(destination);
                return true;
            }

            return false;
        },

        /** @inheritDoc */
        scale: function(factor){
            var newScale = this.transform.scale.multiply(factor);
            if(this.constraint.constrainScaling(newScale, {transformable: this})) {
                this.transform.scale.set(newScale);
                return true;
            }

            return false;
        },

        /** @inheritDoc */
        moveTo: function(position, orientation, time, opt){
            opt = opt || {};
            //no movement needed
            var queueingAllowed = opt.queueing || true;
            if( (position == undefined && orientation == undefined) || //nowhere to moveto
                (!queueingAllowed && this.movementInProgress()) || //queuing forbiden, but something in progress
                (this._checkIfNoNeedToMove(position, orientation)) ){
                if(opt.callback) opt.callback();
                return this;
            }

            //create new queue entry of the new given data:
            var newEntry = {};
            var tween = new TWEEN.Tween({t:0}).to({t:time}, time);
            if(opt.delay != undefined) tween.delay(opt.delay);
            var that = this;
            var easing = opt.easing;
            //update callback
            tween.onUpdate( function() {
                //this is the data interpolated by the tween
                that._movement(this.t, 0, time, easing);
            } );
            //callback on complete
            tween.onComplete( function(){
                //this is the data interpolated by the tween

                //start next tween (beginning of the queue), if there is any in the queue
                if(that._motionQueue.length > 1){ //we did not remove the finished one yet
                    //set startpos / ori of the following moveTo, instead of setting at definition
                    var followingMovement = that._motionQueue[1];
                    var endedMovement = that._motionQueue[0];
                    followingMovement.startPosition = endedMovement.endPosition || that.getPosition();
                    followingMovement.startOrientation = endedMovement.endOrientation || that.getOrientation();
                    followingMovement.tween.start();
                }
                //remove finished tween from the beginning of the queue
                that._motionQueue.shift();
                //callback after the movement finished
                if(opt.callback && typeof(opt.callback) === "function")
                    opt.callback();
            });
            newEntry.tween = tween;
            newEntry.endPosition = position;
            newEntry.endOrientation = orientation;
            //default start values, are the current values
            //those are overwritten if a tween ends before us, see the onComplete callback
            newEntry.startPosition = new XML3DVec3( this.getPosition() );
            newEntry.startOrientation = new XML3DRotation( this.getOrientation() );

            //push tween to the end of the queue and start if queue was empty
            this._motionQueue.push(newEntry);
            if( this._motionQueue.length-1 == 0){
                newEntry.tween.start();
                if(!XML3D.tools.animating) {
                    XML3D.tools.animate();
                    XML3D.tools.animating = true;
                }
            }
            return this;
        },

        /** @inheritDoc */
        movementInProgress: function(){
            return this._motionQueue.length > 0;
        },

        /**@inheritDoc */
        stop: function(){
            var motion = this._motionQueue.shift();
            if(motion) motion.tween.stop();
            this._motionQueue = [];
            return this;
        },

        /** @inheritDoc */
        setConstraint: function(constraint){
            this.constraint = constraint;
        },

        /**
         * Checks if we need to move to a poi or if we are already there
         * @private
         * @param {Array.<number>} position
         * @param {Array.<number>} orientation
         * @return {boolean}
         */
        _checkIfNoNeedToMove: function(position, orientation){
            if(!position && !orientation) return true;
            if(!position && orientation) return this._checkPosition(orientation);
            if(position && !orientation) return this._checkPosition(position);
            return this._checkPosition(position) && this._checkPosition(orientation);
        },

        /**
         * check if current position equals moveTo position
         * @private
         * @param {Array.<number>} position
         * @return {boolean}
         */
        _checkPosition: function(position){
            var curPos = this.transform.translation;
            return (curPos.x == position.x && curPos.y == position.y && curPos.z == position.z);
        },

        /**
         * check if current orientation equals moveTo orientation
         * @private
         * @param {Array.<number>} orientation
         * @return {boolean}
         */
        _checkOrientation: function(orientation){
            var curOri = this.transform.orientation;
            return (curOri.x === orientation.x && curOri.y === orientation.y && curOri.z === orientation.z && curOri.w === orientation.w);
        },

        /**
         * Applies one movement step to the transformable
         * @private
         * @param {number}currentTime
         * @param {number} startTime
         * @param {number} endTime
         * @param {Function} easing
         */
        _movement: function(currentTime, startTime, endTime, easing){
            var t = (currentTime - startTime) / (endTime - startTime);
            if(easing && typeof(easing) === "function") t = easing(t); //otherwise its linear
            var pos = this._interpolatePosition(t);
            var ori = this._interpolateOrientation(t);
            this._setValue(pos, ori);
        },

        /**
         * Interpolates the position of the current movement
         * @private
         * @param {number} t interpolation parameter
         * @return {Array.<number>|undefined} position
         */
        _interpolatePosition: function(t){
            var end = this._motionQueue[0].endPosition;
            if(end == undefined) return undefined;
            var start = this._motionQueue[0].startPosition;
            var interpolatedX = start.x + ( end.x - start.x ) * t;
            var interpolatedY = start.y + ( end.y - start.y ) * t;
            var interpolatedZ = start.z + ( end.z - start.z ) * t;
            return new XML3DVec3( interpolatedX, interpolatedY, interpolatedZ );
        },

        /**
         * interpoaltes the orientation of the current movement
         * @private
         * @param {number} t interpolation paramater
         * @return {Array.<number>|undefined} orientation
         */
        _interpolateOrientation: function(t){
            var end = this._motionQueue[0].endOrientation;
            if(end == undefined) return undefined;
            var start = this._motionQueue[0].startOrientation;
            return XML3D.tools.math.slerp(start, end, t);
        },

        /**
         * Set position and orientation of the transformable. A setting of orientation
         * will be perfomed independent of the outcome of setPosition().
         * @private
         * @param {Array.<number>|undefined} position
         * @param {Array.<number>|undefined} orientation
         * @return {boolean} true if the setting was permitted by the constraint
         */
        _setValue: function(position, orientation){
            var settingSuccessful = true;

            if(position !== undefined)
                settingSuccessful = this.setPosition(position);
            if(orientation !== undefined) {
                var didSet = this.setOrientation(orientation);
                settingSuccessful = settingSuccessful && didSet;
            }

            return settingSuccessful;
        }
    });

}());
