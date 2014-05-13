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

    XML3D.tools.namespace("XML3D.tools.xml3doverlay");

    /** Will mirror the transformations of the target node in a hierarchy in the
     *  xml3d overlay. Can then be attached/deatched.
     *
     *  The following tree is created:
     *  o target's grandparent
     *      o target's parent
     *          o target
     *
     *  This is needed because:
     *  1) the widget needs access to the target node itself, so it's replicated.
     *  2) the widget will modify the target's parent node, so the exact parent node transformation
     *      has to be replicated.
     *  3) because of the above the grandparent node will hold the world transformation of the
     *      target's grandparent node.
     *
     *  @constructor
     */
    XML3D.tools.xml3doverlay.MirroredWidgetTarget = new XML3D.tools.Class(
        XML3D.tools.util.Attachable, {

        /** Sets up the mirrored node ready for attaching.
         *
         *  @this {XML3D.tools.xml3doverlay.MirroredWidgetTarget}
         *
         *  @param {string} _id
         *  @param {XML3D.tools.XML3DOverlay} _xml3dOverlay
         *  @param {XML3D.tools.Transformable} _target
         */
        initialize: function(_id, _xml3dOverlay, _target)
        {
            this.ID = _id;

            this._xml3dOverlay = _xml3dOverlay;
            this._target = _target;

            this._mirroredTargetRoot = null;
            this._mirroredTarget = null;

            this._overlayDefs = null;
            this._createdDefsChildren = [];

            this._setupMirroredTarget();
        },

        /**
         *  @this {XML3D.tools.xml3doverlay.MirroredWidgetTarget}
         */
        getNode: function()
        {
            return this._mirroredTarget;
        },

        /**
         *  @this {XML3D.tools.xml3doverlay.MirroredWidgetTarget}
         */
        globalID: function(id)
        {
            return this.ID + "_" + id;
        },

        /**
         *  @this {XML3D.tools.xml3doverlay.MirroredWidgetTarget}
         *  @override
         *  @protected
         */
        onAttach: function()
        {
            for(var i = 0; i < this._createdDefsChildren.length; i++)
                this._overlayDefs.appendChild(this._createdDefsChildren[i]);
            this._xml3dOverlay.xml3d.appendChild(this._mirroredTargetRoot);
        },

        /**
         *  @this {XML3D.tools.xml3doverlay.MirroredWidgetTarget}
         *  @override
         *  @protected
         */
        onDetach: function()
        {
            this._xml3dOverlay.xml3d.removeChild(this._mirroredTargetRoot);
            for(var i = 0; i < this._createdDefsChildren.length; i++)
                this._overlayDefs.removeChild(this._createdDefsChildren[i]);
        },

        /**
         *  @this {XML3D.tools.xml3doverlay.MirroredWidgetTarget}
         *  @private
         */
        _setupMirroredTarget: function()
        {
            this._overlayDefs = XML3D.tools.util.getOrCreateDefs(this._xml3dOverlay.xml3d);

            var targetNode = this._target.object;

            // target node
            var mirroredTarget = this._createTransformedGroup(
                "t_mirroredTarget", this._getTargetLocalMatrix());

            // target parent
            var targetParent = targetNode.parentNode;
            var parentMatrix = new window.XML3DMatrix();
            if(targetParent && targetParent.getLocalMatrix)
                parentMatrix = targetParent.getLocalMatrix();

            var mirroredTargetParent = this._createTransformedGroup("t_mirroredTargetParent",
                parentMatrix, mirroredTarget);

            // target's grandparent
            var targetGrandparent = targetParent ? targetParent.parentNode : null;
            var grandparentMatrix = new window.XML3DMatrix();
            if(targetGrandparent && targetGrandparent.getWorldMatrix)
                grandparentMatrix = targetGrandparent.getWorldMatrix();

            var mirroredTargetGrandparent = this._createTransformedGroup(
                "t_mirroredTargetParentsParent", grandparentMatrix, mirroredTargetParent);

            this._mirroredTarget = mirroredTarget;
            this._mirroredTargetRoot = mirroredTargetGrandparent;
        },

        /** Create and return the local matrix of the target node itself.
         *  There is one speciality: we want the scaling to be the bounding box
         *  of the target node. The mirrored target node has no content, so the
         *  bounding box is empty. But we still want the scaling, so we set the
         *  scaling to be related to the target's bounding box size.
         *
         *  @this {XML3D.tools.xml3doverlay.MirroredWidgetTarget}
         *  @private
         *
         *  @return {window.XML3DMatrix}
         */
        _getTargetLocalMatrix: function()
        {
            var targetNode = this._target.object;

            var targetMatrix = targetNode.getLocalMatrix();
            var targetScale = new XML3DVec3(1,1,1);
            if(!targetNode.getBoundingBox().isEmpty())
                targetScale = targetNode.getBoundingBox().size().scale(0.5);

            // we pre-multiply the scaling to the target's local matrix
            // however we don't want an already set scaling to be affected
            // but it's included in the bounding box.
            // So we remove the local matrix' scaling from the new scale
            var targetMatrixScale = targetMatrix.scaling();
            var invTargetMatrixScale = new window.XML3DVec3(
                1/targetMatrixScale.x, 1/targetMatrixScale.y, 1/targetMatrixScale.z);

            targetScale = targetScale.multiply(invTargetMatrixScale);
            var scaleAvg = (targetScale.x + targetScale.y + targetScale.z) / 3;

            var targetScaleMatrix = new window.XML3DMatrix();
            targetScaleMatrix.m11 = scaleAvg;
            targetScaleMatrix.m22 = scaleAvg;
            targetScaleMatrix.m33 = scaleAvg;

            return targetMatrix.multiply(targetScaleMatrix);
        },

        /** Create a group that is transformed by the given matrix.
         *
         *  @this {XML3D.tools.xml3doverlay.MirroredWidgetTarget}
         *  @private
         *
         *  @param {string} transformId
         *  @param {window.XML3DMatrix} xfmMatrix
         *  @param {window.Element=} child
         */
        _createTransformedGroup: function(transformId, xfmMatrix, child)
        {
            var transform = XML3D.tools.creation.element("transform", {
                id: this.globalID(transformId),
                translation: xfmMatrix.translation().str(),
                rotation: xfmMatrix.rotation().str(),
                scale: xfmMatrix.scaling().str()
            });
            this._overlayDefs.appendChild(transform);

            this._createdDefsChildren.push(transform);

            var group = XML3D.tools.creation.element("group", {
                transform: "#" + this.globalID(transformId)
            });
            if(child)
                group.appendChild(child);

            return group;
        }
    });
}());
