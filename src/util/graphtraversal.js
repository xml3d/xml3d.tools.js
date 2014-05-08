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
(function() {

    "use strict";

    XML3D.tools.namespace("XML3D.tools.util");

    var u = XML3D.tools.util;

    /** Iterates over the subgraph of the given node, calling the given
     *	function on each discovered node, including the node itself.
     *
     *	@param {Object} node
     *	@param {function(node:Object):boolean} fn returns false if traversal of children should be skipped
     */
    u.traverseGraph = function(node, fn)
    {
        if(false !== fn(node))
        {
            for(var i = 0; i < node.childNodes.length; i++)
            {
                XML3D.tools.util.traverseGraph(node.childNodes[i], fn);
            }
        }
    };

    /** Traverses from the given node along the path to the root node and calls
     * 	the given function for each node.
     *
     *	@param {Object} node
     *	@param {function(node:Object):boolean} fn returns false if traversal should stop
     */
    u.traverseToRoot = function(node, fn)
    {
        if(!node)
            return;

        if(false === fn(node))
            return;

        XML3D.tools.util.traverseToRoot(node.parentNode, fn);
    };
}());
