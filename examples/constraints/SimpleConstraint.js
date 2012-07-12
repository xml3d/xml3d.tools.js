(function(){
	/**
	 * SimpleConstraint
	 * @constructor
	 * @param {boolean} allowedToMove
	 * @param {boolean} allowedToRotate
	 * @implements {Constraint}
	 */
	var SimpleConstraint = function(allowedToMove, allowedToRotate){
		/**
		 * allowed to move
		 * @private
		 * @type {boolean}
		 */
		this.allowedToMove = allowedToMove;
		/**
		 * allowed to Rotate
		 * @private
		 * @type {boolean}
		 */
		this.allowedToRotate = allowedToRotate;
	};
	var s = SimpleConstraint.prototype;

	/** @inheritDoc */
    s.constrainRotation = function(newRotation, moveable){
		return this.allowedToRotate;
    };

    /** @inheritDoc */
    s.constrainTranslation = function(newPosition, moveable){
		return this.allowedToMove;
    };

    //export
    XMOT.SimpleConstraint = SimpleConstraint;
}());
