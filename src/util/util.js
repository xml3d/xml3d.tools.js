/**
 * This file constructs the XMOT.util namespace and adds miscellaneous utilities.
 */
(function() {

    if(!XMOT.util)
        XMOT.util = {};

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

    /** Returns the xml3d element in which the given element is contained.
     * If none is found, null is returned.
     *
     * @param {!Object} el
     * @return {Object}
     */
    u.getXml3dRoot = function(el)
    {
        if(!el)
            return null;

        if(el.tagName == "xml3d")
            return el;

        if(el.parentNode)
            return u.getXml3dRoot(el.parentNode);

        return null;
    };

    /** Internal helper method. Gets and/or sets a reference pointed to by attrName
     *  of the element el. For more information see XMOT.util.transform()
     *  or XMOT.util.shader().
     *
     *  @param {!Object} el
     *  @param {!string} attrName
     *  @param {Object} newRefNode
     *
     *  @return {Object}
     */
    function getOrSetRefNode(el, attrName, newRefNode)
    {
        var oldRefNode = null;

        var oldRef = el.getAttribute(attrName);
        if(oldRef && oldRef.length > 0)
            oldRefNode = XML3D.URIResolver.resolveLocal(oldRef);

        if(newRefNode)
        {
            var newRef = newRefNode.getAttribute("id");
            if(newRef && newRef.length > 0)
            {
                newRef = "#" + newRef;
                el.setAttribute(attrName, newRef);
            }
        }

        return oldRefNode;
    };

    /**
     * Retrieve or set the transform node of a given group node.
     *
     * @param {!Object} grp the desired group node
     * @param {Object} xfm (optional) the transform element to which grp's
     *  transform attribute should be set. The transform has to have an
     *  id attribute.
     *
     * @return {Object} if one argument is given, it returns the current transform
     *  element of el. If two arguments are given, it returns the transform element set
     *  before it was overridden by xfm.
     */
    u.transform = function(grp, xfm)
    {
        if(grp.tagName !== "group")
            throw "XMOT.util.transform(): given element is not a group.";

        return getOrSetRefNode(grp, "transform", xfm);
    };

    /** Retrieve or set the shader of the given group node.
     *
     * @param {!Object} grp the group of which to retrieve the shader.
     * @param {Object} sh (optional) the shader element to which el's shader
     *  attribute should be set. The shader has to have an id attribute.
     *
     * @return {Object} if one argument is given, it returns the current shader of el. If
     *  two arguments are given, it returns the shader set before it was overridden by sh.
     */
    u.shader = function(grp, sh)
    {
        if(grp.tagName !== "group")
            throw "XMOT.util.shader(): given element is not a group.";

        return getOrSetRefNode(grp, "shader", sh);
    };

    /**
     * Returns the first defs element of the given xml3d element. If none exists,
     * a corresponding element is created, appended to xml3d and returned.
     *
     * @param {!Object} xml3d the xml3d element of which to return the defs element
     *
     * @return {Object} the first defs element of the given xml3d element
     */
    u.getOrCreateDefs = function(xml3d)
    {
        var defs = XML3D.util.evaluateXPathExpr(
                xml3d, './/xml3d:defs[1]').singleNodeValue;

        if(!defs)
        {
            defs = XMOT.creation.element("defs");
            xml3d.appendChild(defs);
        }

        return defs;
    };

    /**
     * Returns the transform element corresponding to the given
     * group. If it doesn't exist, one will be created with the
     * id newId, appended to the defs section and targetGrp's
     * transform reference will be set to the newly created
     * element.
     *
     * @param {!Object} targetGrp the group to retrieve the transform from
     * @param {string} newId the id attribute of the transform to be created
     *
     * @return {Object} the transform corresponding to targetGrp
     */
    u.getOrCreateTransform = function(targetGrp, newId)
    {
        var t = XMOT.util.transform(targetGrp);

        if(t) // found it, just return
            return t;

        var xml3d = u.getXml3dRoot(targetGrp);
        if(!xml3d)
            throw "XMOT.util.getOrCreateTransform(): target group does have no xml3d root element!";
        var defs = u.getOrCreateDefs(xml3d);

        // create transform
        t = XMOT.creation.element("transform", {id: newId});
        defs.appendChild(t);
        targetGrp.setAttribute("transform", "#" + newId);

        return t;
    };


    /** Return the first child element of tarNode, whose "name" attribute
     * is equal to the given one. Useful for retrieving shader attributes.
     *
     * @param {!Object} tarNode
     * @param {string} name
     * @return {Object} the found node
     */
    u.getNamedChild = function(tarNode, name)
    {
        var nodes = document.getElementsByName(name);

        for(var i = 0; i < nodes.length; i++)
        {
            if(nodes[i].parentNode === tarNode)
                return nodes[i];
        }

        return null;
    };

    /** Get the children of the given node that reside in the XML3D namespace
     *
     *  @param {!Object} node
     *  @return {Array.<Object>}
     */
    u.getXML3DChildren = function(node)
    {
        var children = [];

        var n = node.firstChild;
        while(n)
        {
            if(n.namespaceURI === XML3D.xml3dNS)
                children.push(n);

            n = n.nextSibling;
        }

        return children;
    };

    /** Code taken from http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
     *
     *  @param {string} string
     *  @return {string} a hash code of the given string.
     */
    u.hashCode = function(string)
    {
        var hash = 0;
        if (string.length == 0) return hash;

        for (i = 0; i < string.length; i++)
        {
            var char = string.charCodeAt(i);
            hash = ((hash<<5)-hash)+char;
            hash = hash & hash; // Convert to 32bit integer
        }

        return hash;
    };

    /** Calls the given callback as soon as the given node's bounding box is not
     *  empty anymore. For that it waits for "framedrawn" events and checks if the
     *  bounding box is not empty after every frame.
     *
     *   @param {Object} node
     *   @param {function()} callback
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

        node.__frameDrawnCBs = node.__frameDrawnCBs || {};
        var callbackID = XMOT.util.hashCode(callback.toString());
        node.__frameDrawnCBs[callbackID] = onFrameDrawn;

        xml3d.addEventListener("framedrawn", onFrameDrawn, false);
    };

    /** Cancels the method XMOT.util.fireWhenBBoxNotEmpty() above. That is
     *  it removes the listener for the "framedrawn" event.
     *
     *   @param {Object} node
     *   @param {function()} callback
     */
    u.cancelFireWhenBBoxNotEmpty = function(node, callback)
    {
        if(!node.__frameDrawnCBs)
            return;

        var xml3d = XMOT.util.getXml3dRoot(node);
        var callbackID = XMOT.util.hashCode(callback.toString());
        var onFrameDrawn = node.__frameDrawnCBs[callbackID];
        delete node.__frameDrawnCBs[callbackID];

        xml3d.removeEventListener("framedrawn", onFrameDrawn, false);
    };
}());
