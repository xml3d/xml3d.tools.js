XMOT.namespace("XMOT.interaction.behaviors");

(function(){

    "use strict";

    /** A mirrored view will create a view-subtree of the view of the target xml3d element.
     *  It will track changes to that view and reflect it in the created subtree.
     *
     *  The tree created is:
     *  o view group node (target view's parent node world matrix)
     *      o view node (target view's position and rotation elements)
     */
    XMOT.interaction.behaviors.MirroredView = new XMOT.Class({

        nextViewId: 0,

        initialize: function(_xml3dTarget, _xml3dOverlay)
        {
            this.ID = "mirroredView" + this.nextViewId++;

            this._xml3dTarget = _xml3dTarget;
            this._xml3dOverlay = _xml3dOverlay;

            this._mirroredView = null;
            this._mirroredViewGrpXfmable = null;
            this._setupViewGroup();

            this._viewTracker = new XMOT.ViewTracker(
                this._xml3dTarget, this.callback("_targetViewXfmChanged"));
        },

        attach: function()
        {
            this._viewTracker.attach();
        },

        detach: function()
        {
            this._viewTracker.detach();
        },

        _setupViewGroup: function()
        {
            this._mirroredView = XMOT.creation.element("view", {
                id: "v_" + this.ID
            });

            var viewGrp = XMOT.creation.element("group", {
                children: [this._mirroredView]
            });

            this._xml3dOverlay.appendChild(viewGrp);
            this._xml3dOverlay.activeView = "#v_" + this.ID;

            this._mirroredViewGrpXfmable = XMOT.ClientMotionFactory.createTransformable(viewGrp);
        },

        _targetViewXfmChanged: function(viewTracker)
        {
            var targetViewEl = viewTracker.getCurrentView();
            this._mirroredView.position.set(targetViewEl.position);
            this._mirroredView.orientation.set(targetViewEl.orientation);
            this._mirroredView.fieldOfView = targetViewEl.fieldOfView;

            var targetViewParent = targetViewEl.parentNode;
            if(!targetViewParent || !targetViewParent.getWorldMatrix)
                return;

            var parentWorldMat = targetViewParent.getWorldMatrix();
            this._mirroredViewGrpXfmable.setPosition(parentWorldMat.translation());
            this._mirroredViewGrpXfmable.setOrientation(parentWorldMat.rotation());
        }
    });

}());
