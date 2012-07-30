(function(){
	/**
	 * ClientMotionFactory implementation
	 * @constructor
	 * @implements{MotionFactory}
	 */
	function ClientMotionFactory(){
		/**
		 * Counter to create unique IDs for the elements added to DOM
		 * @private
		 * @type {number}
		 */
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
			//TODO: does child.name work for native?
			switch(this.getNameFromChild(child)){
				case "key" : 		 keys = this.getValueFromChild(child, undefined); break;
				case "position" : 	 position = this.getValueFromChild(child, keys.length*3); break; 
				case "orientation" : orientation = this.getValueFromChild(child, keys.length*4); break;
				case "scale" : 		 scale = this.getValueFromChild(child, keys.length*3); break;
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
	 * get Values from child
	 * @param {*} child
	 * @param {number}
	 * @return {Array.<number>}
	 */
	this.getValueFromChild = function(child, number){
		if(!XML3D._native)
		{
			var val = child.value;
			if(!val || val.length != number) return undefined;
			else return val;
		}
		else
		{
			throw "Animations are currently not supported in native Version.";
			//TODO: code for native version
		}
	};

	/**
	 * get name property of child element
	 * @param {Object} child
	 * @return {string}
	 */
	this.getNameFromChild = function(child){
		if(!XML3D._native)
		{
			return child.name;
		}
		else
		{
			throw "Animations are currently not supported in native Version.";
			//TODO: code for native version
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