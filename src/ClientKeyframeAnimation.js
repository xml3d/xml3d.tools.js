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
		this.interpolation = "linear"; //TODO: remove this and add easing
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
	k.applyAnimation = function(animatable, currentTime, startTime, endTime, opt/*???*/){
		//TODO: easing zwischen den keys oder ueber alle keys?
		var t = (currentTime - startTime) / (endTime - startTime);
		var l = this.keys.length - 1;
		if (t <= this.keys[0]){
			this.setValue( animatable, this.getPosition(0), this.getOrientation(0) );
		}else if (t >= this.keys[l - 1]){
			this.setValue( animatable, this.getPosition(l), this.getOrientation(l) );
		}else{
			for ( var i = 0; i < l - 1; i++){
				if (this.keys[i] < t && t <= this.keys[i + 1]) {
					var p = (t - this.keys[i]) / (this.keys[i + 1] - this.keys[i]); // TODO: this.easing((t - this.keys[i]) / (this.keys[i + 1] - this.keys[i])) );
					this.setValue( animatable, this.getInterpolatedPosition(i, p), this.getInterpolatedOrientation(i, p) );
				}
			}
		}
	};

	/**
	 * Set position and animation of the animatable
	 * @private
	 * @param {Array.<number>|undefined}
	 * @param {Array.<number>|undefined}
	 */
	k.setValue = function(animatable, position, orientation){
		if(position != undefined)
			animatable.setPosition(position);
		if(orientation != undefined)
			animatable.setOrientation(orientation);
	};

	/**
	 * Interpolates keyvalues between index i and index i+1 with parameter t
	 * @private
	 * @param {number} index
	 * @param {number} t interpolationparameter
	 * @return {Array.<number>} Position
	 */
	k.getInterpolatedPosition = function(index, t){
		if(this.positionValues === undefined) return undefined;
		var ret = [];
		var start = this.getPosition(index);
		var end = this.getPosition(index+1);
		var i = 0;
		for(i=0; i<start.length; i++ ){
			ret[i] = start[i] + ( end[i] - start[i] ) * t;
		}
		return ret;
	};

	/**
	 * Interpolates keyvalues between index i and index i+1 with parameter t
	 * @private
	 * @param {number} index
	 * @param {number} t interpolationparameter
	 * @return {Array.<number>} Orientation
	 */
	k.getInterpolatedOrientation = function(index, t){
		if(this.orientationValues === undefined) return undefined;
		var ret = [];
		var start = this.getOrientation(index);
		var end = this.getOrientation(index+1);
		var i = 0;
		for(i=0; i<start.length; i++ ){
			ret[i] = start[i] + ( end[i] - start[i] ) * t;
		}
		return ret;
	};

	/**
	 * Gets a position corresponding to a key
	 * @private
	 * @param {number} key
	 * @return {Array.<number>} Position
	 */
	k.getPosition = function(key){
		if(this.positionValues === undefined || key > this.keys.length-1 /*just in case*/) return undefined;
		var index = key*3;
		return [ this.positionValues[index], this.positionValues[index+1], this.positionValues[index+2] ];
	};

	/**
	 * Gets an orientation corresponding to a key
	 * @private
	 * @param {number} key
	 * @return {Array.<number>} Orientation
	 */
	k.getOrientation = function(key){
		if(this.orientationValues === undefined || key > this.keys.length-1 /*just in case*/) return undefined;
		var index = key*4;
		return [ this.orientationValues[index], this.orientationValues[index+1], this.orientationValues[index+2], this.orientationValues[index+3] ];
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