(function(){

    "use strict";

    XML3D.tools.namespace("XML3D.tools.util");

    var u = XML3D.tools.util;

    /** Returns the xml3d element in which the given element is contained.
     * If none is found, null is returned.
     *
     * @param {!Object} el
     * @return {Object}
     */
    u.getXml3dRoot = function(el)
    {
        if(!el) {
            throw new Error("XML3D.tools.util.getXml3dRoot(): given element is not defined.");
        }
        if(!el.parentNode) {
            throw new Error("XML3D.tools.util.getXml3dRoot(): given element has no parent node.");
        }

        if(el.tagName.toLowerCase() === "xml3d")
            return el;

        if(el.parentNode)
            return u.getXml3dRoot(el.parentNode);

        return null;
    };

    /** Internal helper method. Gets and/or sets a reference pointed to by attrName
     *  of the element el. For more information see XML3D.tools.util.transform()
     *  or XML3D.tools.util.shader().
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
        if(grp.tagName.toLowerCase() !== "group")
            throw "XML3D.tools.util.transform(): given element is not a group.";

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
        if(grp.tagName.toLowerCase() !== "group")
            throw "XML3D.tools.util.shader(): given element is not a group.";

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
            defs = XML3D.tools.creation.element("defs");
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
        var t = XML3D.tools.util.transform(targetGrp);

        if(t) // found it, just return
            return t;

        var xml3d = u.getXml3dRoot(targetGrp);
        var defs = u.getOrCreateDefs(xml3d);

        // create transform
        t = XML3D.tools.creation.element("transform", {id: newId});
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

    /** Traverses the Subgraph of the given node and returns all mesh nodes
     * 	within it.
     *
     * 	@param {Object} node
     *	@return {Array.<Object>} array of mesh nodes contained in the subgraph of node.
     */
    u.getMeshNodes = function(node)
    {
        var meshNodes = [];
        var traverseFn = function(currentNode) {

            if(currentNode.tagName !== undefined
            && currentNode.tagName.toLowerCase() === "mesh")
                meshNodes.push(currentNode);

            return true;
        };

        XML3D.tools.util.traverseGraph(node, traverseFn);
        return meshNodes;
    };
}());
