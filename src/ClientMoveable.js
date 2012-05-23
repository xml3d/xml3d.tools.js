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
		 * Destination Orientation and position of the last motion in the queue
		 * @private
		 * @type {Object} {pos_x:number, pos_y:number, pos_z:number, ori_x:number, ori_y:number, ori_z:number, ori_a:number}
		 */
		this.endMotionData = undefined;
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
    p.moveTo = function(position, orientation, time, opt){
    	//TODO: opt!
    	//TODO: rotation shows some strange behaviour!

		//no movement needed
		if(position == undefined && orientation == undefined) return this;

		//check wether we have to use the current values for position or orientation
		var destData = undefined;
		if(orientation == undefined){
			var rot = this.transform.rotation;
			destData = {pos_x:position[0], pos_y:position[1], pos_z:position[2], ori_x:rot._axis.x, ori_y:rot._axis.y, ori_z:rot._axis.z, ori_a:rot._angle};
		}else if(position == undefined){
			var trans = this.transform.translation;
			destData = {pos_x:trans.x, pos_y:trans.y, pos_z:trans.z, ori_x:orientation[0], ori_y:orientation[1], ori_z:orientation[2], ori_a:orientation[3]};
		}
		else
			destData = {pos_x:position[0], pos_y:position[1], pos_z:position[2], ori_x:orientation[0], ori_y:orientation[1], ori_z:orientation[2], ori_a:orientation[3]};
		var currentData = undefined;
		//start of the chained motion is end of the the one before, if there is one before
		if( this.motionQueue.length != 0)
			currentData = this.endMotionData;
		else{
			var trans = this.transform.translation;
			var rot = this.transform.rotation;
			currentData	=  {pos_x:trans.x, pos_y:trans.y, pos_z:trans.z, ori_x:rot._axis.x, ori_y:rot._axis.y, ori_z:rot._axis.z, ori_a:rot._angle};
		}
				//TODO: is there a better way to address the data of the rotation?
		var tween = new TWEEN.Tween(currentData).to(destData, time);
		this.endMotionData = destData;

		var that = this;
		//update callback
		tween.onUpdate( function() {
			that.setPosition([currentData.pos_x, currentData.pos_y, currentData.pos_z]);
			that.setOrientation([currentData.ori_x, currentData.ori_y, currentData.ori_z, currentData.ori_a]);
		} );

		//callback on complete
		tween.onComplete( function(){
			//last motion step, just in case
			that.setPosition([currentData.pos_x, currentData.pos_y, currentData.pos_z]);
			that.setOrientation([currentData.ori_x, currentData.ori_y, currentData.ori_z, currentData.ori_a]);
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
