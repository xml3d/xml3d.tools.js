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
(function(){

    "use strict";

    XML3D.tools.namespace("XML3D.tools.util");

    var fireMeshesLoadedCallbacks = [];

    /** Calls the given callback as soon as all mesh nodes of the given node are
     *  loaded. Internally, it will wait until the bounding boxes of all child mesh nodes
     *  are not empty anymore. If the node has no mesh children, it will first wait until
     *  there are such children.
     *
     *   @param {Element} node
     *   @param {function()} callback
     *   @return {number} a unique ID to cancel the waiting process using cancelFireWhenMeshesLoaded()
     */
    XML3D.tools.util.fireWhenMeshesLoaded = function(node, callback)
    {
        var cb = callback;
        var xml3d = XML3D.tools.util.getXml3dRoot(node);
        var emptyMeshNodes = null;

        function onFrameDrawn()
        {
            // the node might be completely empty, so we wait until there's
            // some content. When there is content, we grab the mesh nodes
            // and wait until all of them are not empty.
            if(node.getBoundingBox().isEmpty()) {
                return;
            }

            if(emptyMeshNodes === null) {
                emptyMeshNodes = XML3D.tools.util.getMeshNodes(node);
            }

            var curMesh = 0;
            while(curMesh < emptyMeshNodes.length)
            {
                if(!emptyMeshNodes[curMesh].getBoundingBox().isEmpty())
                {
                    emptyMeshNodes.splice(curMesh, 1);
                }
                else
                    curMesh++;
            }

            if(emptyMeshNodes.length > 0) {
                return;
            }

            xml3d.removeEventListener("framedrawn", onFrameDrawn, false);
            cb();
        }

        fireMeshesLoadedCallbacks.push(onFrameDrawn);

        xml3d.addEventListener("framedrawn", onFrameDrawn, false);
        onFrameDrawn();

        return fireMeshesLoadedCallbacks.length - 1;
    };

    /** Cancels the method XML3D.tools.util.fireWhenMeshesLoaded() above. That is
     *  it removes the listener for the "framedrawn" event.
     *
     *   @param {Element} node
     *   @param {number} id
     */
    XML3D.tools.util.cancelFireWhenMeshesLoaded = function(node, id)
    {
        if(id >= fireMeshesLoadedCallbacks.length) {
            return;
        }

        var onFrameDrawn = fireMeshesLoadedCallbacks[id];
        if(!onFrameDrawn) {
            return;
        }

        var xml3d = XML3D.tools.util.getXml3dRoot(node);

        fireMeshesLoadedCallbacks[id] = undefined;

        xml3d.removeEventListener("framedrawn", onFrameDrawn, false);
    };

}());
