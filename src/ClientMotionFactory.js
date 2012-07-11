(function(){
	/**
	 * ClientMotionFactory implementation
	 * @constructor
	 * @implements{MotionFactory}
	 */
	function ClientMotionFactory(){
	};

	var m = ClientMotionFactory.prototype;

	/** @inheritDoc */
	m.createMoveable = function(obj, constraint){
		var t = XML3D.URIResolver.resolve(obj.transform, obj.ownerDocument);
		if (!t) {
			//TODO:
			//var defs = document.createElementNS(XML3D.xml3dNS, "defs");
			//t = document.createElementNS(XML3D.xml3dNS, "transform");
			//t.id=makeUniqueId();
			//defs.appendChild(t);
			//obj.appendChild(defs);
			//obj.transform="#"+t.id;
			throw "Object does not have a transfrom property.";
		}
		return new XMOT.ClientMoveable(obj, t, constraint);
	};

	/** @inheritDoc */
	m.createAnimatable = function(obj, constraint){
		var t = XML3D.URIResolver.resolve(obj.transform, obj.ownerDocument);
		if (!t) {
			throw "Object does not have a transfrom property.";
		}
		return new XMOT.ClientAnimatable(obj, t, constraint);
	};

	/** @inheritDoc */
    m.createKeyframeAnimation = function(name, element, opt){
		var child = element.firstElementChild;
		var keys = undefined;
		var position = undefined;
		var orientation = undefined;
		var scale = undefined;
		while(child){
			switch(child.name){
				case "key" : 		 keys = child.value; break;
				case "position" : 	 position = child.value.length == keys.length*3 ? child.value : undefined; break; 
				case "orientation" : orientation = child.value.length == keys.length*4 ? child.value : undefined; break;
				case "scale" : 		 scale = child.value.length == keys.length*3 ? child.value : undefined; break;
				default: break;
			}
			child = child.nextElementSibling;
		}
		if(!keys || (!position && !orientation && !scale)){
			throw "Element is not a valid keyframe animation";
		}
		else{
			return new XMOT.ClientKeyframeAnimation(name, keys, position, orientation, scale, opt);
		}
    };

	//export
	XMOT.ClientMotionFactory = ClientMotionFactory;
}());