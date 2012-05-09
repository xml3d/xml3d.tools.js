
(function() {

    /**
     * A Moveable implementation.
     * @implements{Moveable}
     */
    function ClientMoveable(object, transform, collisionimage) {
		//oject
		this.object = object;

		//transform
		this.transform = transform;

		// binary 2d map for collision check
		var img = new Image();
		img.src = "collision.png";//collisionimage;
		var element = document.getElementById("canvas");
		this.context = element.getContext("2d");
		this.context.drawImage(img, 0, 0);
		this.imgWidth = element.width;
		this.imgHeight = element.height;
    };

    var p = ClientMoveable.prototype;

    /**
     * Set the absolute position.
     */
    p.setPosition = function(x,y,z){
		if(this.checkCollision(x, y, z)){
			return;
		}
		//object data
		this.transform.translation.set(x,y,z);
    };

	/**
	 * Set the absolute orientation.
	 */
	p.setOrientation = function(x,y,z,s){
		this.transform.rotation.setQuaternion(new XML3DVec3(x,y,z), s);
    };

    /**
     * Translate the object by the given values.
     */
    p.translate = function(x,y,z){
		if(this.checkCollision(x, y, z)){
			return;
		}
		this.transform.translation.set(this.transform.translation.add(new XML3DVec3(x,y,z)));
    };

    /**
     * Rotate the object by the given values.
     */
    p.rotate = function(){};

    /**
     * Simple Method to check if a given position is allowed as a new position for the object.
     * Returns true if a collision is detected.
     */
    p.checkCollision = function(x,y,z){
		//z coord of the scene is y coord of the map
		if(x<0 || y< 0 || y<0) return true; // its forbidden to move away from the plane
		var checkAtX = x/5*this.imgWidth;
		var checkAtY = z/5*this.imgHeight;
		//TODO: check rotationssymmetrische dingsda, also z achse der szene = -y des bildes?
		var data = this.context.getImageData(checkAtX,checkAtY,1,1).data;
		alert("atX: " + checkAtX + "atY: " + checkAtY + " R " + data[0] + " G " + data[1] + " B " + data[2]);
		return !(data[0] || data[1] || data[2]);
    };

    //export
    XMOT.ClientMoveable = ClientMoveable;
}());
