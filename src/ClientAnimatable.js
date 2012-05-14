(function(){

	/**
	 * An implementation of Animatable
	 * @implements Animatable
	 */
	var Animatable = function(obj, transform, constraint){
		this.object = object;
		this.transform = transform;
		this.constraint = constraint;
		//stores available animations by their name
		this.availableAnimations = {};
		//stores active animations by their id, if they have an id
		this.activeAnimations = {};
	};
    var a = Animatable.prototype;

    /** @inheritDoc */
    a.addAnimation = function(animation){
		this.availableAnimations[animation.name] = animation;
    };

    /** @inheritDoc */
    a.startAnimation = function(name, opt){
		var toStart = this.availableAnimations[name];
		toStart.start(opt);
    };

    /** @inheritDoc */
    a.stopAnimation = function(id){
		var toStop = activeAnimations[id];
		if(toStop) toStop.stop();
    };

    //export
	XMOT.Animatable = Animatable;

}());