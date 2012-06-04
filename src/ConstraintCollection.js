(function(){
	/**
	 * ConstraintCollection
	 * Combines a number of constraints
	 * @constructor
	 * @param {Array.<Constraint>} constraints
	 * @implements {Constraint}
	 */
	var ConstraintCollection = function(constraints){
		/**
		 * Collection of Contraints
		 * @private
		 * @type {Array.<Constraint>}
		 */
		this.constraints = constraints;
	};
	var c = ConstraintCollection.prototype;

	/** @inheritDoc */
    c.constrainRotation = function(rotation, moveable){
		var length = this.constraints.length();
		var i = 0;
		var ret = true;
		while(i<l && ret){
			ret = ret && this.constraints[i].constrainRotation(rotation, moveable);
			i++;
		}
    	return ret;
    };

    /** @inheritDoc */
    c.constrainTranslation = function(translation, moveable){
		var length = this.constraints.length();
		var i = 0;
		var ret = true;
		while(i<l && ret){
			ret = ret && this.constraints[i].constrainTranslation(translation, moveable);
			i++;
		}
    	return ret;
    };

    /**
     * Adds a constraint to the collection
     * @param {Constraint} constraint
     */
    c.addConstraint = function(constraint){
		this.constraints.push(constraint);
    };

    /**
     * Removes a constraint from the collection
     * @param {Constraint} constraint
     */
    c.removeContraint = function(constraint){
		var i = this.constraints.indexOf(constraint);
		//indexOf returns -1 if item was not found
		if(i !== -1) constraints.splice(i,1);
    };

    //export
    XMOT.SimpleConstraint = SimpleConstraint;
}());
