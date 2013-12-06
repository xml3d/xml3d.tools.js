(function(){

    "use strict";

    XML3D.tools.namespace("XML3D.tools.interaction.geometry");

    /** Geometry is used specifically by widgets to
     *  encapsulate it's geometry construction and handling. Usually
     *  a widget defines a certain type of geometry constructor using
     *  the GeometryType field of XML3D.tools.interaction.widgets.Widget
     *  and the Widget does the rest.
     *
     *  Derived classes should override the following methods:
     *  o onCreateDefsElements(): called when the defs elements should be setup
     *  o onCreateGraph(): called when the actual graph is to be set-up. The defs elements are already
     *      attached at this point
     *  o onTargetXfmChanged(): called when the world transformation of the widget's target node changes.
     */
    XML3D.tools.interaction.geometry.Geometry = new XML3D.tools.Class({

        /**
         *  @this {XML3D.tools.interaction.geometry.Geometry}
         *  @param {XML3D.tools.interaction.widgets.Widget} widget
         */
        initialize: function(widget)
        {
            this.geo = new XML3D.tools.util.GeoObject(widget.ID, widget.xml3d, widget.target.object);
            this.widget = widget;

            this._targetTracker = new XML3D.tools.TransformTracker(widget.target.object);
            this._targetTracker.xfmChanged = this.callback("_onTargetXfmChanged");

            this._viewTracker = new XML3D.tools.ViewTracker(widget.xml3d);
            this._viewTracker.xfmChanged = this.callback("_onViewXfmChanged");
        },

        /** Shortcut to graph root
         *  @this {XML3D.tools.interaction.geometry.Geometry}
         */
        getRoot: function()
        {
            return this.geo.getGraphRoot();
        },

        /** Shortcut to geometry access
         *  @this {XML3D.tools.interaction.geometry.Geometry}
         *  @param {string} id
         */
        getGeo: function(id)
        {
            return this.geo.graph[id];
        },

        /** Shortcut to geometry access
         *  @this {XML3D.tools.interaction.geometry.Geometry}
         *
         *  @param {string} id
         *  @param {Object} geo geometry to be stored
         *  @return {Object} the given geometry
         */
        setGeo: function(id, geo)
        {
            this.geo.graph[id] = geo;
            return geo;
        },

        /** Setup the defs elements, attach them to the scene graph,
         *  create the graph and attach the graph, too.
         *
         *  @this {XML3D.tools.interaction.geometry.Geometry}
         */
        constructAndAttach: function()
        {
            this.createDefsElements();
            this.geo.attachDefs();

            this.createGraph();
            this.geo.attachGraph();

            this._targetTracker.attach();
            this._viewTracker.attach();

            this.onViewXfmChanged();
            this.onTargetXfmChanged();
        },

        destroy: function()
        {
            this._targetTracker.detach();
            this._viewTracker.detach();
            this.geo.destroy();
        },

        /**
         *  @this {XML3D.tools.interaction.geometry.Geometry}
         */
        createDefsElements: function()
        {
            this.geo.addTransforms("t_root");
            this.onCreateDefsElements();
        },

        /**
         *  @this {XML3D.tools.interaction.geometry.Geometry}
         */
        createGraph: function()
        {
            this.geo.setGraphRoot(XML3D.tools.creation.element("group", {
                id: this.geo.globalID("g_root"),
                transform: "#" + this.geo.globalID("t_root")
            }));

            this.onCreateGraph();
        },

        /**
         * Adds a highlight to the geometry with the given ID. All it does it to set
         * the ambient intensity of the corresponding shader to 1.
         *
         * @this {XML3D.tools.interaction.geometry.Geometry}
         * @param geometryId the ID of the geometry to be highlighted.
         */
        addHighlight: function(geometryId)
        {
            var shaderEl = this.geo.defs["s_" + geometryId];
            if(!shaderEl)
                throw new Error("RotateGizmo.addHighlight(): given shader does not exist: " + geometryId);

            shaderEl.__oldHighlightValue = XML3D.tools.util.setShaderAttribute(
                shaderEl, "ambientIntensity", "1");
        },

        /**
         * Removes a highlight from the geometry with the given ID. All it does it to restore
         * the ambient intensity that has been previously set with addHighlight().
         *
         * @this {XML3D.tools.interaction.geometry.Geometry}
         * @param geometryId the ID of the geometry from which the highlight is to be removed
         */
        removeHighlight: function(geometryId)
        {
            var shaderEl = this.geo.defs["s_" + geometryId];
            if(!shaderEl)
                throw new Error("RotateGizmo.removeHighlight(): given shader does not exist: " + geometryId);

            XML3D.tools.util.setShaderAttribute(
                shaderEl, "ambientIntensity", shaderEl.__oldHighlightValue);
            shaderEl.__oldHighlightValue = undefined;
        },

        /** This is called when the target transformation changes.
         *
         *  @this {XML3D.tools.interaction.geometry.Geometry}
         *  @protected
         */
        onTargetXfmChanged: function() {},

        /** This is called when the view transformation changes.
         *
         *  @this {XML3D.tools.interaction.geometry.Geometry}
         *  @protected
         */
        onViewXfmChanged: function() {},

        /** This is called when the defs elements are created. The geometry's
         *  root transform t_root is already created.
         *
         *  @this {XML3D.tools.interaction.geometry.Geometry}
         *  @protected
         */
        onCreateDefsElements: function() {},

        /** This is called when the graph is created. The geometry's root
         *  is already initialized.
         *
         *  @this {XML3D.tools.interaction.geometry.Geometry}
         *  @protected
         */
        onCreateGraph: function() {},

        /**
         *  We use an internal wrapper method instead of directly registering
         *  the protected method to allow an override of that method w/o affecting
         *  the ability to track the transformation changes.
         *
         *  @this {XML3D.tools.interaction.geometry.Geometry}
         *  @param {!Object} targetNode the node this observer tracks
         *  @param {!Event} evt the original DOM event that caused the change
         */
        _onTargetXfmChanged: function(targetNode, evt)
        {
            if(this.onTargetXfmChanged)
                this.onTargetXfmChanged();
        },

        /** This is called when the view transformation changes.
         *
         *  @this {XML3D.tools.interaction.geometry.Geometry}
         *  @param {Object} viewTracker the internal tracker used
         *  @param {Object} evt the original DOM event that caused the change
         */
        _onViewXfmChanged: function(viewTracker, evt)
        {
            if(this.onViewXfmChanged)
                this.onViewXfmChanged();
        }
    });
}());
