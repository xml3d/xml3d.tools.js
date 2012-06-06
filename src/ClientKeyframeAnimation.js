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
			var pos = this.positionValues !== undefined ? [this.positionValues[0], this.positionValues[1], this.positionValues[2]] : undefined;
			var ori = this.orientationValues !== undefined ? [this.orientationValues[0], this.orientationValues[1], this.orientationValues[2], this.orientationValues[3]] : undefined;
			this.setValue(animatable, pos, ori);
		}else if (t >= this.keys[l - 1]){
			var pos = this.positionValues !== undefined ? [this.positionValues[l], this.positionValues[l+1], this.positionValues[l+2]] : undefined;
			var ori = this.orientationValues !== undefined ? [this.orientationValues[l], this.orientationValues[l+1], this.orientationValues[l+2], this.orientationValues[l+3]] : undefined;
			this.setValue(animatable, pos, ori);
		}else{
			for ( var i = 0; i < l - 1; i++)
				if (this.keys[i] < t && t <= this.keys[i + 1]) {
					var ret = this.interpolateBetweenKeys( i, ((t - this.keys[i]) / (this.keys[i + 1] - this.keys[i])) );// TODO: this.easing((t - this.keys[i]) / (this.keys[i + 1] - this.keys[i])) );
					this.setValue(animatable, ret.position, ret.orientation);
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
	 */
	k.interpolateBetweenKeys = function(index, t){
		var ret = {position:undefined, orientation:undefined};
		//position
		if(this.positionValues !== undefined){
			//TODO: make function "getPositionArray(index)"
			ret.position = [];
			var si = index*3;
			var ei = (index+1)*3;
			var start = [ this.positionValues[si], this.positionValues[si+1], this.positionValues[si+2] ];
			var end = [ this.positionValues[ei], this.positionValues[ei+1], this.positionValues[ei+2] ];
			var i = 0;
			for(i=0; i<start.length; i++ ){
				ret.position[i] = start[i] + ( end[i] - start[i] ) * t;
			}
		}
		//orientation
		if(this.orientationValues !== undefined){
			ret.orientation = [];
			var si = index*4;
			var ei = (index+1)*4;
			var start = [ this.orientationValues[si], this.orientationValues[si+1], this.orientationValues[si+2], this.orientationValues[si+3] ];
			var end = [ this.orientationValues[ei], this.orientationValues[ei+1], this.orientationValues[ei+2], this.orientationValues[ei+3] ];
			var i = 0;
			for(i=0; i<start.length; i++ ){
				ret.orientation[i] = start[i] + ( end[i] - start[i] ) * t;
			}
		}
		return ret;
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