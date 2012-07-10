(function(){
	/**
	 * SimpleConstraint
	 * @constructor
	 * @param {Boolean} allowedToMove
	 * @implements {Constraint}
	 */
	var SimpleConstraint = function(allowedToMove, allowedToRotate){
		/**
		 * allowed to move
		 * @private
		 * @type {Boolean}
		 */
		this.allowedToMove = allowedToMove;
		/**
		 * allowed to Rotate
		 * @private
		 * @type {Boolean}
		 */
		this.allowedToRotate = allowedToRotate;
	};
	var s = SimpleConstraint.prototype;

	/** @inheritDoc */
    s.constrainRotation = function(rotation, moveable){
		return this.allowedToRotate;
    };

    /** @inheritDoc */
    s.constrainTranslation = function(translation, moveable){
		return this.allowedToMove;
    };

    //export
    XMOT.SimpleConstraint = SimpleConstraint;
}());
