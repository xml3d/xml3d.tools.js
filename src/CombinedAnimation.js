(function() {

	/**
	 * A CombinedAnimation
	 * @constructor
	 */
	function CombinedAnimation(name, opt){
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
	};
	var ca = CombinedAnimation.prototype;

	/**
	 * Resetflags of the child animations
	 * @private
	 */
	ca.resetFlags = function(){
    	var i = 0;
    	var animations = this.animations;
    	var length = animations.length;
    	for(i=0; i<length; i++)
    		animations[i].callbackCalled = false;
	};

	/**
	 * Adds an animation
	 * @param {Animation} animation
	 * @param { {duration: number|undefined, loop: number|undefined, delay: number|undefined, easing: function|undefined, callback: function|undefined}|undefined } opt
	 * @return this
	 */
	ca.addAnimation = function(animation, opt){
		//make sure options are always there
		if(opt) {
			if(!opt.duration) 	opt.duration = animation.getOption("duration");
			if(!opt.loop)		opt.loop 	 = animation.getOption("loop");
			if(!opt.delay) 		opt.delay 	 = animation.getOption("delay");
			if(!opt.easing) 	opt.easing 	 = animation.getOption("easing");
			if(!opt.callback) 	opt.callback = animation.getOption("callback");
		}else{
			opt = {};
			opt.duration = animation.getOption("duration");
			opt.loop 	 = animation.getOption("loop");
			opt.delay 	 = animation.getOption("delay");
			opt.easing 	 = animation.getOption("easing");
			opt.callback = animation.getOption("callback");
		}
		this.animations.push({animation: animation, opt: opt, callbackCalled: false});
		//adopt duration correctly
		var needed_duration = opt.duration*opt.loop + opt.delay;
		if(this.duration < needed_duration) this.duration = needed_duration;
		return this;
	};
	
	/** @inheritDoc */
    ca.applyAnimation = function(animatable, overAllCurrentTime, overAllstartTime/*0*/, overAllendTime, combinedEasing){
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
    };

    /** @inheritDoc */
    ca.setOptions = function(opt){
		if(opt.loop)
			this.loop = opt.loop;
		if(opt.duration)
			this.duration = opt.duration;
		if(opt.easingk && typeof(opt.easing) === "function")
			this.easing = opt.easing;
		if(opt.callback && typeof(opt.callback) === "function")
			this.callback = opt.callback;
    };
    
    /** @inheritDoc */
    ca.getOption = function(name){
    	return this[name];
    };
	
//export
XMOT.CombinedAnimation = CombinedAnimation;
}());
