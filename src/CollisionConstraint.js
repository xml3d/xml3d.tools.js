(function(){
	/**
	 * CollisionConstraint
	 * @constructor
	 * @param {number} sceneWidth width of the scene to which the map applies
	 * @param {number} sceneDepth depth of the scene to which the map applies
	 * @param {Array.<number>} normal normal of the plane to the which the map applies
	 * @param {String} collisionMap URL of the CollisionMap
	 * @implements {Constraint}
	 */
	var CollisionConstraint = function(sceneWidth, sceneDepth, normal, collisionMap){
		/**
		 * Width of the scene
		 * @private
		 * @type {number}
		 */
		this.sceneWidth = sceneWidth;
		/**
		 * Depth (or height) of the scene
		 * @private
		 * @type {number}
		 */
		this.sceneDepth = sceneDepth;
		/**
		 * Normal of the plan related to the collisionMap
		 * @private
		 * @type {Array.<number>}
		 */
		this.normal = normal;

		//draw the map to a canvas to be able to get pixel data
		/**
		 * Collisionmap
		 * @private
		 * @type {Image}
		 */
		this.img = new Image();
		this.img.src = collisionMap;
		/**
		 * Canvas, the image painted on this canvas in order to be able to address single pixels
		 * @private
		 * @type {Canvas}
		 */
		this.canvas = document.createElement("canvas");
		this.canvas.setAttribute("width", this.img.width);
		this.canvas.setAttribute("height", this.img.height);
		/**
		 * Context of the canvas
		 * @private
		 * @type {Context}
		 */
		this.context = this.canvas.getContext("2d");
		this.context.drawImage(this.img, 0, 0);

	};
	var c = CollisionConstraint.prototype;

	/** @inheritDoc */
    c.constrainRotation = function(rotation, moveable){
		//TODO: implement something useful
    	//COMMENT(rryk): How about coding rotation constraints in the RGB color? Just a crazy idea...
		return true;
    };

    /** @inheritDoc */
    c.constrainTranslation = function(translation, moveable){
		//TODO: check rotationssymmetrische dingsda, also z achse der szene = -y des bildes?
		//TODO: check normal
    	var currentPos = moveable.getPosition();
		var checkAtX = (currentPos[0] + translation[0] ) / this.sceneWidth * this.img.width;
		var checkAtY = (currentPos[2] + translation[2] ) / this.sceneDepth * this.img.height;
		if(!checkAtX) checkAtX = 0;
		if(!checkAtY) checkAtY = 0;
		var data = this.context.getImageData(checkAtX,checkAtY,1,1).data;
		return (data[0] || data[1] || data[2]);
    };

    //export
    XMOT.CollisionConstraint = CollisionConstraint;
}());
