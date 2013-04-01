
XMOT.namespace("XMOT.interaction.widgets");

/**
 *  A TranslateGizmo attaches three arrow-handles to the target and
 *  through that enables constraint translation either along a single
 *  axis or a plane.
 *
 *  @extends XMOT.interaction.widgets.Widget
 */
XMOT.interaction.widgets.TranslateGizmo = new XMOT.Class(
    XMOT.interaction.widgets.Widget, {

    GeometryType: XMOT.interaction.geometry.TranslateGizmo,

    /** Unlike the other widgets we have to use an xml3d overlay.
     *  Thus, in the constructor at first the overlay will be created and there the target
     *  will be mirrored in the overlay. On that mirrored node the widget's constructor will
     *  be invoked.
     *
     *  @this {XMOT.interaction.widgets.TranslateGizmo}
     *  @param {string} _id
     *  @param {Object} options
     */
    initialize: function(_id, _target)
    {
        if(_target.object.parentNode.tagName !== "group")
            throw new Error("XMOT.interaction.widgets.TranslateGizmo: target's parent node must be a group.");

        this._mirror = new XMOT.interaction.behaviors.GroupMirror(_id, _target);
        this.callSuper(_id, this._mirror.mirroredTarget());
    },

    /**
     *  @this {XMOT.interaction.widgets.TranslateGizmo}
     *  @override
     *  @protected
     */
    onCreateBehavior: function()
    {
        this._setup1DTranslaters();
        this._setup2DTranslaters();
    },

    /**
     *  @this {XMOT.interaction.widgets.TranslateGizmo}
     *  @private
     */
    _setup1DTranslaters: function()
    {
        var xAxisConstraintFn = function(currentTranslation, newTranslation) {

            newTranslation.y = currentTranslation.y;
            newTranslation.z = currentTranslation.z;
        };

        var yAxisConstraintFn = function(currentTranslation, newTranslation) {

            newTranslation.x = currentTranslation.x;
            newTranslation.z = currentTranslation.z;
        };

        var zAxisConstraintFn = function(currentTranslation, newTranslation) {

            newTranslation.x = currentTranslation.x;
            newTranslation.y = currentTranslation.y;
        };

        this.behavior["xaxis"] = this._create1DTranslater(
            "xaxis", xAxisConstraintFn, new XML3DVec3(0,0,1));
        this.behavior["yaxis"] = this._create1DTranslater(
            "yaxis", yAxisConstraintFn, new XML3DVec3(0,0,1));
        this.behavior["zaxis"] = this._create1DTranslater(
            "zaxis", zAxisConstraintFn, new XML3DVec3(1,0,0));
    },

    /**
     *  @this {XMOT.interaction.widgets.TranslateGizmo}
     *  @private
     */
    _setup2DTranslaters: function()
    {
        this.behavior["xyaxis"] = this._create2DTranslater(
            "xyaxis", "zaxis", new XML3DVec3(0,0,1));
        this.behavior["zyaxis"] = this._create2DTranslater(
            "zyaxis", "xaxis", new XML3DVec3(1,0,0));
        this.behavior["xzaxis"] = this._create2DTranslater(
            "xzaxis", "yaxis", new XML3DVec3(0,1,0));
    },

    /** Sets up a XMOT.interaction.behaviors.Translater for 1D translation.
     *  An event dispatcher will be configured for mousedown event to allow
     *  only left button in combination if no ctrl key being pressed.
     *
     *  @this {XMOT.interaction.widgets.TranslateGizmo}
     *  @private
     *
     *  @param {string} id should be the axisname, e.g. xaxis and correspond to the geometry name
     *  @param {function(window.XML3DVec3,window.XML3DVec3)} constraintFn
     *  @param {XML3DVec3|!window.Element=} planeOrient the plane orientation of the translater
     *  @return {XMOT.interaction.behaviors.Translater}
     */
    _create1DTranslater: function(id, constraintFn, planeOrient)
    {
        var eventDispatcher = new XMOT.util.EventDispatcher("mousedown", function(evt){
            return (!evt.ctrlKey && evt.button === XMOT.MOUSEBUTTON_LEFT);
        });

        var constraint = this._createTranslationConstraint(constraintFn);

        var graphRootXfmable = XMOT.ClientMotionFactory.createTransformable(
            this.geometry.getRoot(), constraint
        );

        var pickGrps = [this.geometry.getGeo(id)];

        return new XMOT.interaction.behaviors.Translater(
            this.globalID(id), pickGrps, graphRootXfmable,
            planeOrient, eventDispatcher);
    },

    /** Sets up a XMOT.interaction.behaviors.Translater for 2D translation.
     *  An event dispatcher will be configured for mousedown event to allow
     *  only left button in combination if the ctrl key being pressed.
     *
     *  @this {XMOT.interaction.widgets.TranslateGizmo}
     *  @private
     *
     *  @param {string} id
     *  @param {string} pickGrpId id of the geometry item for picking
     *  @param {XML3DVec3|!window.Element=} planeOrient the plane orientation of the translater
     *  @return {XMOT.interaction.behaviors.Translater}
     */
    _create2DTranslater: function(id, pickGrpId, planeOrient)
    {
        var eventDispatcher = new XMOT.util.EventDispatcher("mousedown", function(evt) {
            return (evt.ctrlKey && evt.button === XMOT.MOUSEBUTTON_LEFT);
        });

        var constraint = this._createTranslationConstraint(function(){});

        var graphRootXfmable = XMOT.ClientMotionFactory.createTransformable(
            this.geometry.getRoot(), constraint
        );

        var pickGrps = [this.geometry.getGeo(pickGrpId)];

        return new XMOT.interaction.behaviors.Translater(
            this.globalID(id), pickGrps, graphRootXfmable,
            planeOrient, eventDispatcher);
    },

    /** Creates a translation constraint, where the given constraint function is applied
     *  and afterwards updates the real target's translation with the new translation.
     *
     *  @this {XMOT.interaction.widgets.TranslateGizmo}
     *  @private
     *
     *  @param {function(window.XML3DVec3,window.XML3DVec3)} constrainTranslationFunction
     *  @return {XMOT.Constraint}
     *
     *  The constraint function is given the current translation and new translation
     *  and should update the new translation.
     */
    _createTranslationConstraint: function(constrainTranslationFunction) {

        var target = this._mirror.target();

        return {
            constrainRotation: function(newRotation, opts){
                return true;
            },
            constrainScaling: function(newScale, opts){
                return true;
            },

            constrainTranslation: function(newTranslation, opts) {
                if(!opts.transformable)
                    throw new Error("Constraint: no transformable given.");

                var currentTranslation = opts.transformable.getPosition();

                constrainTranslationFunction(currentTranslation, newTranslation);
                target.setPosition(newTranslation);

                return true;
            }
        };
    }
});
