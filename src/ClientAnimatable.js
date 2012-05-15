(function(){

	/**
	 * An implementation of Animatable
	 * @implements Animatable
	 */
	var ClientAnimatable = function(obj, transform, constraint){
		this.object = obj;
		this.transform = transform;
		this.constraint = constraint;
		//stores available animations by their name
		this.availableAnimations = {};
		//stores active animations by their id, if they have an id
		this.activeAnimations = {};
	};
    var a = ClientAnimatable.prototype;

    /** @inheritDoc */
    a.addAnimation = function(animation){
		this.availableAnimations[animation.name] = animation;
    };

    /** @inheritDoc */
    a.startAnimation = function(name, opt){
		var toStart = this.availableAnimations[name];
		toStart.start(this, opt);
		return this;
    };

    /** @inheritDoc */
    a.stopAnimation = function(id){
		var toStop = this.activeAnimations[id];
		if(toStop) toStop.stop(this);
		return this;
    };

    //export
	XMOT.ClientAnimatable = ClientAnimatable;

}());