
XMOT.namespace("XMOT.interaction.widgets");

/**
 * Widget is a utility base class, that gathers some common functions required
 * by most widgets.
 *
 * o geometry and behavior attributes: places where to put geometry and behavior
 * o attach/detach(): automatic attach and detach and invoking corresponding callbacks, so child classes can react.
 * o onTargetXfmChanged() : called automatically when target's transformation changes
 * o callbacks where object creation/destruction takes place
 * o inherited from XMOT.util.Observable: child classes can use event mechanism easily.
 *
 * Derived classes have to specify the property GeometryType. It is used to construct the geometry
 * of the specific widget.
 *
 * @extends XMOT.util.Observable
 */
XMOT.interaction.widgets.Widget = new XMOT.Class(
    XMOT.util.Observable, {

    // this should be overriden by derived classes, else the widget won't have any geometry
    GeometryType: XMOT.interaction.geometry.Geometry,

    /** Sets up the basic construct for a widget and attaches it(!).
     *
     *  @this {XMOT.interaction.widgets.Widget}
     *
     *  @param {string} _id the id if this TransformBox and also the id of the corresponding root group node
     *  @param {XMOT.Transformable} _target the target transformable
     *  @param {boolean=} _autoScaleAdj automatically fit the scale of the widget's root group to the
     *      scaling of the target node. Default: true. Useful when widgets have to match the dimensions of the
     *      target node.
     *
     *  Most probably the target is not the group, that will be modified, but it's parent group,
     *  i.e. the group where the widget will be attached. Thus, an additional constraint for
     *  the target's parent node can be defined by calling Widget.setConstraint().
     *
     *  IMPORTANT: the target's corresponding transform node (for a group: the attached
     *  transform node and for a mesh that of it's parent node) is modified. If the target's
     *  group node has no transform element attached one is created.
     *  If the _target's parent node is not a group node an exception is thrown.
     */
    initialize: function(_id, _target, _autoScaleAdj)
    {
        if(_target.object.parentNode.tagName !== "group")
            throw new Error("XMOT.interaction.widgets.Widget: target's parent node must be a group.");

        this.callSuper();
        this.addListenerTypes(["dragstart", "drag", "dragend"]); // arg: this

        this.xml3d = XMOT.util.getXml3dRoot(_target.object);
        this.ID = _id;
        this.target = _target;

        // root: the container node whose transform a widget modifies.
        var rootGrp = this.target.object.parentNode;
        this.root = XMOT.ClientMotionFactory.createTransformable(rootGrp);

        this.geometry = new this.GeometryType(this);
        this.behavior = {}; // localID -> behavior, storage for all sensors and alike

        /** @private */
        this._autoScaleAdj = (_autoScaleAdj !== undefined) ? _autoScaleAdj : true;

        this._isAttached = false;
    },

    /** @this {XMOT.interaction.widgets.Widget} */
    attach: function()
    {
        if(!this._isAttached)
        {
            this.geometry.constructAndAttach();
            this._createBehavior();

            XMOT.util.fireWhenBBoxNotEmpty(this.target.object, this.callback("_updateDefsElements"));

            this._isAttached = true;
        }
    },

    /** @this {XMOT.interaction.widgets.Widget} */
    detach: function()
    {
        if(this._isAttached)
        {
            this._destroyBehavior();
            this.geometry.destroy();

            this._isAttached = false;
        }
    },

    /** Returns true if any object in the behavior is active. That means
     *  it has a method isActive and that method returns true.
     *
     *  @this {XMOT.interaction.widgets.Widget}
     *
     *  @return {boolean}
     */
    isActive: function()
    {
        if(!this._isAttached)
            return false;

        for(var i in this.behavior)
        {
            if(this.behavior[i].isActive
            && this.behavior[i].isActive())
                return true;
        }

        return false;
    },

    /** Set the given constraint in the root movable. That is the parent node's movable
     *  of the target movable given in the constructor.
     *
     *  @this {XMOT.interaction.widgets.Widget}
     *
     *  @param {XMOT.Constraint} newConstraint
     */
    setConstraint: function(newConstraint)
    {
        this.root.setConstraint(newConstraint);
    },

    // --- Methods to be overriden ---

    /** Called after defs and groups are attached and the behavior can be set up. This
     *  is done afterwards a TransformTracker is placed in behavior["target_track"] which
     *  will invoke the onTarXfmChanged() method, so that clients have a place to adjust
     *  to transformation changes.
     *
     *  @this {XMOT.interaction.widgets.Widget}
     *  @protected
     */
    onCreateBehavior: function() {},
    /** Called before geometry is destroyed and where the sensor attribute is still filled.
     *
     *  @this {XMOT.interaction.widgets.Widget}
     *  @protected
     */
    onDestroyBehavior: function() {},

    // --- Global ID stuff ---
    /** all IDs are prefixed with the widget's ID. This function
     *  encapsulates the creation of such "global" IDs.
     *
     *  @this {XMOT.interaction.widgets.Widget}
     *
     *  @param localID
     *  @return {string} the ID prefixed with the widget's ID
     */
    globalID: function(localID)
    {
        return this.ID + "_" + localID;
    },

    /** Returns the element corresponding to the global if of the given
     *  local id.
     *
     *  @this {XMOT.interaction.widgets.Widget}
     *
     *  @param {string} localID
     *  @return {Element}
     */
    element: function(localID)
    {
        return document.getElementById(this.globalID(localID));
    },

    // ========================================================================
    // --- Private ---
    // ========================================================================

    _createBehavior: function()
    {
        this.onCreateBehavior();
        for(var s in this.behavior)
        {
            var beh = this.behavior[s];
            if(!beh.addListener || !beh.isListenerType || !beh.isListenerType("dragstart")
            || !beh.isListenerType("drag") || !beh.isListenerType("dragend"))
                continue;

            beh.addListener("dragstart", this.callback("_onBehaviorDragStart"));
            beh.addListener("drag", this.callback("_onBehaviorDrag"));
            beh.addListener("dragend", this.callback("_onBehaviorDragEnd"));
        }

        this._isDragging = false;
    },

    /**
     *  @this {XMOT.interaction.widgets.Widget}
     *  @private
     */
    _destroyBehavior: function()
    {
        this.onDestroyBehavior();
        for(var s in this.behavior)
        {
            if(this.behavior[s].detach)
                this.behavior[s].detach();
        }

        this.behavior = {};
    },

    _onBehaviorDragStart: function()
    {
        if(this._isDragging)
            return;

        this._isDragging = true;
        this.notifyListeners("dragstart", this);
    },

    _onBehaviorDrag: function()
    {
        this.notifyListeners("drag", this);
    },

    _onBehaviorDragEnd: function()
    {
        if(!this._isDragging)
            return;

        this._isDragging = false;
        this.notifyListeners("dragend", this);
    },

    _updateDefsElements: function() {

        var targetXfm = this.target.transform;
        var tarBBox = this.target.object.getBoundingBox();

        // translation: offset of target's bbox
        var translation = new window.XML3DVec3(tarBBox.center());

        var scale = this._getWidgetScaling();

        // root
        this.geometry.geo.updateTransforms("t_root", {
        	transl: translation.str(),
        	scale: scale.str(),
            rot: targetXfm.rotation.str()
        });
    },

    /** Calculate the widget's scaling factor based on the target node's bounding
     *  box. The widget is scaled to be a little bit bigger than the target node's
     *  size.
     *  In addition, a minimum scaling factor is calculated (half of the average
     *  scaling factor of the widget). If a scaling dimension is lower than that minimum
     *  it is set to the minimum.
     *  Why? Manipulate a plane that has 0 y-extend.
     *
     *  @return {window.XML3DVec3} the widget's scaling vector
     */
    _getWidgetScaling: function() {

        var scale = new window.XML3DVec3(1,1,1);
        if(!this._autoScaleAdj)
            return scale;

        var tarBBoxSize = this.target.object.getBoundingBox().size();
        scale = tarBBoxSize.multiply(new window.XML3DVec3(0.55, 0.55, 0.55));

        var minScale = (scale.x + scale.y + scale.z) / 3;
        minScale /= 2;

        if(scale.x < minScale)
            scale.x = minScale;
        if(scale.y < minScale)
            scale.y = minScale;
        if(scale.z < minScale)
            scale.z = minScale;

        return scale;
    }
});
