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
		var trans = this.transform.translation;
		var rot = this.transform.rotation;
		this.endMotionData	=  {pos_x:trans.x, pos_y:trans.y, pos_z:trans.z, ori_x:rot._axis.x, ori_y:rot._axis.y, ori_z:rot._axis.z, ori_a:rot._angle};
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
			this.transform.rotation.setQuaternion( new XML3DVec3(orientation[0],orientation[1],orientation[2]), orientation[3] );
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
    	//TODO: implment slerp of the rotation
    	//no movement needed
		if(position == undefined && orientation == undefined) return this;

		//endMotionData = data where the last motion ended; if the queue is empty, this is where we are
		if( this.motionQueue.length == 0){
			var trans = this.transform.translation;
			var rot = this.transform.rotation;
			this.endMotionData	=  {pos_x:trans.x, pos_y:trans.y, pos_z:trans.z, ori_x:rot._axis.x, ori_y:rot._axis.y, ori_z:rot._axis.z, ori_a:rot._angle};
		}
		//start of the chained motion is end of the the one before, if there is one before
    	//var currentData = this.endMotionData; need copyconstructor
		var currentData = {pos_x:this.endMotionData.pos_x, pos_y:this.endMotionData.pos_y, pos_z:this.endMotionData.pos_z, ori_x:this.endMotionData.ori_x, ori_y:this.endMotionData.ori_y, ori_z:this.endMotionData.ori_z, ori_a:this.endMotionData.ori_a};

		//if undefined keep old values, which are not handled anyway
		var destData = {pos_x:this.endMotionData.pos_x, pos_y:this.endMotionData.pos_y, pos_z:this.endMotionData.pos_z, ori_x:this.endMotionData.ori_x, ori_y:this.endMotionData.ori_y, ori_z:this.endMotionData.ori_z, ori_a:this.endMotionData.ori_a};
		if(orientation === undefined){
			destData.pos_x = position[0];
			destData.pos_y = position[1];
			destData.pos_z = position[2];
		}else if(position === undefined){
			//TODO: is there a better way to address the data of the rotation?
			destData.ori_x = orientation[0];
			destData.ori_y = orientation[1];
			destData.ori_z = orientation[2];
			destData.ori_a = orientation[3];
		}
		else
			destData = {pos_x:position[0], pos_y:position[1], pos_z:position[2], ori_x:orientation[0], ori_y:orientation[1], ori_z:orientation[2], ori_a:orientation[3]};

		var tween = new TWEEN.Tween(currentData).to(destData, time);

		//this.endMotionData = destData;
		this.endMotionData = {pos_x:destData.pos_x, pos_y:destData.pos_y, pos_z:destData.pos_z, ori_x:destData.ori_x, ori_y:destData.ori_y, ori_z:destData.ori_z, ori_a:destData.ori_a};

		var that = this;
		//update callback
		tween.onUpdate( function() {
			//this is currentData
			if(position != undefined)
				that.setPosition([this.pos_x, this.pos_y, this.pos_z]);
			if(orientation != undefined)
				that.setOrientation([this.ori_x, this.ori_y, this.ori_z, this.ori_a]);
		} );

		//callback on complete
		tween.onComplete( function(){
			//this is currentData
			//remove finished tween from the end of the queue
			that.motionQueue.pop();
			//start next tween (end of the queue), if there is any in the queue
			if(that.motionQueue.length != 0){
				that.motionQueue[that.motionQueue.length-1].start();
			}
			//callback after the movement finished
			if(opt && opt.callback && typeof(opt.callback) === "function")
				opt.callback();
		});

		//push tween to the beginning of the queue and start if queue was empty
		this.motionQueue.unshift(tween);
		if( this.motionQueue.length-1 == 0){
			tween.start();
			if(!XMOT.animating) {
				animate();
				XMOT.animating = true;
			}
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
     * global variable, used to check if an animation or movement is currently in progress
     */
    var animating = false;

    /**
     * Updates all the Tweens until all animations are finished
     */
    function animate(){
		if(TWEEN.getAll().length) {
			window.requestAnimFrame(XMOT.animate);
			TWEEN.update();
		}
		else
			XMOT.animating = false;
    };

    //export
    XMOT.ClientMoveable = ClientMoveable;
    XMOT.animate = animate;
    XMOT.animating = animating;
}());
