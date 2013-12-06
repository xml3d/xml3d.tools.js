(function() {

    "use strict";

    XML3D.tools.namespace("XML3D.tools.util");

    var u = XML3D.tools.util;

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

        return XML3D.tools.MotionFactory.createTransformable(object);
    };
}());
