(function(){
	/**
	 * CollisionConstraint
	 * @param {number} sceneWidth width of the scene to which the map applies
	 * @param {number} sceneDepth depth of the scene to which the map applies
	 * @param {Array.<number>} normal normal of the plane to the which the map applies
	 * @param {String} collisionMap URL of the CollisionMap
	 * @implements {Constraint}
	 */
	var CollisionConstraint = function(sceneWidth, sceneDepth, normal, collisionMap){
		this.sceneWidth = sceneWidth;
		this.sceneDepth = sceneDepth;
		this.normal = normal;

		//draw the map to a canvas to be able to get pixel data
		//TODO: clean up object member?
		this.img = new Image();
		this.img.src = collisionMap;
		this.canvas = document.createElement("canvas");
		this.canvas.setAttribute("width", this.img.width);
		this.canvas.setAttribute("height", this.img.height);
		this.context = this.canvas.getContext("2d");
		this.context.drawImage(this.img, 0, 0);

	};
	var c = CollisionConstraint.prototype;

	/** @inheritDoc */
    c.constrainRotation = function(rotation, moveable){
		//TODO: imeplement something useful
		return true;
    };

    /** @inheritDoc */
    c.constrainTranslation = function(translation, moveable){
		//TODO: check rotationssymmetrische dingsda, also z achse der szene = -y des bildes?
		//TODO: check normal
		var checkAtX = (moveable.transform.translation.x + translation[0] ) / this.sceneWidth * this.img.width;
		var checkAtY = (moveable.transform.translation.z + translation[2] ) / this.sceneDepth * this.img.height;
		var data = this.context.getImageData(checkAtX,checkAtY,1,1).data;
		return (data[0] || data[1] || data[2]);
    };

    //export
    XMOT.CollisionConstraint = CollisionConstraint;
}());
