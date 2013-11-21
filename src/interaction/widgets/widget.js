(function(){

    "use strict";

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
     * o automatic translation of widget geometry to the bbox center of the target node
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

        /** Sets up the basic construct for a widget.
         *
         *  @this {XMOT.interaction.widgets.Widget}
         *
         *  @param {string} id the id if this TransformBox and also the id of the corresponding root group node
         *  @param {XMOT.Transformable} target the target transformable
         *  @param {Object=} options
         *
         *  Options:
         *  o geometry: options given to the instanciated geometry class
         *  o isEmptyTarget: tell the widget that the target group will be left empty for unknown reason
         *      The widget will usually wait, until the bbox of the target is not empty, before it
         *      performs certain actions. If this option is true, the widget will carry out those
         *      actions immediately.
         *
         *  IMPORTANT: the target's corresponding transform node (for a group: the attached
         *  transform node and for a mesh that of it's parent node) is modified. If the target's
         *  group node has no transform element attached one is created.
         *  If the _target's parent node is not a group node an exception is thrown.
         */
        initialize: function(id, target, options)
        {
            if(!options)
                options = {};

            this.callSuper();
            this.addListenerTypes(["dragstart", "drag", "dragend"]); // arg: this

            this.xml3d = XMOT.util.getXml3dRoot(target.object);
            this.ID = id;
            this.target = target;

            this.geometry = new this.GeometryType(this, options.geometry);
            this.behavior = {}; // localID -> behavior, storage for all sensors and alike

            /** @private */
            this._isEmptyTarget = options.isEmptyTarget === true;

            this._isAttached = false;
        },

        /** @this {XMOT.interaction.widgets.Widget} */
        attach: function()
        {
            if(!this._isAttached)
            {
                this.onBeforeAttach();
                this.geometry.constructAndAttach();
                this._createBehavior();

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

                this.onAfterDetach();

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

        /** This is the target that should be used for the behaviors.
         *  It will be a transformable pointing to the widget's root node, i.e.
         *  the target's parent node.
         *
         *  @this {XMOT.interaction.widgets.Widget}
         *  @return {XMOT.Transformable}
         */
        createBehaviorTarget: function(constraint)
        {
            return XMOT.ClientMotionFactory.createTransformable(this.target.object, constraint);
        },

        // --- Methods to be overriden ---

        /** Called before anything is attached.
         *
         *  @this {XMOT.interaction.widgets.Widget}
         *  @protected
         */
        onBeforeAttach: function() {},

        /** Called after everything is detached.
         *
         *  @this {XMOT.interaction.widgets.Widget}
         *  @protected
         */
        onAfterDetach: function() {},

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
        }
    });
}());
