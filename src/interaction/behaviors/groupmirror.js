(function(){

    "use strict";

    XML3D.tools.namespace("XML3D.tools.interaction.behaviors");

    /** A GroupMirror mirrors a given group in an own overlay.
     *  It creates the overlay and sets up a MirroredWidgetTarget.
     */
    XML3D.tools.interaction.behaviors.GroupMirror = new XML3D.tools.Class(
        XML3D.tools.util.Attachable, {

        /**
         *  @this {XML3D.tools.interaction.behaviors.GroupMirror}
         *  @param {string} id
         *  @param {XML3D.tools.Transformable} target
         *  @param {XML3D.tools.xml3doverlay.XML3DOverlay=} xml3dOverlay
         *
         *  The overlay is optional. If it is not given, one will be created
         *  with the xml3d element of the given target node.
         */
        initialize: function(id, target, xml3dOverlay)
        {
            this._realTarget = target;

            // overlay
            var xml3dTarget = XML3D.tools.util.getXml3dRoot(target.object);
            if(xml3dOverlay)
                this._xml3dOverlay = xml3dOverlay;
            else
            {
                this._xml3dOverlay = new XML3D.tools.xml3doverlay.XML3DOverlay(xml3dTarget);
                this._xml3dOverlay.attach();
            }

            // mirror the target node
            this._mirroredTarget = new XML3D.tools.interaction.behaviors.MirroredWidgetTarget(
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
         *  @this {XML3D.tools.interaction.behaviors.GroupMirror}
         *  @return {XML3D.tools.xml3doverlay.XML3DOverlay}
         */
        overlay: function()
        {
            return this._xml3dOverlay;
        },

        /**
         *  @this {XML3D.tools.interaction.behaviors.GroupMirror}
         *  @return {XML3D.tools.Transformable} the target node that is mirrored
         */
        target: function()
        {
            return this._realTarget;
        },

        /** Returns a transformable for the mirrored target node with
         *  the given constraint.
         *
         *  @this {XML3D.tools.interaction.behaviors.GroupMirror}
         *  @param {function(XML3DVec3,Object):boolean=} constraint
         *  @return {XML3D.tools.Transformable}
         */
        mirroredTarget: function(constraint)
        {
            return XML3D.tools.MotionFactory.createTransformable(
                this._mirroredTarget.getNode(), constraint);
        }
    });
}());
