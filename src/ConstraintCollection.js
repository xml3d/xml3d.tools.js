(function(){
	/**
	 * ConstraintCollection
	 * Combines a number of constraints
	 * @constructor
	 * @param {Array.<Constraint>|undefined} constraints
	 * @param {boolean} breakEarly do not check all constraints if one fail
	 * @implements {Constraint}
	 */
	var ConstraintCollection = function(constraints, breakEarly){
		/**
		 * Collection of Contraints
		 * @private
		 * @type {Array.<Constraint>|undefined}
		 */
		this.constraints = constraints == undefined ? [] : constraints;
		/**
		 * break early flag
		 * @private
		 * @type{boolean}
		 */
		this.breakEarly = breakEarly || true;
	};
	var c = ConstraintCollection.prototype;

	/** @inheritDoc */
    c.constrainRotation = function(newRotation, moveable){
    	var constraints = this.constraints;
    	var length = constraints.length;
		var i = 0;
		var ret = true;
		var breakEarly = this.breakEarly;
		
		while( i<length && (ret || !breakEarly) ){
			ret = ret && constraints[i].constrainRotation(newRotation, moveable);
			i++;
		}
    	return ret;
    };

    /** @inheritDoc */
    c.constrainTranslation = function(newPosition, moveable){
    	var constraints = this.constraints;
		var length = constraints.length;
		var i = 0;
		var ret = true;
		var breakEarly = this.breakEarly;
		while( i<length && (ret || !breakEarly) ){
			ret = ret && constraints[i].constrainTranslation(newPosition, moveable);
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
