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
    XML3D.tools.TransformTracker = new XML3D.tools.Class({

        initialize: function(_targetNode, onXfmChanged)
        {
            if(!_targetNode)
                throw "TransformTracker: no target node specified.";

            this.xml3d = XML3D.tools.util.getXml3dRoot(_targetNode);
            this.targetNode = _targetNode;

            if(onXfmChanged)
                this.xfmChanged = onXfmChanged;

            /** @private */
            this._attached = false;
        },

        /** Event handler to be overriden by the user
         * @this {XML3D.tools.TransformTracker}
         * @param {!Object} targetNode the node this observer tracks
         * @param {!Event} evt the original DOM event that caused the change
         */
        xfmChanged: function(targetNode, evt) { },

        /**
         * Register callbacks in the given node and all parent nodes.
         *
         * @this {XML3D.tools.TransformTracker}
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
                        XML3D.tools.util.wrapCallback(this, this._onGrpAttrModified), false);

                    this._attachToTransformOfGrp(node);
                }
                else if(node.tagName.toLowerCase() === "view")
                {
                    node.addEventListener("DOMAttrModified",
                        XML3D.tools.util.wrapCallback(this, this._onViewAttrModified), false);
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
         * @this {XML3D.tools.TransformTracker}
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
                        XML3D.tools.util.wrapCallback(this, this._onGrpAttrModified), false);

                    this._detachFromTransformOfGrp(node);
                }
                else if(node.tagName.toLowerCase() === "view")
                {
                    node.removeEventListener("DOMAttrModified",
                        XML3D.tools.util.wrapCallback(this, this._onViewAttrModified), false);
                }

                if(node.parentNode)
                    this.detach(node.parentNode);

                this._attached = false;
            }
        },

        /**
         *  @this {XML3D.tools.TransformTracker}
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
         *  @this {XML3D.tools.TransformTracker}
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
         *  @this {XML3D.tools.TransformTracker}
         *  @private
         */
        _onXfmAttrModified: function(evt)
        {
            this.xfmChanged(this.targetNode, evt);
        },

        /**
         *  @this {XML3D.tools.TransformTracker}
         *  @private
         */
        _attachToTransformOfGrp: function(grp)
        {
            var xfm = XML3D.tools.util.transform(grp);
            if(!xfm)
                return;

            xfm.addEventListener("DOMAttrModified",
                XML3D.tools.util.wrapCallback(this, this._onXfmAttrModified), false);
        },

        /**
         *  @this {XML3D.tools.TransformTracker}
         *  @private
         */
        _detachFromTransformOfGrp: function(grp)
        {
            var xfm = XML3D.tools.util.transform(grp);
            if(!xfm)
                return;

            xfm.removeEventListener("DOMAttrModified",
                XML3D.tools.util.wrapCallback(this, this._onXfmAttrModified), false);
        }
    });
}());

