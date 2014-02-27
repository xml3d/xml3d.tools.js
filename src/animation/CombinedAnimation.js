(function() {

    "use strict";

	/**
	 * A CombinedAnimation
	 */
    XML3D.tools.CombinedAnimation = new XML3D.tools.Class({

        initialize: function(name, opt)
        {
            /**
             * name of animation
             * @type {string}
             */
            this.name = name;

            /**
             * Animations array
             * Stores animation and their options
             * @private
             * type{Array.<{animation: Animation, opt:{duration: number|undefined, loop: number|undefined, delay: number|undefined, easing: function|undefined, callback: function|undefined}|undefined, boolean: callbackCalled}>}
             */
            this._animations = [];

            /**
             * Counter of finished child animations
             * @private
             * @type {number}
             */
            this._finishedAnimationsCounter = 0;

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
            this.duration = 1000;
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
            if(opt){
                this.setOptions(opt);
            }
        },

        /**
         * Adds an animation
         * @param {Animation} animation
         * @param { {duration: number, loop: number, delay: number, easing: Function, callback: Function}|undefined } opt
         * @return this
         */
        addAnimation: function(animation, opt)
        {
            this._animations.push({
                animation: animation,
                opt: XML3D.tools.mergeOptions(opt, animation.getOptions()),
                callbackCalled: false
            });

            //adopt duration correctly
            var needed_duration = opt.duration*opt.loop + opt.delay;
            if(this.duration < needed_duration)
                this.duration = needed_duration;

            return this;
        },

        /** @inheritDoc */
        applyAnimation: function(animatable, overAllCurrentTime, overAllStartTime/*0*/, overAllendTime, combinedEasing)
        {
            var animations = this._animations;
            for(var i = 0; i < animations.length; i++)
                this._applySingleAnimation(animatable, animations[i], overAllCurrentTime, overAllStartTime);
        },

        _applySingleAnimation: function(animatable, animation, overAllCurrentTime, overAllStartTime)
        {
            var opt = animation.opt;
            overAllCurrentTime = overAllCurrentTime - opt.delay;

            if(overAllCurrentTime < 0 || animation.callbackCalled)
                return;

            var duration = opt.duration;
            var animationCount =   Math.floor(overAllCurrentTime/duration);
            var currentTime = overAllCurrentTime - duration*animationCount;

            if(overAllCurrentTime < duration * opt.loop)
            {
                animation.animation.applyAnimation(animatable, currentTime,
                    overAllStartTime, duration, opt.easing);
                //combinedEasing is animation.getOption("easing"), which means, that we have this in the options if there was no easing added while addAnimation()
            }
            else
                this._finishAnimation(animation);
        },

        _finishAnimation: function(animation) {
            animation.opt.callback();
            this._finishedAnimationsCounter++;
            if(this._finishedAnimationsCounter === this._animations.length)
                this._resetFlags();
        },

        /** @inheritDoc */
        setOptions: function(opt)
        {
            if(opt.loop)
                this._loop = opt.loop;
            if(opt.duration)
                this.duration = opt.duration;
            if(opt.easing && typeof(opt.easing) === "function")
                this._easing = opt.easing;
            if(opt.callback && typeof(opt.callback) === "function")
                this._callback = opt.callback;
        },

        /** @inheritDoc */
        getOptions: function()
        {
            return {
                duration: this.duration,
                loop: this._loop,
                delay: this._delay,
                easing: this._easing,
                callback: this._callback
            };
        },

        /**
         * Resetflags of the child animations
         * @private
         */
        _resetFlags: function()
        {
            for(var i = 0; i < this._animations.length; i++)
                this._animations[i].callbackCalled = false;
        }
    });
}());
