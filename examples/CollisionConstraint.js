(function(){
	/**
	 * CollisionConstraint - works only with the simple example.
	 * @constructor
	 * @param {number} sceneWidth width of the scene to which the map applies
	 * @param {number} sceneDepth depth of the scene to which the map applies
	 * @param {String} collisionMap URL of the CollisionMap
	 * @implements {Constraint}
	 */
	var CollisionConstraint = function(sceneWidth, sceneDepth, collisionMap){
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
    c.constrainRotation = function(newRotation, opts){
		return true;
    };

    /** @inheritDoc */
    c.constrainTranslation = function(newPosition, opts){
		var checkAtX = newPosition.x / this.sceneWidth * this.img.width;
		var checkAtY = newPosition.z / this.sceneDepth * this.img.height;
		if(!checkAtX) checkAtX = 0;
		if(!checkAtY) checkAtY = 0;
		var data = this.context.getImageData(checkAtX,checkAtY,1,1).data;
		return (data[0] || data[1] || data[2]);
    };

    //export
    XMOT.CollisionConstraint = CollisionConstraint;
}());
