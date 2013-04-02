(function(){

    "use strict";

    XMOT.namespace("XMOT.interaction.behaviors");

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
    XMOT.interaction.behaviors.MirroredWidgetTarget = new XMOT.Class({

        /** Sets up the mirrored node ready for attaching.
         *
         *  @this {XMOT.interaction.behaviors.MirroredWidgetTarget}
         *
         *  @param {string} _id
         *  @param {XMOT.XML3DOverlay} _xml3dOverlay
         *  @param {XMOT.Transformable} _target
         */
        initialize: function(_id, _xml3dOverlay, _target)
        {
            this.ID = _id;

            this._xml3dOverlay = _xml3dOverlay;
            this._target = _target;

            this._mirroredTargetRoot = null;
            this._mirroredTarget = null;

            this._setupMirroredTarget();
        },

        /**
         *  @this {XMOT.interaction.behaviors.MirroredWidgetTarget}
         */
        attach: function()
        {
            this._xml3dOverlay.xml3d.appendChild(this._mirroredTargetRoot);
        },

        /**
         *  @this {XMOT.interaction.behaviors.MirroredWidgetTarget}
         */
        detach: function()
        {
            this._xml3dOverlay.xml3d.removeChild(this._mirroredTargetRoot);
        },

        /**
         *  @this {XMOT.interaction.behaviors.MirroredWidgetTarget}
         */
        getNode: function()
        {
            return this._mirroredTarget;
        },

        /**
         *  @this {XMOT.interaction.behaviors.MirroredWidgetTarget}
         */
        globalID: function(id)
        {
            return this.ID + "_" + id;
        },

        /**
         *  @this {XMOT.interaction.behaviors.MirroredWidgetTarget}
         *  @private
         */
        _setupMirroredTarget: function()
        {
            var defsOverlay = XMOT.util.getOrCreateDefs(this._xml3dOverlay.xml3d);

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
         *  @return {window.XML3DMatrix}
         */
        _getTargetLocalMatrix: function()
        {
            var targetNode = this._target.object;

            var targetMatrix = targetNode.getLocalMatrix();
            var targetScale = targetNode.getBoundingBox().size().scale(0.5);

            // we pre-multiply the scaling to the target's local matrix
            // however we don't want an already set scaling to be affected
            // but it's included in the bounding box.
            // So we remove the local matrix' scaling from the new scale
            var targetMatrixScale = targetMatrix.scaling();
            var invTargetMatrixScale = new XML3DVec3(
                1/targetMatrixScale.x, 1/targetMatrixScale.y, 1/targetMatrixScale.z);

            targetScale = targetScale.multiply(invTargetMatrixScale);
            var scaleAvg = (targetScale.x + targetScale.y + targetScale.z) / 3;

            var targetScaleMatrix = new XML3DMatrix();
            targetScaleMatrix.m11 = scaleAvg;
            targetScaleMatrix.m22 = scaleAvg;
            targetScaleMatrix.m33 = scaleAvg;

            return targetScaleMatrix.multiply(targetMatrix);
        },

        /** Create a group that is transformed by the given matrix.
         *
         *  @this {XMOT.interaction.behaviors.MirroredWidgetTarget}
         *  @private
         *
         *  @param {string} transformId
         *  @param {window.XML3DMatrix} xfmMatrix
         *  @param {window.Element=} child
         */
        _createTransformedGroup: function(transformId, xfmMatrix, child)
        {
            var defsOverlay = XMOT.util.getOrCreateDefs(this._xml3dOverlay.xml3d);

            defsOverlay.appendChild(XMOT.creation.element("transform", {
                id: this.globalID(transformId),
                translation: xfmMatrix.translation().str(),
                rotation: xfmMatrix.rotation().str(),
                scale: xfmMatrix.scaling().str()
            }));

            var group = XMOT.creation.element("group", {
                transform: "#" + this.globalID(transformId)
            });

            if(child)
                group.appendChild(child);

            return group;
        }
    });
}());
