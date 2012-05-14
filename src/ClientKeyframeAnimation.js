
(function(){
	/**
	 * ClientKeyframeAnimation implementation
	 * @implements{MotionFactory}
	 */
	function ClientKeyframeAnimation(name, type, keys, values, opt){
		this.name = name;
		this.type = type;
		this.keys = keys;
		console.log(this.keys);
		this.values = values;
		console.log(this.values);
		
		//options
		this.loop = false;
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
    k.start = function(opt){
    	
    };

	/** @inheritDoc */
    k.stop = function(){
    	
    };

	//export
	XMOT.ClientKeyframeAnimation = ClientKeyframeAnimation;
}());