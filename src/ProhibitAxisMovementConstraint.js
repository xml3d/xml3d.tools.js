(function(){
	/**
	 * ProhibitAxisMovementConstraint
	 * @constructor
	 * @param {Boolean} x prohibit x axis
	 * @param {Boolean} y prohibit y axis
	 * @param {Boolean} z prohibit z axis
	 * @implements {Constraint}
	 */
	var ProhibitAxisMovementConstraint = function(x,y,z){
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

	};
	var c = ProhibitAxisMovementConstraint.prototype;

	/** @inheritDoc */
    c.constrainRotation = function(rotation, moveable){
		return true;
    };

    /** @inheritDoc */
    c.constrainTranslation = function(translation, moveable){
		//TODO: check rotationssymmetrische dingsda, also z achse der szene = -y des bildes?
		//TODO: check normal
    	if(this.x) translation[0] = 0;
    	if(this.y) translation[1] = 0;
    	if(this.z) translation[2] = 0;
    	return true;
    };

    //export
    XMOT.ProhibitAxisMovementConstraint = ProhibitAxisMovementConstraint;
}());
