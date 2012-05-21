goog.require("goog.inherits");
goog.require("goog.base");

(function(){

	/**
	 * An implementation of Animatable
	 * @constructor
	 * @implements Animatable
	 * @extends ClientMoveable
	 */
	var ClientAnimatable = function(obj, transform, constraint){

		//call parent constructor here
		goog.base(this ,obj, transform, constraint);

		/**
		 * List of KeyframeAnimations
		 * @private
		 * @type {Array.<KeyframeAnimation>}
		 */
		this.availableAnimations = {};
		/**
		 * List of active KeyframeAnimations
		 * @private
		 * @type {number}
		 */
		this.activeAnimations = {};
		/**
		 * Number of currently active Animations
		 * @private
		 * @type {number}
		 */
		this.activeAnimationsCount = 0;
	};

	//inheritence is done here
	goog.inherits(ClientAnimatable, XMOT.ClientMoveable);

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