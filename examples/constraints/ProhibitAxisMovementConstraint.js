(function(){
	/**
	 * ProhibitAxisMovementConstraint
	 * prohibit axismovement, but allow movement around an epsilon of a specified center
	 * @constructor
	 * @param {Boolean} x prohibit x axis
	 * @param {Boolean} y prohibit y axis
	 * @param {Boolean} z prohibit z axis
	 * @param {number} epsilon
	 * @param {number} center
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
    c.constrainRotation = function(newRotation, moveable){
		return true;
    };

    /** @inheritDoc */
    c.constrainTranslation = function(newPosition, moveable){
    	var center = this.center;
    	var epsilon = this.epsilon;
    	var currentPosition = moveable.getPosition();
		if(this.x && Math.abs(center - newPosition[0]) > epsilon) newPosition[0] = currentPosition[0];
		if(this.y && Math.abs(center - newPosition[1]) > epsilon) newPosition[1] = currentPosition[1];
		if(this.z && Math.abs(center - newPosition[2]) > epsilon) newPosition[2] = currentPosition[2];
    	return true;
    };
}());
