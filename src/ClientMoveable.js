
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
    p.setPosition = function(x,y,z){
		this.position[0] = x;
		this.position[1] = y;
		this.position[2] = z;

		this.transform.translation.x = x;
		this.transform.translation.y = y;
		this.transform.translation.z = z;
    };
    p.setOrientation = function(){};
    p.translate = function(){};
    p.rotate = function(){};

    //export
    XMOT.ClientMoveable = ClientMoveable;
}());
