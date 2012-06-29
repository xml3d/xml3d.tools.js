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
		this.constraints = constraints == undefined ? [] : constraints;
	};
	var c = ConstraintCollection.prototype;

	/** @inheritDoc */
    c.constrainRotation = function(rotation, moveable){
		var length = this.constraints.length;
		var i = 0;
		var ret = true;
		while(i<length && ret){
			//TODO: run over all constraints instead of a break as soon as a false is returned from of them?
			// this would allow all constraints to do something with the transformation or the moveable.
			// however, this might lead to a status in a which a change of a constraint changes
			// the behaviour of an following constraint
			ret = ret && this.constraints[i].constrainRotation(rotation, moveable);
			i++;
		}
    	return ret;
    };

    /** @inheritDoc */
    c.constrainTranslation = function(translation, moveable){
		var length = this.constraints.length;
		var i = 0;
		var ret = true;
		while(i<length && ret){
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
		if(i !== -1) this.constraints.splice(i,1);
    };

    //export
    XMOT.ConstraintCollection = ConstraintCollection;
}());
