XMOT.namespace("XMOT.interaction.behaviors");

(function(){

    "use strict";

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
                "t_mirroredTarget", targetNode.getLocalMatrix());

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
                rotation: xfmMatrix.rotation().str()
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
