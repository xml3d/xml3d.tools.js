(function() {

    /**
     * Tracks the active view of the given xml3d tag for changes and applies
     * the changed pose to the given transform node.
     *
     * @param {!Object} _targetTransform the transform element to which the view
     *      changes are propagated.
     */
    var ViewTracker = function(_targetTransform)
    {
        this.targetTransform = _targetTransform;
        if(!this.targetTransform)
            throw "ViewTracker: no target transformation specified.";

        this.xml3d = XMOT.util.getXml3dRoot(_targetTransform);
        if(!this.xml3d)
            throw "ViewTracker: given node is not a child of an xml3d element.";

        this.targetNode = null; // the current view element that is tracked

        /** the TransformTracker used to track changes in the active view element
         *  @private
         */
        this._xfmObs = null;
        /** @private */
        this._attached = false;

        this.attach();
    };

    var p = ViewTracker.prototype;

    /** Event handler to be overriden by the user
     *
     * @param targetNode the node this observer tracks
     * @param evt the original DOM event that caused the change
     */
    p.xfmChanged = function(targetNode, evt) { };

    p.attach = function()
    {
        if(!this._attached)
        {
            this.xml3d.addEventListener("DOMAttrModified",
                XMOT.util.wrapCallback(this, _onXml3DAttrModified), false);

            this.targetNode = XML3D.util.getOrCreateActiveView(this.xml3d);

            if(this._xfmObs)
                this._xfmObs.detach();
            this._xfmObs = new XMOT.TransformTracker(this.targetNode);
            this._xfmObs.xfmChanged = XMOT.util.wrapCallback(this, _onXfmChanged);

            _onXfmChanged.apply(this, this.targetNode);

            this._attached = true;
        }
    };

    p.detach = function()
    {
        if(this._attached)
        {
            this._xfmObs.detach();
            this.xml3d.removeEventListener("DOMAttrModified",
                XMOT.util.wrapCallback(this, _onXml3DAttrModified), false);

            this._attached = false;
        }
    };

    function _onXml3DAttrModified(evt)
    {
        if(evt.attrName !== "activeView")
            return;

        this.detach();
        this.attach();
    };

    function _onXfmChanged(targetNode, evt)
    {
        var mat = this.targetNode.getWorldMatrix();

        var transl = new window.XML3DVec3(mat.m41, mat.m42, mat.m43);
        var rot = window.XML3DRotation.fromMatrix(mat);

        this.targetTransform.setAttribute("translation", transl.str());
        this.targetTransform.setAttribute("rotation", rot.str());

        this.xfmChanged(this.targetNode, evt);
    };

    // export
    XMOT.ViewTracker = ViewTracker;
}());
