
(function(){

	/**
	 * An implementation of Animatable
	 * @constructor
	 * @implements Animatable
	 * @extends ClientMoveable
	 */
	var ClientAnimatable = function(obj, transform, constraint){

		//call parent constructor here
		goog.base(this, obj, transform, constraint);

		/**
		 * Map of KeyframeAnimations
		 * @private
		 * @type {string, {animation: Animation, opt: Object=}}
		 */
		this.availableAnimations = {};
		/**
		 * Map of active KeyframeAnimations
		 * Note: This works since the IDs are only numbers.
		 * Those numbers are turned into strings  and those are used as keys.
		 * @private
		 * @type {number, {animation: Animation, clockGenerator: TWEEN.Tween opt: Object=}}
		 */
		this.activeAnimations = {};
		/**
		 * Counter of IDs for active animations
		 * Attention: this might turn to infinity
		 * @private
		 * @type {number}
		 */
		this.idCounter = 0;
	};

	//inheritence is done here
	goog.inherits(ClientAnimatable, XMOT.ClientMoveable);

    var a = ClientAnimatable.prototype;

    /** @inheritDoc */
    a.addAnimation = function(animation, opt){
		//do not change options of the animation, store options of the animation of this animatable
		//same animation might have different options on another animatable
		this.availableAnimations[animation.name] = new Object();
		var tmp = this.availableAnimations[animation.name];
		tmp.opt = opt;
		tmp.animation = animation;
    };

    /** @inheritDoc */
    a.startAnimation = function(name, opt){
		var id = this.idCounter;
		this.idCounter++;
		this.activeAnimations[id] = {animation:this.availableAnimations[name].animation, opt:opt};
		this.startClockGenerator(id);
		//finally return the id after setting up everything
		return id;
    };

    /**
     * Starts a ClockGenerator which calls the Animation "from time to time", which then applies the current status of the animation to the animatable.
     * @private
     */
    a.startClockGenerator = function(id){
		//use a tween as a clock generator
		var time = this.checkOption("duration", id);
		var cg = new TWEEN.Tween({t:0}).to({t:time}, time).delay(this.checkOption("delay",id));

		//setup update and complete callbacks
		var that = this;
		cg.onUpdate(function(value){
			//this is the interpolated object!
			that.activeAnimations[id].animation.applyAnimation(that, this.t, 0, time, that.checkOption("easing", id));
		});

		cg.onComplete( function(value){
			//this is the interpolated object!
			//animation ended -> callback or loop
			var numberOfLoops = that.checkOption("loop", id);
			var animation = that.activeAnimations[id];
			if(isFinite(numberOfLoops)){
				if( numberOfLoops > 1 ){ //we must loop again
					if(animation.opt != undefined)
						animation.opt.loop = numberOfLoops - 1;
					else
						animation.opt = {loop: numberOfLoops-1};
					that.startClockGenerator(id);
				}else {
					//no more loops, we are finished and now the callback
					var cb = that.checkOption("callback", id);
					if(typeof(cb) === "function") cb();
					animation = {}; //clean up
				}
			}
			else{
				//infinite loops
				that.startClockGenerator(id);
			}
		});

		//and finally the start
		this.activeAnimations[id].clockGenerator = cg;
		cg.start();
		if(!XMOT.animating) {
			XMOT.animating = true;
			XMOT.animate();
		}
    };

    /** @inheritDoc */
    a.stopAnimation = function(id){
		//stop animation
		this.activeAnimations[id].clockGenerator.stop();
		//delete from map - TODO how to do this correctly?
		this.activeAnimations[id] = {};
		return this;
    };

	/**
	 * Checks for a single options and returns the correct value according to the hierachy of different opts
	 * @param {string} name name of the option
	 * @param {number} animationID
	 */
	a.checkOption = function(name, animationID){
		//TODO: make the lib more efficient by filling options in the add/ start function
		//but this will also make the code less readable
		var startOpt = this.activeAnimations[animationID].opt;
		if(startOpt != undefined && startOpt[name] != undefined){
			return startOpt[name];
		}
		else {
			//options provided while adding the animation to the animatable
			var animationOpt = this.availableAnimations[this.activeAnimations[animationID].animation.name].opt;
			if(animationOpt != undefined && animationOpt[name] != undefined){
				return animationOpt[name];
			}else
				//option of the animation itself
				return this.activeAnimations[animationID].animation.getOption(name);
		}
	};

    //export
	XMOT.ClientAnimatable = ClientAnimatable;

}());