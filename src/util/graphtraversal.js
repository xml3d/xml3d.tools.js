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
