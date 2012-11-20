(function() {

    /**
     * A Transformable implementation.
     * @constructor
     * @implements{Transformable}
     */
    function ClientTransformable(object, transform, constraint) {
    	/**
		 * Object which shall be transformable
		 * @protected
		 * @type {Object}
		 */
		this.object = object;
		/**
		 * Transform coords of the object and the Transformable
		 * @protected
		 * @type {Object}
		 */
		this.transform = transform;
		
		/**
		 * Constraint of the movement
		 * @protected
		 * @type {Constraint}
		 */
		if(!constraint)
			constraint = new XMOT.SimpleConstraint(true, true, true); 
		this.constraint = constraint;
		
		/**
		 * Queue of movements
		 * @private
		 * @type {Array.<{tween: tween, startPosition:Array.<number>, endPosition:Array.<number>, startOrientation:Array.<number>, endOrientation:Array.<number>}>}
		 */
		this.motionQueue = [];
    }

    var p = ClientTransformable.prototype;

    /** @inheritDoc */
    p.setPosition = function(position){
		if(this.constraint.constrainTranslation(position, {transformable: this}))
			this.transform.translation.set(position);
		return this;
    };

    /** @inheritDoc */
	p.setOrientation = function(orientation){
		if(this.constraint.constrainRotation(orientation, {transformable: this})){
			this.transform.rotation.setQuaternion(orientation);
		}
		return this;
    };

    /** @inheritDoc */
    p.setScale = function(scale){
        if(this.constraint.constrainScaling(scale, {transformable: this})){
            this.transform.scale.set(scale);
        }
    };

    /** @inheritDoc */
    p.getPosition = function(){
    	return this.transform.translation;
    };

    /** @inheritDoc */
    p.getOrientation = function(){
		return this.transform.rotation;
    };

    /** @inheritDoc */
    p.getScale = function(){
    	return this.transform.scale;
    };

    /** @inheritDoc */
    p.translate = function(translation){
    	return this.setPosition( translation.add(this.getPosition()) );
    };

    /** @inheritDoc */
    p.rotate = function(orientation){
		var destination = new XML3DRotation(this.transform.rotation, undefined, undefined);
		destination.multiply( orientation );
		if(this.constraint.constrainRotation(orientation, {transformable: this}))
			this.transform.rotation.set(destination);
		return this;
    };

    /** @inheritDoc */
    p.scale = function(factor){
    	this.transform.scale.multiply(factor);
    	return this;
    };

    /** @inheritDoc */
    p.moveTo = function(position, orientation, time, opt){
    	opt = opt || {};
    	//no movement needed
    	var queueingAllowed = opt.queueing || true;
		if( (position == undefined && orientation == undefined) || //nowhere to moveto
			(!queueingAllowed && this.movementInProgress()) || //queuing forbiden, but something in progress
			(this.checkIfNoNeedToMove(position, orientation)) ){
			if(opt.callback) opt.callback();
			return this;
		}

		//create new queue entry of the new given data:
		var newEntry = {};
		var tween = new TWEEN.Tween({t:0}).to({t:time}, time);
		if(opt.delay != undefined) tween.delay(opt.delay);
		var that = this;
		var easing = opt.easing;
		//update callback
		tween.onUpdate( function() {
			//this is the data interpolated by the tween
			that.movement(this.t, 0, time, easing);
		} );
		//callback on complete
		tween.onComplete( function(){
			//this is the data interpolated by the tween

			//start next tween (beginning of the queue), if there is any in the queue
			if(that.motionQueue.length > 1){ //we did not remove the finished one yet
				//set startpos / ori of the following moveTo, instead of setting at definition
				var followingMovement = that.motionQueue[1];
				var endedMovement = that.motionQueue[0];
				followingMovement.startPosition = endedMovement.endPosition || that.getPosition();
				followingMovement.startOrientation = endedMovement.endOrientation || that.getOrientation();
				followingMovement.tween.start();
			}
			//remove finished tween from the beginning of the queue
			that.motionQueue.shift();
			//callback after the movement finished
			if(opt.callback && typeof(opt.callback) === "function")
				opt.callback();
		});
		newEntry.tween = tween;
		newEntry.endPosition = position;
		newEntry.endOrientation = orientation;
		//default start values, are the current values
		//those are overwritten if a tween ends before us, see the onComplete callback
		newEntry.startPosition = this.getPosition();
		newEntry.startOrientation = this.getOrientation();

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
	 * Checks if we need to move to a poi or if we are already there
	 * @private
	 * @param {Array.<number>} position
	 * @param {Array.<number>} orientation
	 * @return {boolean}
	 */
	p.checkIfNoNeedToMove = function(position, orientation){
		if(!position && !orientation) return true;
		if(!position && orientation) return this.checkPosition(orientation);
		if(position && !orientation) return this.checkPosition(position);
		return this.checkPosition(position) && this.checkPosition(orientation);
	};

	/**
	 * check if current position equals moveTo position
	 * @private
	 * @param {Array.<number>} position
	 * @return {boolean}
	 */
	p.checkPosition = function(position){
		var curPos = this.transform.translation;
		return (curPos.x == position.x && curPos.y == position.y && curPos.z == position.z);
	};

	/**
	 * check if current orientation equals moveTo orientation
	 * @private
	 * @param {Array.<number>} orientation
	 * @return {boolean}
	 */
	p.checkOrientation = function(orientation){
		var curOri = this.transform.orientation;
		return (curOri.x === orientation.x && curOri.y === orientation.y && curOri.z === orientation.z && curOri.w === orientation.w);
	};

    /**
     * Applies one movement step to the transformable
     * @private
     * @param {number}currentTime
     * @param {number} startTime
     * @param {number} endTime
     * @param {Function} easing
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
     * @param {number} t interpolation parameter
     * @return {Array.<number>|undefined} position
     */
    p.interpolatePosition = function(t){
		var end = this.motionQueue[0].endPosition;
		if(end == undefined) return undefined;
		var start = this.motionQueue[0].startPosition;
		var interpolatedX = start.x + ( end.x - start.x ) * t;
		var interpolatedY = start.y + ( end.y - start.y ) * t;
		var interpolatedZ = start.z + ( end.z - start.z ) * t;
		return new XML3DVec3( interpolatedX, interpolatedY, interpolatedZ );
    };

    /**
     * interpoaltes the orientation of the current movement
     * @private
     * @param {number} t interpolation paramater
     * @return {Array.<number>|undefined} orientation
     */
    p.interpolateOrientation = function(t){
		var end = this.motionQueue[0].endOrientation;
		if(end == undefined) return undefined;
		var start = this.motionQueue[0].startOrientation;
		return XMOT.math.slerp(start, end, t);
    };

    /**
	 * Set position and animation of the transformable
	 * @private
	 * @param {Array.<number>|undefined} position
	 * @param {Array.<number>|undefined} orientation
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
		var motion = this.motionQueue.shift();
		if(motion) motion.tween.stop();
		this.motionQueue = [];
		return this;
    };

    /** @inheritDoc */
    p.setConstraint = function(constraint){
		this.constraint = constraint;
    };

    //export
    XMOT.ClientTransformable = ClientTransformable;

}());