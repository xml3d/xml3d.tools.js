/*
Copyright (c) 2010-2014
              DFKI - German Research Center for Artificial Intelligence
              www.dfki.de

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
 so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
/**
 * This file constructs the XML3D.tools.util namespace and adds miscellaneous utilities.
 */
(function() {

    "use strict";

    XML3D.tools.namespace("XML3D.tools.util");

    var u = XML3D.tools.util;

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

    u.getLocalBBox = function(node)
    {
        if(!node.getBoundingBox)
            return new window.XML3DBox();
        var bbox = node.getBoundingBox();

        if(node.parentNode.getWorldMatrix)
        {
            var parentGlobMat = node.parentNode.getWorldMatrix();
            var invParentGlobMat = parentGlobMat.inverse();
            bbox.transform(invParentGlobMat);
        }

        return bbox;
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

        return node.getBoundingBox();
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
        if(!XML3D.tools.util.isDefined(node.parentNode)
        || !XML3D.tools.util.isDefined(node.parentNode.getWorldMatrix))
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

    /**
     *  Clamps the given value to lie within [min,max].
     *
     *  @param {number} value
     *  @param {number} min
     *  @param {number} max
     *  @return {number}
     */
    u.clamp = function(value, min, max)
    {
        return Math.min(max, Math.max(min, value));
    };

    /**
     * A shader is actually a node with a number of children, each of which defines
     * an attribute 'name' and has a TextNode child. This method searches for the child
     * of the given element, that has the 'name' attribute with the given name, optionally
     * replaces the TextNode content with the given value, and returns the old value.
     *
     * @param {Object} shaderElement
     * @param {string} attributeName
     * @param {string=} attributeValue
     * @return {string} the old value of the shader attribute
     */
    u.shaderAttribute = function(shaderElement, attributeName, attributeValue)
    {
        for(var i = 0; i < shaderElement.childNodes.length; i++)
        {
            var node = shaderElement.childNodes[i];
            if(node.name === attributeName)
            {
                var oldValue = node.childNodes[0].nodeValue;
                if(attributeValue !== undefined)
                    node.childNodes[0].nodeValue = attributeValue;
                return oldValue;
            }
        }

        throw new Error("Given attribute is not defined: " + attributeName);
    };
}());


