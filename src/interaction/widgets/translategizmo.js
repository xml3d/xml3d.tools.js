
XMOT.namespace("XMOT.interaction.widgets");

/**
 * TODO
 *
 * @extends XMOT.interaction.widgets.Widget
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
     *  @param {XMOT.Transformable} _target
     */
    initialize: function(_id, _target)
    {
        if(_target.object.parentNode.tagName !== "group")
            throw new Error("XMOT.interaction.widgets.TranslateGizmo: target's parent node must be a group.");

        this._realTarget = _target;

        var xml3dTarget = XMOT.util.getXml3dRoot(_target.object);

        this._xml3dOverlay = new XMOT.XML3DOverlay(xml3dTarget);

        var mirroredTarget = this._createMirroredTarget(_id, _target);

        var mirroredTargetXfmable =
            XMOT.ClientMotionFactory.createTransformable(mirroredTarget);
        this.callSuper(_id, mirroredTargetXfmable);
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

    /** Will mirror the transformations of the target node in the
     *  xml3d overlay and append it to the overlay.
     *
     *  The following tree is created:
     *  o target's grandparent
     *      o target's parent
     *          o target
     *
     *  This is needed because:
     *  1) the widget needs access to the target node itself, so it's replicated.
     *  2) the widget will modify the target's parent node, so the exact parent node transformation
     *      has to be replicated.
     *  3) because of the above the grandparent node will hold the world transformation of the
     *      target's grandparent node.
     *
     *  @this {XMOT.interaction.widgets.TranslateGizmo}
     *  @return {Element} the mirrored target
     */
    _createMirroredTarget: function(id, target)
    {
        var defsOverlay = XMOT.util.getOrCreateDefs(this._xml3dOverlay.xml3d);

        var targetNode = target.object;

        // target node
        var mirroredTarget = this._createTransformedGroup(
            "t_mirroredTarget_" + id, targetNode.getLocalMatrix());

        // target parent
        var targetParent = targetNode.parentNode;
        var parentMatrix = new XML3DMatrix();
        if(targetParent && targetParent.getLocalMatrix)
            parentMatrix = targetParent.getLocalMatrix();

        var mirroredTargetParent = this._createTransformedGroup("t_mirroredTargetParent_" + id,
            parentMatrix, mirroredTarget);

        // target's grandparent
        var targetGrandparent = targetParent ? targetParent.parentNode : null;
        var grandparentMatrix = new XML3DMatrix();
        if(targetGrandparent && targetGrandparent.getWorldMatrix)
            grandparentMatrix = targetGrandparent.getWorldMatrix();

        var mirroredTargetGrandparent = this._createTransformedGroup(
            "t_mirroredTargetParentsParent_" + id, grandparentMatrix, mirroredTargetParent);

        this._xml3dOverlay.xml3d.appendChild(mirroredTargetGrandparent);

        return mirroredTarget;
    },

    /** Create a group that is transformed by the given matrix.
     *
     *  @this {XMOT.interaction.widgets.TranslateGizmo}
     *  @private
     *
     *  @param {string} transformId
     *  @param {window.XML3DMatrix} xfmMatrix
     *  @param {window.Element=} child
     */
    _createTransformedGroup: function(transformId, xfmMatrix, child)
    {
        var defsOverlay = XMOT.util.getOrCreateDefs(this._xml3dOverlay.xml3d);

        defsOverlay.appendChild(XMOT.creation.element("transform", {
            id: transformId,
            translation: xfmMatrix.translation().str(),
            rotation: xfmMatrix.rotation().str()
        }));

        var group = XMOT.creation.element("group", {
            transform: "#" + transformId
        });

        if(child)
            group.appendChild(child);

        return group;
    },

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
     *  @param {function(window.XML3DVec3,window.XML3DVec3)} constrainTranslationFunction
     *  @return {XMOT.Constraint}
     *
     *  The constraint function is given the current translation and new translation
     *  and should update the new translation.
     */
    _createTranslationConstraint: function(constrainTranslationFunction) {

        var target = this._realTarget;

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
