(function(){

    "use strict";

    XMOT.namespace("XMOT.interaction.widgets");

    /** An OverlayWidget will work on a xml3d overlay to modify the given target.
     *  This class will setup a mirror for the target node and with that initialize
     *  the base class.
     *
     *  @extends XMOT.interaction.widgets.Widget
     */
    XMOT.interaction.widgets.OverlayWidget = new XMOT.Class(
        XMOT.interaction.widgets.Widget, {

        /**
         *  @this {XMOT.interaction.widgets.OverlayWidget}
         *  @param {string} id
         *  @param {Object} options
         *
         *  The options are the following:
         *  o target: if given a GroupMirror is constructed with that target
         *  o xml3dOverlay: if target is given, an overlay can be specified that is given to
         *      the GroupMirror constructor
         *  o mirror: if given, the given mirror is used as basis for this widget.
         *
         *  Either target (and optionally xml3dOverlay) or mirror must be given.
         */
        initialize: function(id, options)
        {
            if(!options)
                throw new Error("XMOT.interaction.widgets.TranslateGizmo: no options given.");

            this._selfCreatedMirror = (options.target !== undefined);
            if(this._selfCreatedMirror)
            {
                if(options.target.object.parentNode.tagName !== "group")
                    throw new Error("XMOT.interaction.widgets.TranslateGizmo: target's parent node must be a group.");
                this._mirror = new XMOT.interaction.behaviors.GroupMirror(
                    id, options.target, options.xml3dOverlay);
            }
            else if(options.mirror)
            {
                this._mirror = options.mirror;
            }
            else
                throw new Error("XMOT.interaction.widgets.TranslateGizmo: the options must be either a target or a mirror.");

            this._mirror.attach();

            this.callSuper(id, this._mirror.mirroredTarget(), options);
        },

        /**
         *  @this {XMOT.interaction.widgets.OverlayWidget}
         *  @override
         *  @protected
         */
        onBeforeAttach: function()
        {
            this.callSuper();
            if(this._selfCreatedMirror)
                this._mirror.attach();
        },

        /**
         *  @this {XMOT.interaction.widgets.OverlayWidget}
         *  @override
         *  @protected
         */
        onAfterDetach: function()
        {
            this.callSuper();
            if(this._selfCreatedMirror)
                this._mirror.detach();
        },

        /**
         *  @this {XMOT.interaction.widgets.OverlayWidget}
         *  @return {XMOT.XMOT.interaction.behaviors.GroupMirror} the mirror set up by this class
         */
        mirror: function()
        {
            return this._mirror;
        },

        /** In addition to asking given constraint functions whether the constraint should apply
         *  it also set's the target node's properties, if the constraint admits the new values.
         *
         *  @param {Object} the constraint functions to be applied. They have the same signature
         *      and name as in XMOT.Constraint.
         */
        createReflectingConstraint: function(options)
        {
            // setup the target node: it is the real target node's parent node
            var realTargetParent = this._mirror.target().object.parentNode;
            if(!realTargetParent)
                throw new Error("XMOT.interaction.widgets.OverlayWidget: target doesn't have a parent node.");

            var target = XMOT.ClientMotionFactory.createTransformable(
                this._mirror.target().object.parentNode);

            var options = options || {};

            return {
                constrainRotation: function(newRotation, opts){

                    if(options.constrainRotation && !options.constrainRotation(newRotation, opts))
                        return false;

                    target.setOrientation(newRotation);
                    return true;
                },

                constrainScaling: function(newScale, opts){

                    if(options.constrainScaling && !options.constrainScaling(newScale, opts))
                        return false;

                    target.setScale(newScale);
                    return true;
                },

                constrainTranslation: function(newTranslation, opts) {

                    if(options.constrainTranslation && !options.constrainTranslation(newTranslation, opts))
                        return false;

                    target.setPosition(newTranslation);
                    return true;
                }
            };
        }
    });
}());
