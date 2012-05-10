
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
		//current position; needed ONLY for the tween callback, not updated in other functions
		this.currentPosition = {x:this.transform.translation.x, y:this.transform.translation.y, z:this.transform.translation.z};
    };

    var p = ClientMoveable.prototype;

    /** @inheritDoc */
    p.setPosition = function(position){
    	if(this.constraint.constrainTranslation(position))
    		this.transform.translation.set(position[0],position[1],position[2]);
    };

    /** @inheritDoc */
	p.setOrientation = function(orientation){
		if(this.constraint.constrainRotation(orientation))
			this.transform.rotation.setQuaternion(new XML3DVec3(orientation[0],orientation[1],orientation[2]), orientation[3]);
    };

    /** @inheritDoc */
    p.translate = function(translation){
		var destination = this.transform.translation.add( new XML3DRotation.setQuaternion(XML3DVec3(translation[0],translation[1],translation[2])) );
		if(this.constraint.constrainTranslation(destination))
			this.transform.translation.set(destination);
    };

    /** @inheritDoc */
    p.rotate = function(orientation){
		//TODO: check how the rotate should really work oO
		var modifier = new XML3DRotation();
		modifier.setQuaternion( new XML3DVec3(orientation[0],orientation[1],orientation[2]), orientation[3] );
		var destination = this.transform.rotation.multiply( modifier );
		if(this.constraint.constrainRotation(orientation))
			this.transform.rotation.setQuaternion(destination);
    };

    /** @inheritDoc */
    p.moveTo = function(position, time, opt){
		var dest_position = {x:position[0], y:position[1], z:position[2]};
		this.currentPosition.x = this.transform.translation.x;
		this.currentPosition.y = this.transform.translation.y;
		this.currentPosition.z = this.transform.translation.z;
		var tween = new TWEEN.Tween(this.currentPosition).to(dest_position, time);
		var that = this;
		tween.onUpdate( function() {
			that.setPosition([that.currentPosition.x,that.currentPosition.y,that.currentPosition.z]);
		} );
		tween.start();
		return this;
    };

    /** @inheritDoc */
    p.setConstraint = function(constraint){
		this.constraint = constraint;
    };

    //export
    XMOT.ClientMoveable = ClientMoveable;
}());
