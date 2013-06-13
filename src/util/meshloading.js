(function(){

    "use strict";

    XMOT.namespace("XMOT.util");

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
    XMOT.util.fireWhenMeshesLoaded = function(node, callback)
    {
        var cb = callback;
        var xml3d = XMOT.util.getXml3dRoot(node);
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
                emptyMeshNodes = XMOT.util.getMeshNodes(node);
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

    /** Cancels the method XMOT.util.fireWhenMeshesLoaded() above. That is
     *  it removes the listener for the "framedrawn" event.
     *
     *   @param {Element} node
     *   @param {number} id
     */
    XMOT.util.cancelFireWhenMeshesLoaded = function(node, id)
    {
        if(id >= fireMeshesLoadedCallbacks.length) {
            return;
        }

        var onFrameDrawn = fireMeshesLoadedCallbacks[id];
        if(!onFrameDrawn) {
            return;
        }

        var xml3d = XMOT.util.getXml3dRoot(node);

        fireMeshesLoadedCallbacks[id] = undefined;

        xml3d.removeEventListener("framedrawn", onFrameDrawn, false);
    };

}());
