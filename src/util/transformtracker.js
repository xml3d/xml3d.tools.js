(function() {

    "use strict";

    /**
     * For the given node calls the handler method xfmChanged() when
     * the global transformation changed. This is the case if the transform
     * attribute of the target node or of one of the parent nodes changed.
     * Since transform attributes point to transform elements the transformation of
     * the target node also changes if corresponding transform elements are modified.
     *
     * This observer tracks only these changes, though. It does not track whether some local fields
     * of the target node change since it does not know which there might be.
     *
     * The observer registers itself as listener in all parent nodes that have a transform attribute
     * to find out when changes to that attribute happen.
     *
     * @constructor
     * @param {!Object} _targetNode the node to track
     * @param {function(targetNode:!Object,evt:!Event)=} onXfmChanged method that should be called when transformation changed
     */
    XMOT.TransformTracker = new XMOT.Class({

        initialize: function(_targetNode, onXfmChanged)
        {
            if(!_targetNode)
                throw "TransformTracker: no target node specified.";

            this.xml3d = XMOT.util.getXml3dRoot(_targetNode);
            this.targetNode = _targetNode;

            if(onXfmChanged)
                this.xfmChanged = onXfmChanged;

            /** @private */
            this._attached = false;
        },

        /** Event handler to be overriden by the user
         * @this {XMOT.TransformTracker}
         * @param {!Object} targetNode the node this observer tracks
         * @param {!Event} evt the original DOM event that caused the change
         */
        xfmChanged: function(targetNode, evt) { },

        /**
         * Register callbacks in the given node and all parent nodes.
         *
         * @this {XMOT.TransformTracker}
         * @param {!Object} [node] (internal) the node to register. If not given the
         *  target node is taken.
         */
        attach: function(node)
        {
            if(!this._attached)
            {
                if(!node)
                    node = this.targetNode;

                if(node.tagName.toLowerCase() === "xml3d")
                    return;

                if(node.tagName.toLowerCase() === "group")
                {
                    node.addEventListener("DOMAttrModified",
                        XMOT.util.wrapCallback(this, this._onGrpAttrModified), false);

                    this._attachToTransformOfGrp(node);
                }
                else if(node.tagName.toLowerCase() === "view")
                {
                    node.addEventListener("DOMAttrModified",
                        XMOT.util.wrapCallback(this, this._onViewAttrModified), false);
                }

                if(node.parentNode)
                    this.attach(node.parentNode);

                this._attached = true;
            }

            this.xfmChanged(this.targetNode);
        },

        /**
         * Deregister callbacks in the given node and all parent nodes.
         *
         * @this {XMOT.TransformTracker}
         * @param {Object} node (internal) the node to register. If not given the
         *  target node is taken.
         */
        detach: function(node)
        {
            if(this._attached)
            {
                if(!node)
                    node = this.targetNode;

                if(node.tagName.toLowerCase() === "xml3d")
                    return;

                if(node.tagName.toLowerCase() === "group")
                {
                    node.removeEventListener("DOMAttrModified",
                        XMOT.util.wrapCallback(this, this._onGrpAttrModified), false);

                    this._detachFromTransformOfGrp(node);
                }
                else if(node.tagName.toLowerCase() === "view")
                {
                    node.removeEventListener("DOMAttrModified",
                        XMOT.util.wrapCallback(this, this._onViewAttrModified), false);
                }

                if(node.parentNode)
                    this.detach(node.parentNode);

                this._attached = false;
            }
        },

        /**
         *  @this {XMOT.TransformTracker}
         *  @private
         */
        _onGrpAttrModified: function(evt)
        {
            if(evt.attrName !== "transform")
                return;

            switch(evt.attrChange)
            {
            case 2: // addition
                this._attachToTransformOfGrp(evt.target);
                break;

            case 3: // removal
                this._detachFromTransformOfGrp(evt.target);
                break;
            }

            this.xfmChanged(this.targetNode, evt);
        },

        /**
         *  @this {XMOT.TransformTracker}
         *  @private
         */
        _onViewAttrModified: function(evt)
        {
            if(evt.attrName !== "position"
            && evt.attrName !== "orientation")
                return;

            this.xfmChanged(this.targetNode, evt);
        },

        /**
         *  @this {XMOT.TransformTracker}
         *  @private
         */
        _onXfmAttrModified: function(evt)
        {
            this.xfmChanged(this.targetNode, evt);
        },

        /**
         *  @this {XMOT.TransformTracker}
         *  @private
         */
        _attachToTransformOfGrp: function(grp)
        {
            var xfm = XMOT.util.transform(grp);
            if(!xfm)
                return;

            xfm.addEventListener("DOMAttrModified",
                XMOT.util.wrapCallback(this, this._onXfmAttrModified), false);
        },

        /**
         *  @this {XMOT.TransformTracker}
         *  @private
         */
        _detachFromTransformOfGrp: function(grp)
        {
            var xfm = XMOT.util.transform(grp);
            if(!xfm)
                return;

            xfm.removeEventListener("DOMAttrModified",
                XMOT.util.wrapCallback(this, this._onXfmAttrModified), false);
        }
    });
}());

