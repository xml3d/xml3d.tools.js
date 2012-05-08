
(function() {

    /**
     * A Moveable implementation.
     * @implements{Moveable}
     */
    function ClientMoveable(object, transform) {
		//vec3
		this.position = new Array(3);
		this.position[0] = transform.translation.x;
		this.position[1] = transform.translation.y;
		this.position[2] = transform.translation.z;
		//quaternion
		this.orientation = new Array(4);
		this.orientation[0] = transform.rotation;
		this.orientation[1] = transform.rotation;
		this.orientation[2] = transform.rotation;
		this.orientation[3] = transform.rotation;

		//oject
		this.object = object;

		//transform
		this.transform = transform;
    };

    var p = ClientMoveable.prototype;

    /**
     * Set the absolute position.
     */
    p.setPosition = function(x,y,z){
		//internal data
    	this.position[0] = x;
		this.position[1] = y;
		this.position[2] = z;

		//object data
		this.transform.translation.set(x,y,z);
    };

	/**
	 * Set the absolute orientation.
	 */
	p.setOrientation = function(x,y,z,s){
		//TODO: set internal data
		//this.orientation[0] = transform.rotation;
		//this.orientation[1] = transform.rotation;
		//this.orientation[2] = transform.rotation;
		//this.orientation[3] = transform.rotation;
		this.transform.rotation.setQuaternion(new XML3DVec3(x,y,z), s);
    };

    /**
     * Translate the object by the given values.
     */
    p.translate = function(x,y,z){
		this.position[0] += x;
		this.position[1] += y;
		this.position[2] += z;

		this.transform.translation.set(this.transform.translation.add(new XML3DVec3(x,y,z)));
    };

    /**
     * Rotate the object by the given values.
     */
    p.rotate = function(){};

    //export
    XMOT.ClientMoveable = ClientMoveable;
}());
