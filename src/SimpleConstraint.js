(function(){
	/**
	 * SimpleConstraint
	 * @constructor
	 * @param {Boolean} allowedToMove
	 * @implements {Constraint}
	 */
	var SimpleConstraint = function(allowedToMove){
		/**
		 * The value wich is returned everytime
		 * @private
		 * @type {Boolean}
		 */
		this.allowedToMove = allowedToMove;
	};
	var s = SimpleConstraint.prototype;

	/** @inheritDoc */
    s.constrainRotation = function(rotation, moveable){
		return this.allowedToMove;
    };

    /** @inheritDoc */
    s.constrainTranslation = function(translation, moveable){
		return this.allowedToMove;
    };

    //export
    XMOT.SimpleConstraint = SimpleConstraint;
}());
