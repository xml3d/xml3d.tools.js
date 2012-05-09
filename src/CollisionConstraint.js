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

    /**
     * Checks if a rotation operation is valid
     * @param {Array.<number>} rotation Quaternion
     * @return {boolean} returns true if the operation is valid, false otherwise
     */
    c.constrainRotation = function(rotation){
		//TODO: imeplement something useful
		return false;
    };

    /**
     * Checks if a translation operation is valid
     * @param {Array.<number>} translation 3d Vector
     * @return {boolean} returns true if the operation is valid, false otherwise
     */
    c.constrainTranslation = function(translation){
		//TODO: check rotationssymmetrische dingsda, also z achse der szene = -y des bildes?
		//TODO: check normal
		var checkAtX = translation[0] / this.sceneWidth * this.img.width;
		var checkAtY = translation[2] / this.sceneDepth * this.img.height;
		var data = this.context.getImageData(checkAtX,checkAtY,1,1).data;
		return !!(data[0] || data[1] || data[2]); //convert to boolean?
    };

    //export
    XMOT.CollisionConstraint = CollisionConstraint;
}());
