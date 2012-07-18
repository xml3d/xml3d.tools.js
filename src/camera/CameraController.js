(function(){
	/**
	 * A CameraController
	 * @constructor
	 * @param {string} camera_id name of the group of the camera
	 * @param {Array.<number>} initialRotation rotation to rotate the camera in a manner, that "forward" is a movement along -z
	 */
	function CameraController(camera_id, initialRotation){
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
		this.moveSensivityPad = 0.4 * this.slowthis;
		/**
		 * Sensivity for rotation of gamepad
		 * @private
		 * @type {number}
		 */
		this.rotationSensivityPad = 0.0025 * this.slowthis;
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
		this.rotationSensivityMouse = 0.00125 * this.slowthis;
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
	
		var factory = new XMOT.ClientMotionFactory();
		var cam = document.getElementById(camera_id);
		/**
		 * The Moveable
		 * @private
		 * @type {Moveable}
		 */
		this.moveable = factory.createMoveable(cam, this.constraint);
		this.moveable.rotate(initialRotation);
		/**
		 * starting point of the moveable, used to reset position and orientation
		 * @private
		 * @type {{position: Array.<number>, orientation: Array.<number>}}
		 */
		this.startingPoint = {position:this.moveable.getPosition(), orientation:this.moveable.getOrientation()};
	
		this.initEvents();
	};
	var cc = CameraController.prototype;
	
	// public:
	/**
	 * Add a Point of Interest
	 * @public
	 * @param {Array.<number>} position
	 * @param {Array.<number>} orientation
	 */
	cc.addPointOfInterest = function(position, orientation){
		this.poi.push({pos:position, ori:orientation});
	};

//TODO: removepoi(index)
	
	/**
	 * Add a Constraint
	 * @public
	 * @param {Constraint} constraint
	 */
	cc.addConstraint = function(constraint){
		this.constraint.addConstraint(constraint);
	};
	
	/**
	 * updates the controller
	 * @public
	 */
	cc.updateController = function() {
		if(!window.Gamepad)return;
		var pads = Gamepad.getStates();
		for ( var i = 0; i < pads.length; ++i) {
			var pad = pads[i];
			if (pad) {
				if(pad.rightShoulder1){ //lower shoulder buttons
					this.nextPoi();
				}
				if(pad.leftShoulder1){
					this.beforePoi();
				}
				if(pad.rightShoulder0){ //upper shoulder buttons
					this.moveUpAndDown(-this.moveSensivityPad);
				}
				if(pad.leftShoulder0){
					this.moveUpAndDown(this.moveSensivityPad);
				}
				if(pad.start){
					this.reset();
				}
				//back and for
				var y = (pad.leftStickY < -0.15 || pad.leftStickY > 0.15) ? pad.leftStickY : 0;
				if(y != 0) this.moveBackAndForward(y*this.moveSensivityPad);
				//left and right - transalte
				var x = (pad.leftStickX < -0.15 || pad.leftStickX > 0.15) ? pad.leftStickX : 0;
				if(x != 0) this.moveLeftAndRight(x*this.moveSensivityPad);
				//up and down
				var rotUpDown = (pad.rightStickY < -0.15 || pad.rightStickY > 0.15) ? pad.rightStickY : 0;
				if(rotUpDown != 0) this.rotateCameraUpAndDown(-this.rotationSensivityPad*rotUpDown);
				//left and right - rotate
				var rotLeftRight = (pad.rightStickX < -0.15 || pad.rightStickX > 0.15) ? pad.rightStickX : 0;
				if(rotLeftRight != 0) this.rotateCameraLeftAndRight(-this.rotationSensivityPad*rotLeftRight);
			}
		}
	};
	
	// private:
	// ---------- functions to handle movement ----------
	/**
	 * Move camera back and forward
	 * @private
	 * @param {number} l length of the movement
	 */
	cc.moveBackAndForward = function(l){
		var vecX = [0, 0, 1];
		var result = vec3.create();
		quat4.multiplyVec3(this.moveable.getOrientation(),vecX, result);
		this.moveable.translate(vec3.scale(vec3.normalize(result), l));
	};
	
	/**
	 * Move camera left and right (strafe)
	 * @private
	 * @param {number} l length of the movement
	 */
	cc.moveLeftAndRight = function(l){
		var vecY = [1, 0, 0]; // global x is local z of the camera
		var result = vec3.create();
		quat4.multiplyVec3(this.moveable.getOrientation(),vecY, result);
		this.moveable.translate(vec3.scale(vec3.normalize(result), l));
	};
	
	/**
	 * Move camera Up and Down
	 * @private
	 * @param {number} l length of the movement
	 */
	cc.moveUpAndDown = function(l){
		var vecY = this.upVector;
		var result = vec3.create();
		quat4.multiplyVec3(this.moveable.getOrientation(),vecY, result);
		this.moveable.translate(vec3.scale(vec3.normalize(result), l));
	};
	
	/**
	 * Move to the next Point of Interest
	 * @private
	 */
	cc.nextPoi = function(){
		if(!this.allowPoi || this.moveable.movementInProgress()) return;
		//rotate up/down before any other movement, this prevends from rolling
		this.moveable.rotate( XMOT.axisAngleToQuaternion( [1,0,0], -this.angleUp) );
		this.angleUp = 0;
		this.allowPoi = false;
		this.currentPoi = this.currentPoi == this.poi.length-1 ? 0 : this.currentPoi+1;
		var movetopoi = this.poi[this.currentPoi];
		this.moveable.moveTo(movetopoi.pos, movetopoi.ori, this.poiMoveToTime, {queueing: false, callback: this.moveToCallback});
	};
	
	/**
	 * Move to the next Point of Interest
	 * @private
	 */
	cc.beforePoi = function(){
		if(!this.allowPoi || this.moveable.movementInProgress()) return;
		//rotate up/down before any other movement, this prevends from rolling
		this.moveable.rotate( XMOT.axisAngleToQuaternion( [1,0,0], -this.angleUp) );
		this.angleUp = 0;
		this.allowPoi = false;
		this.currentPoi = this.currentPoi == 0 ? this.poi.length-1 : this.currentPoi-1;
		var movetopoi = this.poi[this.currentPoi];
		this.moveable.moveTo(movetopoi.pos, movetopoi.ori, this.poiMoveToTime, {queueing: false, callback: this.moveToCallback});
	};
	
	/**
	 * Rotates the camera up and down by an given angle
	 * @private 
	 * @param {number} angle
	 */
	cc.rotateCameraUpAndDown = function(angle){
		this.angleUp += angle*Math.PI;
		this.moveable.rotate( XMOT.axisAngleToQuaternion( [1,0,0], angle*Math.PI) );
	};
	
	/**
	 * Rotates the camera left and right by an given angle
	 * @private 
	 * @param {number} angle
	 */
	cc.rotateCameraLeftAndRight = function(angle){
		//rotate up/down befor rotating sidewards, this prevends from rolling
		this.moveable.rotate( XMOT.axisAngleToQuaternion( [1,0,0], -this.angleUp) );
		this.moveable.rotate( XMOT.axisAngleToQuaternion( [0,1,0], angle*Math.PI) );
		//and rotate up/down again
		this.moveable.rotate( XMOT.axisAngleToQuaternion( [1,0,0], this.angleUp) );
	};
	
	/**
	 * Resets the camera to the starting Position
	 * @private 
	 */
	cc.reset = function(){
		this.moveable.setPosition(this.startingPoint.position);
		this.moveable.setOrientation(this.startingPoint.orientation);
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
	 * @private
	 */
	cc.initEvents = function(){
		//registered on window, since registring on div did not work, events never triggered
		var that = this;
		window.addEventListener("keydown", function(e){that.keypressEventHandler(e);}, false);
		window.addEventListener("mousemove", function(e){that.mouseMovementHandler(e);}, false);
		window.addEventListener("mousedown", function(e){that.mouseDownHandler(e);}, false);
		window.addEventListener("mouseup", function(e){that.mouseUpHandler(e);}, false);
	};
	
	/**
	 * Handles key events
	 * @private
	 * @param {Event} e event
	 */
	cc.keypressEventHandler = function(e){
		if(!this.allowPoi) return;
		e = window.event || e;
		var kc = e.keyCode;
		var flag = true;
		switch(kc){
			case 83 : this.moveBackAndForward(this.moveSensivityKeyboard); break; // s
			case 87 : this.moveBackAndForward(-this.moveSensivityKeyboard); break; // w
			case 65 : this.moveLeftAndRight(-this.moveSensivityKeyboard); break; // a
			case 68 : this.moveLeftAndRight(this.moveSensivityKeyboard); break; // d
			case 33 : this.moveUpAndDown(this.moveSensivityKeyboard); break; //page up
			case 34 : this.moveUpAndDown(-this.moveSensivityKeyboard); break; //page down
			case 69 : this.nextPoi(); break; // q
			case 81 : this.beforePoi(); break; // e
			case 38 : this.rotateCameraUpAndDown(this.rotationSensivityMouse); break; // up Arrow
			case 40 : this.rotateCameraUpAndDown(-this.rotationSensivityMouse); break; // down Arrow
			case 37 : this.rotateCameraLeftAndRight(this.rotationSensivityMouse); break; // left Arrow
			case 39 : this.rotateCameraLeftAndRight(-this.rotationSensivityMouse); break; // right Arrow
			case 82 : this.reset(); break; //r
			default : flag = false; break;
		}
		if(flag) e.preventDefault();
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
			this.rotateCameraLeftAndRight(-this.rotationSensivityMouse*x);
		if(y != 0)
			this.rotateCameraUpAndDown(-this.rotationSensivityMouse*y);
	};
	
	/**
	 * Handles mousebutton up event
	 * @private
	 * @param {Event} e event
	 */
	cc.mouseUpHandler = function(e){
		if(e.button == 2){
			this.mouseButtonIsDown = false;
		}
	};
	
	/**
	 * Handles mousebutton down events
	 * @private
	 * @param {Event} e event
	 */
	cc.mouseDownHandler = function(e){
		if(e.button == 2){
			this.mouseButtonIsDown = true;
			this.oldMousePosition.x = e.pageX;
			this.oldMousePosition.y = e.pageY;
		}
	};
	XMOT.CameraController = CameraController;
}());