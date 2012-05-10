
(function() {

    /**
     * A Moveable implementation.
     * @implements{Moveable}
     */
    function ClientMoveable(object, transform, constraint) {
		this.object = object;
		this.transform = transform;
		this.constraint = constraint;
		//movement queue
		this.motionQueue = new Array();
		this.endLastMotion = undefined;
    };

    var p = ClientMoveable.prototype;

    /** @inheritDoc */
    p.setPosition = function(position){
    	if(this.constraint.constrainTranslation(position))
    		this.transform.translation.set(position[0],position[1],position[2]);
    	return this;
    };

    /** @inheritDoc */
	p.setOrientation = function(orientation){
		if(this.constraint.constrainRotation(orientation))
			this.transform.rotation.setQuaternion(new XML3DVec3(orientation[0],orientation[1],orientation[2]), orientation[3]);
		return this;
    };

    /** @inheritDoc */
    p.translate = function(translation){
		var destination = this.transform.translation.add( new XML3DRotation.setQuaternion(XML3DVec3(translation[0],translation[1],translation[2])) );
		if(this.constraint.constrainTranslation(destination))
			this.transform.translation.set(destination);
		return this;
    };

    /** @inheritDoc */
    p.rotate = function(orientation){
		//TODO: check how the rotate should really work oO
		var modifier = new XML3DRotation();
		modifier.setQuaternion( new XML3DVec3(orientation[0],orientation[1],orientation[2]), orientation[3] );
		var destination = this.transform.rotation.multiply( modifier );
		if(this.constraint.constrainRotation(orientation))
			this.transform.rotation.setQuaternion(destination);
		return this;
    };

    /** @inheritDoc */
    p.moveTo = function(position, time, opt){
		var dest_position = {x:position[0], y:position[1], z:position[2]};
		var currentPosition = undefined;
		//start of the chained motion is end of the the one before, if there is one before
		if( this.motionQueue.length != 0)
			currentPosition = this.endLastMotion;
		else
			currentPosition	=  {x:this.transform.translation.x, y:this.transform.translation.y, z:this.transform.translation.z};
		var tween = new TWEEN.Tween(currentPosition).to(dest_position, time);
		this.endLastMotion = dest_position;

		var that = this;
		//update callback
		tween.onUpdate( function() {
			that.setPosition([currentPosition.x, currentPosition.y, currentPosition.z]);
		} );

		//callback on complete
		tween.onComplete( function(){
			//last motion step, just in case
			that.setPosition([currentPosition.x, currentPosition.y, currentPosition.z]);
			//remove finished tween from the end of the queue
			that.motionQueue.pop();
			//start next tween (end of the queue), if there is any in the queue
			if(that.motionQueue.length != 0)
				that.motionQueue[that.motionQueue.length-1].start();
		});

		//push tween to the beginning of the queue and start if queue was empty
		this.motionQueue.unshift(tween);
		if( this.motionQueue.length-1 == 0)
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
