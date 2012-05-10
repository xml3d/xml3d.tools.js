
(function() {

    /**
     * A Moveable implementation.
     * @implements{Moveable}
     */
    function ClientMoveable(object, transform, constraint) {
		//oject
		this.object = object;
		//transform
		this.transform = transform;
		//constraint
		this.constraint = constraint;
    };

    var p = ClientMoveable.prototype;

    /**
     * Set the absolute position.
     */
    p.setPosition = function(position){
    	if(this.constraint.constrainTranslation(position))
    		this.transform.translation.set(position[0],position[1],position[2]);
    };

	/**
	 * Set the absolute orientation.
	 */
	p.setOrientation = function(orientation){
		if(this.constraint.constrainRotation(orientation))
			this.transform.rotation.setQuaternion(new XML3DVec3(orientation[0],orientation[1],orientation[2]), orientation[3]);
    };

    /**
     * Translate the object by the given values.
     */
    p.translate = function(translation){
		var destination = this.transform.translation.add( new XML3DRotation.setQuaternion(XML3DVec3(translation[0],translation[1],translation[2])) );
		if(this.constraint.constrainTranslation(destination))
			this.transform.translation.set(destination);
    };

    /**
     * Rotate the object by the given values.
     */
    p.rotate = function(orientation){
		//TODO: check how the rotate should really work oO
		var modifier = new XML3DRotation();
		modifier.setQuaternion( new XML3DVec3(orientation[0],orientation[1],orientation[2]), orientation[3] );
		var destination = this.transform.rotation.multiply( modifier );
		if(this.constraint.constrainRotation(orientation))
			this.transform.rotation.setQuaternion(destination);
    };

    p.moveTo = function(position, time, opt){
		//TODO
    	var tween = new Tween();
    	TWEEN._tweens.add(tween);
    };

    p.setConstraint = function(constraint){
		this.constraint = constraint;
    };

    //export
    XMOT.ClientMoveable = ClientMoveable;
}());
