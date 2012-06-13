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
		 * @type {Array.<{tween: tween, startPosition:Array.<number>, endPosition:Array.<number>, startOrientation:Array.<number>, endOrientation:Array.<number>}>}
		 */
		this.motionQueue = new Array();
    };

    var p = ClientMoveable.prototype;

    /** @inheritDoc */
    p.setPosition = function(position){
		//make the setPosition a translation in order to work with the constraint
    	//TODO: make this somehow different?
		return this.translate([position[0]-this.transform.translation.x, position[1]-this.transform.translation.y, position[2]-this.transform.translation.z]);
    };

    /** @inheritDoc */
	p.setOrientation = function(orientation){
		if(this.constraint.constrainRotation(orientation, this)){
			this.transform.rotation.setQuaternion( new XML3DVec3(orientation[0],orientation[1],orientation[2]), orientation[3] );
		}
		return this;
    };

    /** @inheritDoc */
    p.getPosition = function(){
    	return [this.transform.translation.x, this.transform.translation.y, this.transform.translation.z];
    };

    /** @inheritDoc */
    p.getOrientation = function(){
    	var axis = this.transform.rotation.axis;
    	var angle = this.transform.rotation.angle;
    	return XMOT.axisAngleToQuaternion([axis.x, axis.y, axis.z], angle);
    };

    /** @inheritDoc */
    p.translate = function(translation){
		if(this.constraint.constrainTranslation(translation, this))
			this.transform.translation.set(this.transform.translation.add( new XML3DVec3(translation[0],translation[1],translation[2]) ));
		return this;
    };

    /** @inheritDoc */
    p.rotate = function(orientation){
		var modifier = new XML3DRotation();
		modifier.setQuaternion( new XML3DVec3(orientation[0],orientation[1],orientation[2]), orientation[3] );
		var destination = this.transform.rotation.multiply( modifier );
		if(this.constraint.constrainRotation(orientation, this))
			this.transform.rotation.set(destination);
		return this;
    };

    /** @inheritDoc */
    p.moveTo = function(position, orientation, time, opt){
    	//no movement needed
    	var queueingAllowed = (opt && opt.queueing != undefined) ? opt.queueing : true; 
		if( (position == undefined && orientation == undefined) || //nowhere to moveto
				( !queueingAllowed && this.motionQueue.length) ) //queuing forbiden, but something in progress
					return this;

		//crate new queue entry of the new given data:
		var newEntry = {};
		var tween = new TWEEN.Tween({t:0}).to({t:time}, time);
		if(opt && opt.delay != undefined) tween.delay(opt.delay);
		var that = this;
		var easing = undefined;
		if(opt && opt.easing != undefined) easing = opt.easing;
		//update callback
		tween.onUpdate( function() {
			//this is the data interpolated by the tween
			that.movement(this.t, 0, time, easing);
		} );
		//callback on complete
		tween.onComplete( function(){
			//this is the data interpolated by the tween
			//remove finished tween from the beginning of the queue
			that.motionQueue.shift();
			//start next tween (beginning of the queue), if there is any in the queue
			if(that.motionQueue.length != 0){
				that.motionQueue[0].tween.start();
			}
			//callback after the movement finished
			if(opt && opt.callback && typeof(opt.callback) === "function")
				opt.callback();
		});
		newEntry.tween = tween;
		newEntry.endPosition = position;
		newEntry.endOrientation = orientation;
		//default start values, are the current values
		newEntry.startPosition = this.getPosition();
		newEntry.startOrientation = this.getOrientation();
		if(this.motionQueue.length != 0){
			//we are not the first, we start, where the motion before ended
			//seek the last defined end values
			var q = this.motionQueue;
			var length = q.length;
			var i = 0;
			var tmp = undefined;
			for(i = length-1; i>-1; i--){
				tmp = q[i].endPosition;
				if(tmp != undefined){
					newEntry.startPosition = tmp;
					break;
				}
			}
			//2nd loop instead of more complex if statements
			for(i = length-1; i>-1; i--){
				if(q[i].endOrientation != undefined){
					newEntry.startOrientation = q[i].endOrientation;
					break;
				}
			}
		}

		//push tween to the end of the queue and start if queue was empty
		this.motionQueue.push(newEntry);
		if( this.motionQueue.length-1 == 0){
			newEntry.tween.start();
			if(!XMOT.animating) {
				XMOT.animate();
				XMOT.animating = true;
			}
		}
		return this;
    };

    /**
     * Applies one movement step to the moveable
     * @private
     */
    p.movement = function(currentTime, startTime, endTime, easing){
		var t = (currentTime - startTime) / (endTime - startTime);
		if(easing && typeof(easing) === "function") t = easing(t); //otherwise its linear
		var pos = this.interpolatePosition(t);
		var ori = this.interpolateOrientation(t);
		this.setValue(pos, ori);
    };

    /**
     * Interpolates the position of the current movement
     * @private
     * @param t interpolation parameter
     */
    p.interpolatePosition = function(t){
		var end = this.motionQueue[0].endPosition;
		if(end == undefined) return undefined;
		var start = this.motionQueue[0].startPosition;
		var ret = [];
		var i = 0;
		for(i=0; i<start.length; i++ ){
			ret[i] = start[i] + ( end[i] - start[i] ) * t;
		}
		return ret;
    };

    /**
     * interpoaltes the orientation of the current movement
     * @private
     * @param t interpolation paramater
     */
    p.interpolateOrientation = function(t){
		var end = this.motionQueue[0].endOrientation;
		if(end == undefined) return undefined;
		var start = this.motionQueue[0].startOrientation;
		//the newely created quat gets filled with the result and returned
		return quat4.slerp(start, end, t, quat4.create());
    };

    /**
	 * Set position and animation of the moveable
	 * @private
	 * @param {Array.<number>|undefined}
	 * @param {Array.<number>|undefined}
	 */
	p.setValue = function(position, orientation){
		if(position != undefined)
			this.setPosition(position);
		if(orientation != undefined)
			this.setOrientation(orientation);
	};

	/** @inheritDoc */
	p.movementInProgress = function(){
		return this.motionQueue.length > 0;
	};

    /**@inheritDoc */
    p.stop = function(){
		this.motionQueue.shift().tween.stop();
		this.motionQueue = []; //clear array
    };

    /** @inheritDoc */
    p.setConstraint = function(constraint){
		this.constraint = constraint;
    };

    //export
    XMOT.ClientMoveable = ClientMoveable;

}());
