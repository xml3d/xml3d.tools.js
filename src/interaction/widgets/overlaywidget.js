
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
     *  @param {string} _id
     *  @param {{target:XMOT.Transformable|mirror:XMOT.interaction.behaviors.GroupMirror}} options
     */
    initialize: function(_id, _options)
    {
        if(!_options)
            throw new Error("XMOT.interaction.widgets.TranslateGizmo: no options given.");

        if(_options.target)
        {
            if(_options.target.object.parentNode.tagName !== "group")
                throw new Error("XMOT.interaction.widgets.TranslateGizmo: target's parent node must be a group.");
            this._mirror = new XMOT.interaction.behaviors.GroupMirror(_id, _options.target);
        }
        else if(_options.mirror)
            this._mirror = _options.mirror;
        else
            throw new Error("XMOT.interaction.widgets.TranslateGizmo: the options must be either a target or a mirror.");

        this.callSuper(_id, this._mirror.mirroredTarget());
    },

    /**
     *  @this {XMOT.interaction.widgets.OverlayWidget}
     *  @return {XMOT.XMOT.interaction.behaviors.GroupMirror} the mirror set up by this class
     */
    mirror: function()
    {
        return this._mirror;
    }
});
