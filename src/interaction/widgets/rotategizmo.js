
XMOT.namespace("XMOT.interaction.widgets");

/**
 *  This gizmo adds 3 small rectangles to the target object with which the
 *  rotation of the target can be controlled, constrained to single axes the
 *  rectangle present.
 *
 * @extends XMOT.interaction.widgets.OverlayWidget
 */
XMOT.interaction.widgets.RotateGizmo = new XMOT.Class(
    XMOT.interaction.widgets.OverlayWidget, {

    GeometryType: XMOT.interaction.geometry.RotateGizmo,

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

        var target = this.mirror().target();

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
