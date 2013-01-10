
XMOT.namespace("XMOT.interaction.widgets");

/**
 * A TransformBox uses the TranslaterBox, Scaler and SingleAxisRotator to set up a
 * composed widget, that can be translated, rotated and scaled.
 *
 * @extends XMOT.interaction.widgets.Widget
 */
XMOT.interaction.widgets.TransformBox = new XMOT.Class(
    XMOT.interaction.widgets.Widget, {

    /** Setup axis-flip options and initialize the base class.
     *
     * @param {string} _id
     * @param {XMOT.Transformable} _target
     * @param {{rotationFlips:{x: boolean, y: boolean, z: boolean},translationConstraints:Object}=} options
     *
     * There are a couple of options that can be set (all optional).
     * o rotationFlips can be used to specify whether to flip the rotation around the given local axis.
     * o translationConstraints specifies constraints for the TranslateBox instance. They will be forwarded
     *   to TranslateBox as-is. Thus, take a look at the XMOT.interaction.widgets.TranslateBox() for
     *   more information.
     */
    initialize: function(_id, _target, options)
    {
        this.callSuper(_id, _target);

        this._flipRotAxes = {x: false, y: false, z: false};

        options = options || {};
        if(options.rotationFlips)
        {
            this._flipRotAxes.x = options.rotationFlips.x || false;
            this._flipRotAxes.y = options.rotationFlips.y || false;
            this._flipRotAxes.z = options.rotationFlips.z || false;
        }
        if(options.translationConstraints)
        {
            this._translConstraints = options.translationConstraints;
        }
    },

    /**
     *  @this {XMOT.interaction.widgets.TransformBox}
     *  @override
     *  @protected
     */
    onCreateBehavior: function()
    {
        // translation
        this.behavior["translbox"] = new XMOT.interaction.widgets.TranslateBox(
            this.ID + "_translbox", this.target, this._translConstraints);
        this.behavior["translbox"].attach();

        // scaling
        this.behavior["scaler"] = new XMOT.interaction.widgets.UniformScaler(
            this.ID + "_scaler", this.target);
        this.behavior["scaler"].attach();

        // rotation
        // options objects for the SingleAxisRotator
        var axes = [
            {axis: "x", color: "0.7 0 0", highlightColor: "0.9 0 0"},
            {axis: "y", color: "0 0.7 0", highlightColor: "0 0.9 0"},
            {axis: "z", color: "0 0 0.7", highlightColor: "0 0 0.9"}
        ];

        for(var i = 0; i < axes.length; i++)
        {
            var ax = axes[i].axis;
            var id = ax + "rot";

            this.behavior[id] = new XMOT.interaction.widgets.SingleAxisRotator(
                this.ID + "_" + id, this.target, axes[i]
            );
            this.behavior[id].attach();

            this.behavior[id].flipRotation(this._flipRotAxes[ax]);
        }
    }
});
