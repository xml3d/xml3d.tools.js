(function() {

    /**
     * A Moveable implementation.
     * @constructor
     * @implements{Moveable}
     */
    function ClientMoveable(object, transform, constraint) {
    	/**
		 * Object which shall be moveable
		 * @protected
		 * @type {Object}
		 */
		this.object = object;
		/**
		 * Transform coords of the object and the Moveable
		 * @protected
		 * @type {}
		 */
		this.transform = transform;
		/**
		 * Constraint of the movement
		 * @protected
		 * @type {Constraint}
		 */
		this.constraint = constraint;
		/**
		 * Queue of movements
		 * @private
		 * @type {Array.<tween>}
		 */
		this.motionQueue = new Array();
		/**
		 * Where the last motion ended
		 * @private
		 * @type {Object} {x:number, y:number, z:number}
		 */
		this.endLastMotion = undefined;
    };

    var p = ClientMoveable.prototype;

    /** @inheritDoc */
    p.setPosition = function(position){
		//make the setPosition a translation in order to work with the constraint
		return this.translate([position[0]-this.transform.translation.x, position[1]-this.transform.translation.y, position[2]-this.transform.translation.z]);
    };

    /** @inheritDoc */
	p.setOrientation = function(orientation){
		if(this.constraint.constrainRotation(orientation, this))
			this.transform.rotation.setQuaternion(new XML3DVec3(orientation[0],orientation[1],orientation[2]), orientation[3]);
		return this;
    };

    /** @inheritDoc */
    p.translate = function(translation){
		if(this.constraint.constrainTranslation(translation, this))
			this.transform.translation.set(this.transform.translation.add( new XML3DVec3(translation[0],translation[1],translation[2]) ));
		return this;
    };

    /** @inheritDoc */
    p.rotate = function(orientation){
		//TODO: check how the rotate should really work oO
		var modifier = new XML3DRotation();
		modifier.setQuaternion( new XML3DVec3(orientation[0],orientation[1],orientation[2]), orientation[3] );
		var destination = this.transform.rotation.multiply( modifier );
		if(this.constraint.constrainRotation(orientation, this))
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
		if( this.motionQueue.length-1 == 0){
			tween.start();
			animate();
		}
		return this;
    };

    /**@inheritDoc */
    p.stop = function(){
		this.motionQueue.pop().stop();
		this.motionQueue = []; //clear array
    };

    /** @inheritDoc */
    p.setConstraint = function(constraint){
		this.constraint = constraint;
    };

    /**
     * Updates all the Tweens until all animations are finished
     */
    function animate(){
		if(TWEEN.getAll().length) {
			window.requestAnimFrame(animate);
			TWEEN.update();
		}
    };

    //export
    XMOT.ClientMoveable = ClientMoveable;
}());
