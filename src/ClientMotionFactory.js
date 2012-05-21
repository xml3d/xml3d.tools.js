(function(){
	/**
	 * ClientMotionFactory implementation
	 * @constructor
	 * @implements{MotionFactory}
	 */
	function ClientMotionFactory(){
		//TODO: sync with server - sirikata
	};

	var m = ClientMotionFactory.prototype;

	/** @inheritDoc */
	m.createMoveable = function(obj, constraint){
		var t = XML3D.URIResolver.resolve(obj.transform, obj.ownerDocument);
		if (!t) {
			throw "Object does not have a transfrom property.";
			return null;
		}
		return new XMOT.ClientMoveable(obj, t, constraint);
	};

	/** @inheritDoc */
	m.createAnimatable = function(obj, constraint){
		var t = XML3D.URIResolver.resolve(obj.transform, obj.ownerDocument);
		if (!t) {
			throw "Object does not have a transfrom property.";
			return null;
		}
		return new XMOT.ClientAnimatable(obj, t, constraint);
	};

	/** @inheritDoc */
    m.createKeyframeAnimation = function(name, type, element, opt){
		//TODO: this works with WebGL only?
		//TODO: error handling?
		var child = element.firstElementChild;
		var keys = child.value;
		child = child.nextElementSibling;
		var values = child.value;
		if(!keys || !values){
			throw "Object is not a valid keyframe animation";
			return null;
		}
		return new XMOT.ClientKeyframeAnimation(name, type, keys, values, opt);
    };

	//export
	XMOT.ClientMotionFactory = ClientMotionFactory;
}());