(function(){
	/**
	 * ClientMotionFactory implementation
	 * @constructor
	 * @implements{MotionFactory}
	 */
	function ClientMotionFactory(){
		this.id = 0;
	};

	var m = ClientMotionFactory.prototype;

	/** @inheritDoc */
	m.createMoveable = function(obj, constraint){
		return new XMOT.ClientMoveable(obj, this.getTransform(obj), constraint);
	};

	/** @inheritDoc */
	m.createAnimatable = function(obj, constraint){
		return new XMOT.ClientAnimatable(obj, this.getTransform(obj), constraint);
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

    /**
     * creates a unique id
     * @return {string} unique id
     */
    m.createUniqueId = function(){
    	return "createdByClientMotionFactory" + this.id++;
    };

    /**
     * Gets the transform of an element and creates a transform if necessary
     * @param {Object} obj element
     * @return {Object} transform
     */
    m.getTransform = function(obj){
    	var t = XML3D.URIResolver.resolve(obj.transform, obj.ownerDocument);
    	if (!t || obj.transform == "") {
    		var defs = document.createElementNS(XML3D.xml3dNS, "defs");
    		t = document.createElementNS(XML3D.xml3dNS, "transform");
    		t.id = this.createUniqueId();
    		defs.appendChild(t);
    		obj.appendChild(defs);
    		obj.transform = "#"+t.id;
    	}
    	return t;
    };

	//export
	XMOT.ClientMotionFactory = ClientMotionFactory;
}());