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
    	//TODO: provide better code :)
		var child = element.firstElementChild;
		var keys = child.value;
		child = child.nextElementSibling;
		var values = child.value;
		if(!keys || !values){
			throw "Object is not a valid keyframe animation";
			return null;
		}
		if(type == "Position")
			return new XMOT.ClientKeyframeAnimation(name, keys, values, undefined, opt);
		else if(type == "Orientation")
			return new XMOT.ClientKeyframeAnimation(name, keys, undefined, values, opt);
		else if(type == "Both"){
			child = child.nextElementSibling;
			var secondValues = child.value;
			if(!secondValues){
				throw "Specified both animations types but did not provide two series of values";
				return null;
			}
			if(values.length*3 == keys.length) //first values are position
				return new XMOT.ClientKeyframeAnimation(name, keys, values, secondValues, opt);
			else //secondValues are position
				return new XMOT.ClientKeyframeAnimation(name, keys, secondValues, values, opt);
		}else{
			throw "Type must be either: 'Position', 'Orientation' or 'Both'!";
			return null;
		}
    };

	//export
	XMOT.ClientMotionFactory = ClientMotionFactory;
}());