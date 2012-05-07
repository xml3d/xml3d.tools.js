
(function(){
	/**
	 * ClientMotionFactory implementation
	 * @implements{MotionFactory}
	 */
	function ClientMotionFactory(){
		this.sync = undefined;
	};

	var m = ClientMotionFactory.prototype;
	m.createMoveable = function(obj){
		//TODO: sync with server?
		var t = XML3D.URIResolver.resolve(obj.transform, obj.ownerDocument);
		if (!t) {
			throw "Object does not have a transfrom property.";
			return null;
		}
		return new XMOT.ClientMoveable(obj, t);
	};

	//export
	XMOT.ClientMotionFactory = ClientMotionFactory;
}());