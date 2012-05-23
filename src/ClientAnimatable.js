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
		 * Map of active KeyframeAnimations
		 * Note: This works since the IDs are only numbers.
		 * Those numbers are turned into strings  and those are used as keys.
		 * @private
		 * @type {number}
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
    a.addAnimation = function(animation){
		this.availableAnimations[animation.name] = animation;
    };

    /** @inheritDoc */
    a.startAnimation = function(name, opt){
		var toStart = this.availableAnimations[name];
		var id = this.idCounter;
		this.idCounter++;
		this.activeAnimations[id] = toStart;
		toStart.start(this, opt);
		return id;
    };

    /** @inheritDoc */
    a.stopAnimation = function(id){
		var toStop = this.activeAnimations[id];
		//TODO: this stops every(!) animation not just the one with id
		if(toStop) this.stop();
		return this;
    };

    //export
	XMOT.ClientAnimatable = ClientAnimatable;

}());