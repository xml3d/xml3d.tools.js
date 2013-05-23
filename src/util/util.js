/**
 * This file constructs the XMOT.util namespace and adds miscellaneous utilities.
 */
(function() {

    "use strict";

    XMOT.namespace("XMOT.util");

    var u = XMOT.util;

    /**
     * Returns whether the object is actually given as argument. If it is it has
     * to be not undefined and not null.
     *
     * @param {Object=} obj
     * @return {boolean} true if the object is actually defined
     */
    u.isDefined = function(obj)
    {
        return (obj !== undefined && obj !== null);
    };

    /**
     * Can be used to wrap the given method into a closure that preserves the
     * this pointer inside the given function. Internally an object
     * __callbacks will be attached to the given object. This way several calls
     * to this function with the same function will return the same wrapper.
     * This is needed to successfully unregister callbacks again.
     *
     * @param {!Object} obj the object on which to call the method f
     * @param {!function()} fn the method to be wrapped
     *
     * @return {function()} the wrapped function
     */
    u.wrapCallback = function(obj, fn)
    {

        if(!obj.__callbacks)
            obj.__callbacks = {};

        if(!obj.__callbacks[fn])
        {
            var method = fn;
            var self = obj;

            obj.__callbacks[fn] = function() {
                return method.apply(self, arguments);
            };
        }

        return obj.__callbacks[fn];
    };

    /**
     * Retrieve the world bounding box of a given node
     *
     * @param {!Object} node
     * @return {XML3DBox}
     */
    u.getWorldBBox = function(node)
    {
        if(!node.getBoundingBox)
            return new window.XML3DBox();

        var bbox = node.getBoundingBox();

        if(node.parentNode.getWorldMatrix)
        {
            var parentGlobMat = node.parentNode.getWorldMatrix();
            bbox.transform(parentGlobMat);
        }

        return bbox;
    };

    /**
     * Returns the given node's parent world matrix. If no parent is present
     * or doesn't have a getWorldMatrix() method the identity matrix is returned.
     *
     * @param {Object} node
     * @return {window.XML3DMatrix}
     */
    u.getParentWorldMatrix = function(node)
    {
        if(!XMOT.util.isDefined(node.parentNode)
        || !XMOT.util.isDefined(node.parentNode.getWorldMatrix))
            return new window.XML3DMatrix();

        return node.parentNode.getWorldMatrix();
    };

    /**
     * Retrieve the bounding box of the children of a given node.
     *
     * @param {!Object} node
     * @return {XML3DBox}
     */
    u.getChildrenBBox = function(node)
    {
        var bbox = new window.XML3DBox();

        var curChild = node.firstChild;
        while(curChild)
        {
            if(curChild.getBoundingBox)
                bbox.extend(curChild.getBoundingBox());

            curChild = curChild.nextSibling;
        }

        return bbox;
    };


    var fireBBoxCallbacks = [];

    /** Calls the given callback as soon as the given node's bounding box is not
     *  empty anymore. For that it waits for "framedrawn" events and checks if the
     *  bounding box is not empty after every frame.
     *
     *   @param {Element} node
     *   @param {function()} callback
     *   @return {number} a unique ID to cancel the waiting process using cancelFireWhenBBoxNotEmpty()
     */
    u.fireWhenBBoxNotEmpty = function(node, callback)
    {
        var n = node;
        var cb = callback;
        var xml3d = XMOT.util.getXml3dRoot(node);

        function onFrameDrawn()
        {
            if(n.getBoundingBox().isEmpty())
                return;

            xml3d.removeEventListener("framedrawn", onFrameDrawn, false);
            cb();
        }

        fireBBoxCallbacks.push(onFrameDrawn);

        xml3d.addEventListener("framedrawn", onFrameDrawn, false);
        onFrameDrawn();

        return fireBBoxCallbacks.length - 1;
    };

    /** Cancels the method XMOT.util.fireWhenBBoxNotEmpty() above. That is
     *  it removes the listener for the "framedrawn" event.
     *
     *   @param {Element} node
     *   @param {number} id
     */
    u.cancelFireWhenBBoxNotEmpty = function(node, id)
    {
        if(id >= fireBBoxCallbacks.length) {
            return;
        }

        var onFrameDrawn = fireBBoxCallbacks[id];
        if(!onFrameDrawn) {
            return;
        }

        var xml3d = XMOT.util.getXml3dRoot(node);

        fireBBoxCallbacks[id] = undefined;

        xml3d.removeEventListener("framedrawn", onFrameDrawn, false);
    };

	function isFunction(object)
	{
		return object !== undefined && typeof object === "function";
	};

	/** Returns whether the given object is a Transformable
	 *
	 * 	@param {Object} object
	 * 	@returns {boolean} true if the given object represents a Transformable
	 */
	u.isTransformable = function(object)
	{
		if(!object)
			return false;

		return isFunction(object.setPosition) && isFunction(object.setOrientation) &&
			isFunction(object.setScale) && isFunction(object.getPosition) &&
			isFunction(object.getOrientation) && isFunction(object.getScale);
	};

	/** Returns the given object itself, if it is a Transformable, else
	 *  constructs a default Transformable.
	 *
	 * 	@param {Element|Transformable} object
	 * 	@returns {Transformable}
	 */
	u.getOrCreateTransformable = function(object)
	{
		if(u.isTransformable(object))
			return object;

		return XMOT.ClientMotionFactory.createTransformable(object);
	};
}());
