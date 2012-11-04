(function(){

	/* Counter to create unique IDs for the elements added to DOM. 
	 * Is in closure: same for every instance so no ID clashes will 
	 * occur across multiple instances of the factory.
	 */     
	var id = 0; 

	/**
	 * ClientMotionFactory implementation
	 * @constructor
	 * @implements{MotionFactory}
	 */
	function ClientMotionFactory(){
	};

	var m = ClientMotionFactory.prototype;

	/** @inheritDoc */
	m.createMoveable = function(element, constraint){
		if(!element) throw "No valid element, cannot create Moveable.";
		return new XMOT.ClientMoveable(element, this.getTransform(element), constraint);
	};

	/** @inheritDoc */
	m.createAnimatable = function(element, constraint){
		if(!element) throw "No valid element, cannot create Animatable.";
		return new XMOT.ClientAnimatable(element, this.getTransform(element), constraint);
	};

	/** @inheritDoc */
    m.createKeyframeAnimation = function(name, element, opt){
    	if(!element) throw "No valid element, cannot create Animatable.";
		var child = element.firstElementChild;
		var keys = undefined;
		var position = undefined;
		var orientation = undefined;
		var scale = undefined;
		while(child){
			//TODO: does child.name work for native?
			switch(child.name){
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
    m.getValueFromChild = function(child, number){
		if(!XML3D._native)
		{
			var val = child.value;
			if(!val || (number && val.length != number )) return undefined;
			else return val;
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
		return "createdByClientMotionFactory" + id++;
	};
	
	/**
	 * Gets the transform of an element and creates a transform if necessary
	 * @param {Object} obj element
	 * @return {Object} transform
	 */
	m.getTransform = function(obj){

		return XMOT.util.getOrCreateTransform(obj, this.createUniqueId());
	};

	//export
	XMOT.ClientMotionFactory = ClientMotionFactory;
}());