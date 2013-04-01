
XMOT.namespace("XMOT.interaction.widgets");

/**
 *  This gizmo adds 3 small rectangles to the target object with which the
 *  rotation of the target can be controlled, constrained to single axes the
 *  rectangle present.
 *
 * @extends XMOT.interaction.widgets.Widget
 */
XMOT.interaction.widgets.RotateGizmo = new XMOT.Class(
    XMOT.interaction.widgets.Widget, {

    GeometryType: XMOT.interaction.geometry.RotateGizmo,

    /** Unlike the other widgets we have to use an xml3d overlay.
     *  Thus, in the constructor at first the overlay will be created and there the target
     *  will be mirrored in the overlay. On that mirrored node the widget's constructor will
     *  be invoked.
     *
     *  @this {XMOT.interaction.widgets.RotateGizmo}
     *  @param {string} _id
     *  @param {XMOT.Transformable} _target
     */
    initialize: function(_id, _target)
    {
        if(_target.object.parentNode.tagName !== "group")
            throw new Error("XMOT.interaction.widgets.RotateGizmo: target's parent node must be a group.");

        this._realTarget = _target;

        // overlay
        var xml3dTarget = XMOT.util.getXml3dRoot(_target.object);
        this._xml3dOverlay = new XMOT.XML3DOverlay(xml3dTarget);

        // mirror the target node
        var mirroredTargetId = _id + "_mirroredTarget";
        this._mirroredTarget = new XMOT.interaction.behaviors.MirroredWidgetTarget(
            mirroredTargetId, this._xml3dOverlay, _target);
        this._mirroredTarget.attach();

        // setup widget using mirrored node
        var mirroredTargetXfmable =
            XMOT.ClientMotionFactory.createTransformable(this._mirroredTarget.getNode());
        this.callSuper(_id, mirroredTargetXfmable);
    },

    /**
     *  @this {XMOT.interaction.widgets.RotateGizmo}
     *  @override
     *  @protected
     */
    onCreateBehavior: function()
    {
        this.behavior["xaxis"] = this._createRotater("x");
        this.behavior["yaxis"] = this._createRotater("y");
        this.behavior["zaxis"] = this._createRotater("z");
    },

    /**
     *  @this {XMOT.interaction.widgets.RotateGizmo}
     *  @private
     *
     *  @param {string} axis. "x", "y" or "z"
     */
    _createRotater: function(axis)
    {
        var geoId = axis + "axis";

        var eventDispatcher = new XMOT.util.EventDispatcher("mousedown", function(evt) {
            return (evt.button === XMOT.MOUSEBUTTON_LEFT);
        });

        var constraint = this._createRotationConstraint();

        var graphRootXfmable = XMOT.ClientMotionFactory.createTransformable(
            this.geometry.getRoot(), constraint
        );

        var pickGrps = [this.geometry.getGeo(geoId)];

        var rot = new XMOT.interaction.behaviors.Rotater(
            this.globalID(geoId), pickGrps, graphRootXfmable, undefined, eventDispatcher);
        rot.axisRestriction(axis);

        return rot;
    },


    /** Creates a rotation constraint, where the real target's rotation
     *  is updated with the given
     *
     *  @this {XMOT.interaction.widgets.RotateGizmo}
     *  @private
     *
     *  @return {XMOT.Constraint}
     */
    _createRotationConstraint: function() {

        var target = this._realTarget;

        return {
            constrainRotation: function(newRotation, opts){
                if(!opts.transformable)
                    throw new Error("Constraint: no transformable given.");

                target.setOrientation(newRotation);

                return true;
            },
            constrainScaling: function(newScale, opts){
                return true;
            },

            constrainTranslation: function(newTranslation, opts) {
                return true;
            }
        };
    }
});
