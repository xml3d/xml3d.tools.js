(function(){
	/**
	 * ProhibitAxisMovementConstraint
	 * prohibit axismovement, but allow movement around an epsilon of a specified center
	 * @constructor
	 * @param {Boolean} x prohibit x axis
	 * @param {Boolean} y prohibit y axis
	 * @param {Boolean} z prohibit z axis
	 * @param {number} epsilon
	 * @param {center} epsilon
	 * @implements {Constraint}
	 */
	var ProhibitAxisMovementConstraint = function(x,y,z, epsilon, center){
		/**
		 * prohibit x axis
		 * @private
		 * @type {Boolean}
		 */
		this.x = x;
		/**
		 * prohibit y axis
		 * @private
		 * @type {Boolean}
		 */
		this.y = y;
		/**
		 * prohibit z axis
		 * @private
		 * @type {Boolean}
		 */
		this.z = z;
		/**
		 * epsilon
		 * @private
		 * @type {number}
		 */
		this.epsilon = epsilon ? epsilon : 0;
		/**
		 * center
		 * @private
		 * @type {number}
		 */
		this.center =  center ? center : 0;

	};
	var c = ProhibitAxisMovementConstraint.prototype;

	/** @inheritDoc */
    c.constrainRotation = function(rotation, moveable){
		return true;
    };

    /** @inheritDoc */
    c.constrainTranslation = function(translation, moveable){
    	var center = this.center;
    	var epsilon = this.epsilon;
		if(this.x && Math.abs(center - moveable.getPosition()[0]+translation[0]) > epsilon) translation[0] = 0;
		if(this.y && Math.abs(center - moveable.getPosition()[1]+translation[1]) > epsilon) translation[1] = 0;
		if(this.z && Math.abs(center - moveable.getPosition()[2]+translation[2]) > epsilon) translation[2] = 0;
    	return true;
    };

    //export
    XMOT.ProhibitAxisMovementConstraint = ProhibitAxisMovementConstraint;
}());
