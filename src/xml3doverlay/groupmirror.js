(function(){

    "use strict";

    XMOT.namespace("XMOT.xml3doverlay");

    /** A GroupMirror mirrors a given group in an own overlay.
     *  It creates the overlay and sets up a MirroredWidgetTarget.
     */
    XMOT.xml3doverlay.GroupMirror = new XMOT.Class(
        XMOT.util.Attachable, {

        /**
         *  @this {XMOT.xml3doverlay.GroupMirror}
         *  @param {string} id
         *  @param {XMOT.Transformable} target
         *  @param {XMOT.XML3DOverlay=} xml3dOverlay
         *
         *  The overlay is optional. If it is not given, one will be created
         *  with the xml3d element of the given target node.
         */
        initialize: function(id, target, xml3dOverlay)
        {
            this._realTarget = target;

            // overlay
            var xml3dTarget = XMOT.util.getXml3dRoot(target.object);
            if(xml3dOverlay)
                this._xml3dOverlay = xml3dOverlay;
            else
            {
                this._xml3dOverlay = new XMOT.xml3doverlay.XML3DOverlay(xml3dTarget);
                this._xml3dOverlay.attach();
            }

            // mirror the target node
            this._mirroredTarget = new XMOT.xml3doverlay.MirroredWidgetTarget(
                id, this._xml3dOverlay, target);
        },

        onAttach: function()
        {
            this._xml3dOverlay.attach();
            this._mirroredTarget.attach();
        },

        onDetach: function()
        {
            this._mirroredTarget.detach();
            this._xml3dOverlay.detach();
        },

        /**
         *  @this {XMOT.xml3doverlay.GroupMirror}
         *  @return {XMOT.XML3DOverlay}
         */
        overlay: function()
        {
            return this._xml3dOverlay;
        },

        /**
         *  @this {XMOT.xml3doverlay.GroupMirror}
         *  @return {XMOT.Transformable} the target node that is mirrored
         */
        target: function()
        {
            return this._realTarget;
        },

        /** Returns a transformable for the mirrored target node with
         *  the given constraint.
         *
         *  @this {XMOT.xml3doverlay.GroupMirror}
         *  @param {function(XML3DVec3,Object):boolean=} constraint
         *  @return {XMOT.Transformable}
         */
        mirroredTarget: function(constraint)
        {
            return XMOT.ClientMotionFactory.createTransformable(
                this._mirroredTarget.getNode(), constraint);
        }
    });
}());
