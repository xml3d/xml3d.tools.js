(function(){
	/**
	 * ClientKeyframeAnimation implementation
	 * @param{string} name name of the animation
	 * @param{Array.<number>} keys keys
	 * @param{Array.<number>|undefined} positionValues
	 * @param{Array.<number>|undefined} orientationValues
	 * @constructor
	 * @implements{MotionFactory}
	 */
	function ClientKeyframeAnimation(name, keys, positionValues, orientationValues, opt){

		/**
		 * name of animation
		 * @private
		 * @type {string}
		 */
		this.name = name;
		/**
		 * Array of the keys
		 * @private
		 * @type{Array.<number>}
		 */
		this.keys = keys;
		/**
		 * Array fo the position values
		 * @private
		 * @type{Array.<number>|undefined}
		 */
		this.positionValues = positionValues;
		/**
		 * Array of the orientation values
		 * @private
		 * @type{Array.<number>|undefined}
		 */
		this.orientationValues = orientationValues;
		
		//options - set defaults
		/**
		 * loop
		 * @private
		 * @type {number}
		 */
		this.loop = 1;
		/**
		 * Duration of the animation
		 * @private
		 * @type {number}
		 */
		this.duration = 1000;
		/**
		 * interpolation used between two steps
		 * @private
		 * @type {string}
		 */
		this.interpolation = "linear";
		/**
		 * Callback, executed as soon as the animation ended
		 * @private
		 * @type {function}
		 */
		this.callback = function(){};
		if(opt){
			this.setOptions(opt);
		}
	};

	var k = ClientKeyframeAnimation.prototype;

	/** @inheritDoc */
    k.start = function(id, animatable){
		var duration = animatable.checkOption("duration", id);
		var i=0;
		var start_time = 0;
		var dest_time = 0;
		//queue animation steps
		for(i=0; i<this.keys.length; i++){
			dest_time = duration * this.keys[i];
			var durationStep = dest_time - start_time;
			if(durationStep == 0) durationStep++; //duration of one animation step must not be 0. this will lead to exceptions due to tweening
			if(this.orientationValues === undefined){ //position only
				var arrayPos = i*3;
				var dest_pos = [this.positionValues[arrayPos], this.positionValues[arrayPos+1], this.positionValues[arrayPos+2]];
				animatable.animationStep(id, dest_pos, undefined, durationStep);
			}
			else if(this.positionValues === undefined){ //orientation only
				var arrayPos = i*4;
				var dest_ori = [this.orientationValues[arrayPos], this.orientationValues[arrayPos+1], this.orientationValues[arrayPos+2], this.orientationValues[arrayPos+3]];
				animatable.animationStep(id, undefined, dest_ori, durationStep);
			}
			else{ //both
				var arrayPos = i*3;
				var dest_pos = [this.positionValues[arrayPos], this.positionValues[arrayPos+1], this.positionValues[arrayPos+2]];
				arrayPos = i*4;
				var dest_ori = [this.orientationValues[arrayPos], this.orientationValues[arrayPos+1], this.orientationValues[arrayPos+2], this.orientationValues[arrayPos+3]];
				animatable.animationStep(id, dest_pos, dest_ori, durationStep);
			}
			start_time = dest_time;
		}
		//start animation
		animatable.activeAnimations[id].queue[0].start();
		if(!XMOT.animating) {
			XMOT.animating = true;
			XMOT.animate();
		}
    };

    /** @inheritDoc */
    k.setOptions = function(opt){
		if(opt.loop)
			this.loop = opt.loop;
		if(opt.duration)
			this.duration = opt.duration;
		if(opt.interpolation)
			this.interpolation = opt.interpolation;
		if(opt.callback && typeof(opt.callback) === "function")
			this.callback = opt.callback;
    };

	//export
	XMOT.ClientKeyframeAnimation = ClientKeyframeAnimation;
}());