(function(){

    "use strict";

    XML3D.tools.namespace("XML3D.tools.interaction.widgets");

    /** An OverlayWidget will work on a xml3d overlay to modify the given target.
     *  This class will setup a mirror for the target node and with that initialize
     *  the base class.
     *
     *  @extends XML3D.tools.interaction.widgets.Widget
     */
    XML3D.tools.interaction.widgets.OverlayWidget = new XML3D.tools.Class(
        XML3D.tools.interaction.widgets.Widget, {

        /**
         *  @this {XML3D.tools.interaction.widgets.OverlayWidget}
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
                throw new Error("XML3D.tools.interaction.widgets.TranslateGizmo: no options given.");
            options = XML3D.tools.extend({}, options);

            if(options.mirror !== undefined)
            {
                this._selfCreatedMirror = false;
                this._mirror = options.mirror;
            }
            else if(options.target !== undefined)
            {
                this._selfCreatedMirror = true;
                this._mirror = new XML3D.tools.xml3doverlay.GroupMirror(
                    id, options.target, options.xml3dOverlay);
            }
            else
                throw new Error("XML3D.tools.interaction.widgets.TranslateGizmo: the options must be either a target or a mirror.");

            this._mirror.attach();

            options.isEmptyTarget = true;

            this.callSuper(id, this._mirror.mirroredTarget(), options);
        },

        /**
         *  @this {XML3D.tools.interaction.widgets.OverlayWidget}
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
         *  @this {XML3D.tools.interaction.widgets.OverlayWidget}
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
         *  @this {XML3D.tools.interaction.widgets.OverlayWidget}
         *  @return {XML3D.tools.XML3D.tools.interaction.behaviors.GroupMirror} the mirror set up by this class
         */
        mirror: function()
        {
            return this._mirror;
        },

        /** In addition to asking given constraint functions whether the constraint should apply
         *  it also set's the target node's properties, if the constraint admits the new values.
         *
         *  @param {Object} the constraint functions to be applied. They have the same signature
         *      and name as in XML3D.tools.Constraint.
         */
        createReflectingConstraint: function(options)
        {
            var target = XML3D.tools.MotionFactory.createTransformable(
                this._mirror.target().object);

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
