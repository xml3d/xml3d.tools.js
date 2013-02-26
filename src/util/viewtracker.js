(function() {

    /**
     * Tracks the active view of the given xml3d tag for changes and invokes the given
     * callback when a change happened.
     *
     * @param {!Object} targetXml3dElement the xml3d section whose active view is to be tracked
     * @param {function(tracker:!Object,evt:!Event)=} onXfmChanged the callback to be invoked
     */
    ViewTracker = function(targetXml3dElement, onXfmChanged)
    {
        if(onXfmChanged)
            this.xfmChanged = onXfmChanged;

        /** @private */
        this._currentViewElement = null;

        /** @private */
        this._xml3d = targetXml3dElement;
        if(!this._xml3d)
            throw "ViewTracker: given xml3d node not given";

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
            this._xml3d.addEventListener("DOMAttrModified",
                XMOT.util.wrapCallback(this, _onXml3DAttrModified), false);

            this._currentViewElement = XML3D.util.getOrCreateActiveView(this._xml3d);

            if(this._xfmObs)
                this._xfmObs.detach();
            this._xfmObs = new XMOT.TransformTracker(this._currentViewElement);
            this._xfmObs.xfmChanged = XMOT.util.wrapCallback(this, _onXfmChanged);

            _onXfmChanged.apply(this, this._currentViewElement);

            this._attached = true;
        }
    };

    p.detach = function()
    {
        if(this._attached)
        {
            this._xfmObs.detach();
            this._xml3d.removeEventListener("DOMAttrModified",
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
        if(this.xfmChanged)
            this.xfmChanged(this, evt);
    };

    // export
    XMOT.ViewTracker = ViewTracker;
}());
