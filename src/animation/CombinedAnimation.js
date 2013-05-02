(function() {

    "use strict";

	/**
	 * A CombinedAnimation
	 */
    XMOT.CombinedAnimation = new XMOT.Class({

        initialize: function(name, opt){
            /**
             * name of animation
             * @private
             * @type {string}
             */
            this.name = name;

            /**
             * Animations array
             * Stores animation and their options
             * @private
             * type{Array.<{animation: Animation, opt:{duration: number|undefined, loop: number|undefined, delay: number|undefined, easing: function|undefined, callback: function|undefined}|undefined, boolean: callbackCalled}>}
             */
            this.animations = [];

            /**
             * Counter of finished child animations
             * @private
             * @type {number}
             */
            this.finishedAnimationsCounter = 0;

            //options - set defaults
            /**
             * loop
             * @private
             * @type {number}
             */
            this.loop = 1;
            /**
             * delay
             * @private
             * @type{number}
             */
            this.delay = 0;
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
            this.easing = TWEEN.Easing.Linear.None;
            /**
             * Callback, executed as soon as the animation ended
             * @private
             * @type {Function}
             */
            this.callback = function(){};
            if(opt){
                this.setOptions(opt);
            }
        },

        /**
         * Resetflags of the child animations
         * @private
         */
        resetFlags: function(){
            var i = 0;
            var animations = this.animations;
            var length = animations.length;
            for(i=0; i<length; i++)
                animations[i].callbackCalled = false;
        },

        /**
         * Adds an animation
         * @param {Animation} animation
         * @param { {duration: number, loop: number, delay: number, easing: Function, callback: Function}|undefined } opt
         * @return this
         */
        addAnimation: function(animation, opt){
            this.animations.push({animation: animation, opt: XMOT.mergeOptions(opt, animation.getOptions()), callbackCalled: false});
            //adopt duration correctly
            var needed_duration = opt.duration*opt.loop + opt.delay;
            if(this.duration < needed_duration) this.duration = needed_duration;
            return this;
        },

        /** @inheritDoc */
        applyAnimation: function(animatable, overAllCurrentTime, overAllstartTime/*0*/, overAllendTime, combinedEasing){
            var i = 0;
            var animations = this.animations;
            var length = animations.length;
            for(i=0; i<length; i++){
                var a = animations[i];
                var opt = a.opt;
                var duration = opt.duration;
                var tmp = overAllCurrentTime - opt.delay;
                if(tmp > 0  && !a.callbackCalled){
                    if(tmp < duration * opt.loop){
                        var currentLoopMinusOne = Math.floor(tmp/duration);
                        a.animation.applyAnimation(animatable, tmp - duration*currentLoopMinusOne, overAllstartTime, duration, opt.easing);
                        //combinedEasing is animation.getOption("easing"), which means, that we have this in the options if there was no easing added while addAnimation()
                    }else{
                        opt.callback();
                        this.finishedAnimationsCounter++;
                        if(this.finishedAnimationsCounter === animations.length) this.resetFlags();
                    }
                }
            }
        },

        /** @inheritDoc */
        setOptions: function(opt){
            if(opt.loop)
                this.loop = opt.loop;
            if(opt.duration)
                this.duration = opt.duration;
            if(opt.easingk && typeof(opt.easing) === "function")
                this.easing = opt.easing;
            if(opt.callback && typeof(opt.callback) === "function")
                this.callback = opt.callback;
        },

        /** @inheritDoc */
        getOptions: function(){
            return {duration: this.duration, loop: this.loop, delay: this.delay, easing: this.easing, callback: this.callback};
        }
    });
}());
