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
		
		//options
		/**
		 * loop
		 * @private
		 * @type {Boolean}
		 */
		this.loop = false;
		/**
		 * Duration of the animation
		 * @private
		 * @type {number}
		 */
		this.duration = 1000;
		if(opt){
			if(opt.loop)
				this.loop = opt.loop;
			if(opt.duration)
				this.duration = opt.duration;
		}
	};

	var k = ClientKeyframeAnimation.prototype;

	/** @inheritDoc */
    k.start = function(animatable, opt){
		var duration = this.duration;
		if(opt && opt.duration) duration = opt.duration;
		var i=0;
		var start_time = 0;
		var dest_time = 0;
		for(i=0; i<this.keys.length; i++){
			dest_time = duration * this.keys[i];
			var durationStep = dest_time - start_time;
			if(durationStep == 0) durationStep++; //duration of one animation step must not be 0. this will lead to exceptions due to tweening
			if(this.orientationValues === undefined){ //position only
				var arrayPos = i*3;
				var dest_pos = [this.positionValues[arrayPos], this.positionValues[arrayPos+1], this.positionValues[arrayPos+2]];
				animatable.moveTo(dest_pos, undefined, durationStep);
			}
			else if(this.positionValues === undefined){ //orientation only
				var arrayPos = i*4;
				var dest_ori = [this.orientationValues[arrayPos], this.orientationValues[arrayPos+1], this.orientationValues[arrayPos+2], this.orientationValues[arrayPos+3]];
				animatable.moveTo(undefined, dest_ori, durationStep);
			}
			else{ //both
				var arrayPos = i*3;
				var dest_pos = [this.positionValues[arrayPos], this.positionValues[arrayPos+1], this.positionValues[arrayPos+2]];
				arrayPos = i*4;
				var dest_ori = [this.orientationValues[arrayPos], this.orientationValues[arrayPos+1], this.orientationValues[arrayPos+2], this.orientationValues[arrayPos+3]];
				animatable.moveTo(dest_pos, dest_ori, durationStep);
			}
			start_time = dest_time;
		}
    };

	/** @inheritDoc */
    k.stop = function(animatable){
		//TODO: queuing of animatons or make animations run at the same time on the same object -> strange  stuff might happen :D
    };

	//export
	XMOT.ClientKeyframeAnimation = ClientKeyframeAnimation;
}());