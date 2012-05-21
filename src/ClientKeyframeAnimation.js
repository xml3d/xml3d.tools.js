(function(){
	/**
	 * ClientKeyframeAnimation implementation
	 * @constructor
	 * @implements{MotionFactory}
	 */
	function ClientKeyframeAnimation(name, type, keys, values, opt){

		this.name = name;
		this.type = type;
		this.keys = keys;
		this.values = values;
		
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
    k.start = function(animatable, opt){
    };

	/** @inheritDoc */
    k.stop = function(animatable){
		//TODO: queuing of animatons or make animations run at the same time on the same object -> strange  stuff might happen :D
    };

	//export
	XMOT.ClientKeyframeAnimation = ClientKeyframeAnimation;
}());