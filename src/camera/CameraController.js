(function(){
	/**
	 * A CameraController
	 * In order to use the gamepad functiponality of this class do as follows:
	 * 1. Use Chrome 21 or higher.
	 * 2. Get A XBox360 Controller.
	 * (2. a: Use another Controller in XBox360 Emulation Mode)
	 * (2. b: Add your own XYZGamepad class in GamepadEventProvider.js)
	 * 3. Have Fun :-)
	 * @constructor
	 * @param {string} camera_id name of the group of the camera
	 * @param {string} xml3dElementId name of the group of the complete scene
	 * @param {XML3DRotation} initialRotation rotation to rotate the camera in a manner, that "forward" is a movement along -z
	 * @param {string} mouseButton "left", "right", "middle"
	 * @param {boolean} inspectMode determine wether to use inspectMode or not
	 */
	function CameraController(camera_id, xml3dElementId, initialRotation, mouseButton, inspectMode){
		/**
		 * @private
		 * @type {Object}
		 */
		this.currentlyPressedKeys = {};
		/**
		 * Points of Interest
		 * @private
		 * @type {Array.<{pos:Array.<number>, ori:Array.<number>}>}
		 */
		this.poi = [];
		/**
		 * Time to move to the next poi in milliseconds
		 * @private
		 * @type {number}
		 */
		this.poiMoveToTime = 3000; //ms
		/**
		 * last visited poi
		 * @private
		 * @type {number}
		 */
		this.currentPoi = 0;
		/**
		 * needed to check if the used poi button is released before triggering the next movement
		 * @private
		 * @type {boolean}
		 */
		this.allowPoi = true; 
		/**
		 * Old mouse position
		 * @private
		 * @type {{x: number, y: number}}
		 */
		this.oldMousePosition = {x:0,y:0};
		/**
		 * flag: mouse button currently down
		 * @private
		 * @type {boolean}
		 */
		this.mouseButtonIsDown = false;
		/**
		 * factor to slow or speed movement
		 * @private
		 * @type {number}
		 */
		this.slowthis = 1;
		/**
		 * Sensivity for movement of gamepad
		 * @private
		 * @type {number}
		 */
		this.moveSensivityPad = 0.04 * this.slowthis;
		/**
		 * Sensivity for rotation of gamepad
		 * @private
		 * @type {number}
		 */
		this.rotationSensivityPad = 0.01 * this.slowthis;
		/**
		 * Sensivity for movement of keyboard
		 * @private
		 * @type {number}
		 */
		this.moveSensivityKeyboard = 0.75 * this.slowthis;
		/**
		 * Sensivity for rotation of mouse and keyboard
		 * @private
		 * @type {number}
		 */
		this.rotationSensivityMouse = 0.005 * this.slowthis;
		/**
		 * Angle, that we currently look up or down
		 * @private
		 * @type {number}
		 */
		this.angleUp = 0;
		/**
		 * Constraint
		 * @private
		 * @type {ConstraintCollection}
		 */
		this.constraint = new XMOT.ConstraintCollection();
		/**
		 * Xml3d Element
		 * @private
		 * @type {HTMLElement}
		 */
		this.xml3dElement = document.getElementById(xml3dElementId);
		this.sceneBoundingBox = this.xml3dElement.getBoundingBox();

		var factory = XMOT.ClientMotionFactory;
		var cam = document.getElementById(camera_id);
		/**
		 * The Transformable
		 * @private
		 * @type {Transformable}
		 */
		this.transformable = factory.createTransformable(cam, this.constraint);
		var initRot = initialRotation || new XML3DRotation().setQuaternion(new XML3DVec3(0,0,0), 0);
		this.transformable.rotate(initialRotation);
		/**
		 * starting point of the transformable, used to reset position and orientation
		 * @private
		 * @type {{position: Array.<number>, orientation: Array.<number>}}
		 */
		this.startingPoint = {position:this.transformable.getPosition(), orientation:this.transformable.getOrientation()};

		/**
		 * Mousebutton on which the camera turns:
		 * 0 = left, 1 = middle, 2 = right;
		 */
		this.mouseButton = 0;
		this.setMouseButtonValue(mouseButton);
		this.pointToRotateAround = this.sceneBoundingBox.center();

		/**
		 * camera mode freeflight
		 * @type {Boolean|null}
		 */
		this.cameraModeInspect = inspectMode || false;
		this.cameraModeFreeflight = !this.cameraModeInspect;

		this.gamepadEventProvider = XMOT.GamepadEventProvider();
		this.padData = {};
		this.activate();

		//finally, register in the animation loop
		if( !XMOT.registeredCameraController){
			XMOT.registeredCameraController = this;
			XMOT.animate();
		}
		else
			throw "Only one CameraController allowed.";
	}
	var cc = CameraController.prototype;

	cc.activateInspectCameraMode = function(){
		this.cameraModeInspect = true;
		this.cameraModeFreeflight = !this.cameraModeInspect;
	};

	cc.activateFreeFlightCameraMode = function(){
		this.cameraModeFreeflight = true;
		this.cameraModeInspect = !this.cameraModeFreeflight;
	};

	/**
	 * Sets the used mouseButton for camera motion
	 */
	cc.setMouseButtonValue = function(button){
		if(button == "left") this.mouseButton = 0;
		else if(button == "middle") this.mouseButton = 1;
		else if(button == "right") this.mouseButton = 2;
	};

	/**
	 * Get current position in local space
	 * @public
	 * @return {XML3DVec3} 3D vector
	 */
	cc.getPosition = function(){
		return this.transformable.getPosition();
	};

	/**
	 * Get current orientation in local space
	 * @public
	 * @return {XML3DRotation} quaternion
	 */
	cc.getOrientation = function(){
		return this.transformable.getOrientation();
	};

	// public:
	/**
	 * Add a Point of Interest
	 * @public
	 * @param {XML3DVec3} position
	 * @param {XML3DRotation} orientation
	 * @return {CameraController} this
	 */
	cc.addPointOfInterest = function(position, orientation){
		this.poi.push({pos:position, ori:orientation});
		return this;
	};

	/**
	 * Remove the latest added Point of Interest
	 * @public
	 * @return {CameraController} this
	 */
	cc.removePointOfInterest = function(){
		this.poi.pop();
		return this;
	};

	/**
	 * Add a Constraint
	 * @public
	 * @param {Constraint} constraint
	 */
	cc.addConstraint = function(constraint){
		this.constraint.addConstraint(constraint);
	};

	/**
	 * Update movement
	 * @public
	 */
	cc.update = function(){
		this.updateKeyMovement();
		this.updateGamepadMovement();
	};

	// ---------- functions to handle movement ----------
	/**
	 * Move camera back and forward
	 * @private
	 * @param {number} l length of the movement
	 */
	cc.moveBackAndForward = function(l){
		if(l === 0) return;
		var vecZ = new XML3DVec3(0, 0, 1);
		var moveVec = this.transformable.getOrientation().rotateVec3(vecZ);
		moveVec = moveVec.normalize().scale(l);
		this.transformable.translate(moveVec);
	};

	/**
	 * Move camera left and right (strafe)
	 * @private
	 * @param {number} l length of the movement
	 */
	cc.moveLeftAndRight = function(l){
		if(l === 0) return;
		var vecX = new XML3DVec3(1, 0, 0); // global x is local z of the camera
		var moveVec = this.transformable.getOrientation().rotateVec3(vecX);
		moveVec = moveVec.normalize().scale(l);
		this.transformable.translate(moveVec);
		this.pointToRotateAround = this.pointToRotateAround.add(moveVec);
	};

	/**
	 * Move camera Up and Down
	 * @private
	 * @param {number} l length of the movement
	 */
	cc.moveUpAndDown = function(l){
		if(l === 0) return;
		var vecY = new XML3DVec3(0, 1, 0);
		var moveVec = this.transformable.getOrientation().rotateVec3(vecY);
		moveVec = moveVec.normalize().scale(l);
		this.transformable.translate(moveVec);
	};

	/**
	 * Move to the next Point of Interest
	 * @private
	 */
	cc.nextPoi = function(){
		if(this.poi.length == 0 || !this.allowPoi || this.transformable.movementInProgress()) return;
		this.currentPoi = this.currentPoi == this.poi.length-1 ? 0 : this.currentPoi+1;
		var movetopoi = this.poi[this.currentPoi];
		this.allowPoi = false;
		var that = this;
		this.transformable.moveTo(movetopoi.pos, movetopoi.ori, this.poiMoveToTime, {queueing: false, callback: function(){that.moveToCallback();}});
	};

	/**
	 * Move to the next Point of Interest
	 * @private
	 */
	cc.beforePoi = function(){
		if(this.poi.length == 0 || !this.allowPoi || this.transformable.movementInProgress()) return;
		this.currentPoi = this.currentPoi == 0 ? this.poi.length-1 : this.currentPoi-1;
		var movetopoi = this.poi[this.currentPoi];
		this.allowPoi = false;
		var that = this;
		this.transformable.moveTo(movetopoi.pos, movetopoi.ori, this.poiMoveToTime, {queueing: false, callback: function(){that.moveToCallback();}});
	};

	/**
	 * Stops the current movement to a poi
	 * @public
	 */
	cc.stopMovementToPoi = function(){
		this.transformable.stop();
		this.allowPoi = true;
	};

	/**
	 * rotate up/down before any other movement, this prevends from rolling
	 * @private
	 */
	cc.preventRolling = function(){
		this.transformable.rotate( new XML3DRotation( new XML3DVec3(1, 0, 0), -this.angleUp) );
		this.angleUp = 0;
	};

	/**
	 * Rotates the camera up and down by an given angle
	 * @private 
	 * @param {number} angle
	 */
	cc.rotateCameraUpAndDown = function(angle){
		this.angleUp += angle*Math.PI;
		this.transformable.rotate( new XML3DRotation(new XML3DVec3(1, 0, 0), angle*Math.PI) );
	};

	/**
	 * Rotates the camera left and right by an given angle
	 * @private 
	 * @param {number} angle
	 */
	cc.rotateCameraLeftAndRight = function(angle){
		//rotate up/down befor rotating sidewards, this prevends from rolling
		this.transformable.rotate( new XML3DRotation(new XML3DVec3(1, 0, 0), -this.angleUp) );
		this.transformable.rotate( new XML3DRotation(new XML3DVec3(0, 1, 0), angle*Math.PI) );
		//and rotate up/down again
		this.transformable.rotate( new XML3DRotation(new XML3DVec3(1, 0, 0), this.angleUp) );
	};

	cc.rotateCameraAroundPointLeftAndRight = function(angle){
		var distanceToLookAt = this.distanceBetweenCameraAndPoint(this.pointToRotateAround);
		this.transformable.setPosition(new XML3DVec3(0, 0, 0));
		this.rotateCameraLeftAndRight(angle);
		var newDirection = this.cameraDirectionAsXML3D();
		var tmp = newDirection.scale(distanceToLookAt).negate();
		this.transformable.setPosition(tmp);
		this.transformable.translate(this.pointToRotateAround);
	};

	cc.rotateCameraAroundPointUpAndDown = function(angle){
		var distanceToLookAt = this.distanceBetweenCameraAndPoint(this.pointToRotateAround);
		this.transformable.setPosition(new XML3DVec3(0, 0, 0));
		this.rotateCameraUpAndDown(angle);
		var newDirection = this.cameraDirectionAsXML3D();
		var tmp = newDirection.scale(distanceToLookAt).negate();
		this.transformable.setPosition(tmp);
		this.transformable.translate(this.pointToRotateAround);
	};

	/**
	 * distance between camera and a point
	 * @param {XML3DVec3} point
	 * @return {Number|void}
	 */
	cc.distanceBetweenCameraAndPoint = function(point){
		var camPosition = this.transformable.transform.translation;
		return camPosition.subtract(point).length();
	};

	/**
	 * look at a certain point
	 * @public
	 * @param {XML3DVec3} point
	 */
	cc.lookAtPoint = function(point){
		var position = this.getPosition();
		var direction = point.subtract(position);
		var orientation = this.getRotationFromDirection(direction);
		this.transformable.setOrientation(orientation);
	};

	/**
	 * Get rotation to look from a point at another
	 * @param {XML3DVec3} fromPoint
	 * @param {XML3DVec3} atPoint
	 * @return {XML3DVec3|void}
	 */
	cc.getRotationToLookFromPointAtPoint = function (fromPoint, atPoint) {
		return this.getRotationFromDirection(atPoint.subtract(fromPoint));
	};

	/**
	 * @private
	 * @param {XML3DVec3} direction
	 * @return {{XML3DVec3}|void}
	 */
	cc.getRotationFromDirection = function (direction) {
		//xml3DVec3 fails with error if normalizing null vector
		if (!direction) direction =  new window.XML3DVec3(0,0,-1);

		if( !(direction.x == 0 && direction.y == 0 && direction.z == 0) ){
			direction = direction.normalize();
		}


		var up = new XML3DVec3(0,1,0);
		var tmpX = direction.cross(up);

		if(tmpX.length() != 0) {
			tmpX = this.transformable.transform.rotation.rotateVec3(new window.XML3DVec3(1,0,0))._data;
		}
		var tmpY = tmpX.cross(direction);
		var tmpZ = direction.negate();

		var q = quat4.create();
		quat4.setFromBasis(tmpX, up._data, tmpZ, q);
		var lookAtVector = new XML3DRotation();
		lookAtVector._setQuaternion(q);
		return lookAtVector;
	};

	/**
	 * Returns the normalized camera Direction in XML3D format
	 * @private
	 * @return {*}
	 */
	cc.cameraDirectionAsXML3D = function(){
		var camOrientation = this.transformable.transform.rotation;
		// as per spec: [getOrientation] is the orientation multiplied with the default direction (0, 0, -1)
		return camOrientation.rotateVec3(new XML3DVec3(0,0,-1)).normalize();
	};

	/**
	 * Resets the camera to the starting Position
	 * @private 
	 */
	cc.reset = function(){
		this.transformable.setPosition(this.startingPoint.position);
		this.transformable.setOrientation(this.startingPoint.orientation);
		this.angleUp = 0;
	};

	/**
	 * Callback of the movement to a PoI
	 * Needed to prevent movement while we move to a PoI
	 * @private 
	 */
	cc.moveToCallback = function(){
		this.allowPoi = true;
	};
	
	// ---------- event handler ----------

	/**
	 * Init Events
	 */
	cc.activate = function(){
		this.toggleHandlers(true); 
	};
	
	/**
	 * Deregister from all events
	 */
	cc.deactivate = function(){
		this.toggleHandlers(false); 
	};

	/** 
	 * (de-)registers event handlers for the controller. 
	 * @private
	 */
	cc.toggleHandlers = function(switchOn){

		var cb = XMOT.util.wrapCallback;

		// select the callbacks
		var winListener = window.addEventListener; 
		var xml3dListener = this.xml3dElement.addEventListener; 
		
		if(switchOn === false)
		{
			winListener = window.removeEventListener; 
			xml3dListener = this.xml3dElement.removeEventListener; 
		}

		//registered on window, since registring on div did not work, events never triggered        
		winListener.call(window, "keydown", cb(this, this.keyDownEventHandler), false);
		winListener.call(window, "keyup", cb(this, this.keyUpEventHandler), false);
		winListener.call(window, "mousemove", cb(this, this.mouseMovementHandler), false);
		winListener.call(window, "mouseup", cb(this, this.mouseUpHandler), false);
		xml3dListener.call(this.xml3dElement, "mousedown", cb(this, this.mouseDownHandler), false);
		
		winListener.call(window, "GamepadButtonDown", cb(this, this.gamepadButtonDownHandler), false);
		winListener.call(window, "GamepadButtonUp", cb(this, this.gamepadButtonUpHandler), false);
		winListener.call(window, "GamepadAxis", cb(this, this.gamepadAxisHandler), false);
	};

	/**
	 * Handles key events
	 * @private
	 * @param {Event} e event
	 */
	cc.keyDownEventHandler = function(e){
		if(!this.allowPoi) return;
		e = window.event || e;
		var kc = e.keyCode;
		if(! this.currentlyPressedKeys[kc])
		{
			var flag = this.moveWithKey(kc);
			if(flag){
				this.currentlyPressedKeys[kc] = true;
			}
			switch(kc){
				case XMOT.KEY_Q : this.nextPoi(); break; 
				case XMOT.KEY_E : this.beforePoi(); break;
				case XMOT.KEY_R : this.reset(); break; 
				case XMOT.KEY_T : this.seeTheCompleteScene(); break;
				default : flag = false; break;
			}
			if(flag) this.stopDefaultEventAction(e);
		}
	};

	/**
	 * Removes key from the list of currently pressed keys
	 * @param {Event} e
	 */
	cc.keyUpEventHandler = function(e){
	    if(!this.allowPoi) return;
	    e = window.event || e;
	    delete this.currentlyPressedKeys[e.keyCode];
	};

	/**
	 * handle single key
	 * @private
	 * @param {number} keyCode
	 * @return {boolean}
	 */
	cc.moveWithKey = function(keyCode){
	    switch(keyCode){
			case XMOT.KEY_S : this.moveBackAndForward(this.moveSensivityKeyboard); break; 
			case XMOT.KEY_W : this.moveBackAndForward(-this.moveSensivityKeyboard); break; 
			case XMOT.KEY_A : this.moveLeftAndRight(-this.moveSensivityKeyboard); break; 
			case XMOT.KEY_D : this.moveLeftAndRight(this.moveSensivityKeyboard); break;
			case XMOT.KEY_PGUP : this.moveUpAndDown(this.moveSensivityKeyboard); break; 
			case XMOT.KEY_PGDOWN : this.moveUpAndDown(-this.moveSensivityKeyboard); break; 
			case XMOT.KEY_UP : this.rotateUpAndDown(this.rotationSensivityMouse); break;
			case XMOT.KEY_DOWN : this.rotateUpAndDown(-this.rotationSensivityMouse); break; 
			case XMOT.KEY_LEFT : this.rotateLeftAndRight(this.rotationSensivityMouse); break;
			case XMOT.KEY_RIGHT : this.rotateLeftAndRight(-this.rotationSensivityMouse); break; 
	        default : return false; break;
	    }
	    return true;
	};

	cc.rotateLeftAndRight = function(angle)
	{
		if(angle === 0) return;
		if(this.cameraModeInspect){
			this.rotateCameraAroundPointLeftAndRight(angle);
		}else if(this.cameraModeFreeflight){
			this.rotateCameraLeftAndRight(angle);
		}
	};

	cc.rotateUpAndDown = function(angle)
	{
		if(angle === 0) return;
		if(this.cameraModeInspect){
			this.rotateCameraAroundPointUpAndDown(angle);
		}else if(this.cameraModeFreeflight){
			this.rotateCameraUpAndDown(angle);
		}
	};

	/**
	 * update movement of currently pressed keys
	 * @private
	 */
	cc.updateKeyMovement = function(){
	    for(var kc in this.currentlyPressedKeys){
	        this.moveWithKey(kc*1); //*1 -> to make its a number now
	    }
	};

	/**
	 * Handles mousemovement events
	 * @private
	 * @param {Event} e event
	 */
	cc.mouseMovementHandler = function(e){
		if(!this.mouseButtonIsDown || !this.allowPoi) return;
		var currentX = e.pageX;
		var currentY = e.pageY;
		var x = currentX - this.oldMousePosition.x;
		var y = currentY - this.oldMousePosition.y;
		this.oldMousePosition.x = currentX;
		this.oldMousePosition.y = currentY;
		if(x != 0)
			this.rotateLeftAndRight(-this.rotationSensivityMouse*x);
		if(y != 0)
			this.rotateUpAndDown(-this.rotationSensivityMouse*y);
	};

	/**
	 * Handles mousebutton up event
	 * @private
	 * @param {Event} e event
	 */
	cc.mouseUpHandler = function(e){
		if(e.button == this.mouseButton){
			this.stopDefaultEventAction(e);
			this.mouseButtonIsDown = false;
		}
	};

	/**
	 * Handles mousebutton down events
	 * @private
	 * @param {Event} e event
	 */
	cc.mouseDownHandler = function(e){
		if(e.button == this.mouseButton){
			this.stopDefaultEventAction(e);
			this.mouseButtonIsDown = true;
			this.oldMousePosition.x = e.pageX;
			this.oldMousePosition.y = e.pageY;
		}
	};

	cc.updateGamepadMovement = function(){
		for(var item in this.padData){
			switch (item){
				case "RT" : this.moveUpAndDown(this.padData[item]*this.moveSensivityPad); break;
				case "LT" : this.moveUpAndDown(this.padData[item]*this.moveSensivityPad*-1); break;
				case "Left" : if(this.padData[item]) this.moveLeftAndRight(this.moveSensivityPad*-1); break;
				case "Right" : if(this.padData[item]) this.moveLeftAndRight(this.moveSensivityPad); break;
				case "Up" : if(this.padData[item]) this.moveBackAndForward(this.moveSensivityPad*-1); break;
				case "Down" : if(this.padData[item]) this.moveBackAndForward(this.moveSensivityPad); break;
				case "LeftStickX" : this.moveLeftAndRight(this.padData[item] * this.moveSensivityPad); break;
				case "LeftStickY" : this.moveBackAndForward(this.padData[item] * this.moveSensivityPad); break;
				case "RightStickX" : this.rotateLeftAndRight(this.padData[item] * this.rotationSensivityPad*-1); break;
				case "RightStickY" : this.rotateUpAndDown(this.padData[item] * this.rotationSensivityPad); break;
				default: break;
			}
		}
	};

	cc.gamepadButtonDownHandler = function(e){
		switch (e.detail.button) {
			case "RB": this.nextPoi(); break;
			case "LB": this.beforePoi(); break;
			case "Start": this.reset(); break;
			case "Back" : this.seeTheCompleteScene(); break;
			default: this.padData[e.detail.button] = e.detail.value; break;
		}
	};

	cc.gamepadButtonUpHandler = function(e){
		this.padData[e.detail.button] = e.detail.value;
	};

	cc.gamepadAxisHandler = function(e){
		this.padData[e.detail.axis] = this.handleAxisThreshold(e.detail.value);
	};

	cc.handleAxisThreshold = function(value){
		if(value > 0.15 || value < -0.15)
			return value;
		else
			return 0;
	};

	/**
	 * Stops HTML Default action of events
	 * Note: in some Browsers the context menu still apears, but there is a workaround:
	 * <body ... oncontextmenu="return false;">
	 * @param {Object} e event
	 */
	cc.stopDefaultEventAction = function(e){
		if (e && e.preventDefault) {
			e.preventDefault();
		} else if (window.event && window.event.returnValue){
			window.eventReturnValue = false;
		}
	};

	cc.seeTheCompleteScene = function(){
		var center = this.sceneBoundingBox.center();
		this.lookAtPoint([center.x, center.y, center.z]);
		var moveBy = this.sceneBoundingBox.max;
		this.transformable.setPosition([2*moveBy.x, 2*moveBy.y, 4*moveBy.z]);
	};

	XMOT.CameraController = CameraController;
}());