XMOT.namespace("XMOT.interaction.geometry");

/** Geometry is used specifically by widgets to
 *  encapsulate it's geometry construction and handling. Usually
 *  a widget defines a certain type of geometry constructor using
 *  the GeometryType field of XMOT.interaction.widgets.Widget
 *  and the Widget does the rest.
 *
 *  Derived classes should override the following methods:
 *  o onCreateDefsElements(): called when the defs elements should be setup
 *  o onCreateGraph(): called when the actual graph is to be set-up. The defs elements are already
 *      attached at this point
 *  o onTargetXfmChanged(): called when the world transformation of the widget's target node changes.
 */
XMOT.interaction.geometry.Geometry = new XMOT.Class({

    /**
     *  @this {XMOT.interaction.geometry.Geometry}
     *  @param {XMOT.interaction.widgets.Widget} widget
     */
    initialize: function(widget)
    {
        this.geo = new XMOT.util.GeoObject(widget.ID, widget.xml3d, widget.root.object);
        this.widget = widget;

        this._targetTracker = new XMOT.TransformTracker(widget.target.object);
        this._targetTracker.xfmChanged = this.callback("onTargetXfmChanged");
    },

    /** Shortcut to graph root
     *  @this {XMOT.interaction.geometry.Geometry}
     */
    getRoot: function()
    {
        return this.geo.getGraphRoot();
    },

    /** Shortcut to geometry access
     *  @this {XMOT.interaction.geometry.Geometry}
     *  @param {string} id
     */
    getGeo: function(id)
    {
        return this.geo.graph[id];
    },

    /** Shortcut to geometry access
     *  @this {XMOT.interaction.geometry.Geometry}
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
     *  @this {XMOT.interaction.geometry.Geometry}
     */
    constructAndAttach: function()
    {
        this.createDefsElements();
        this.geo.attachDefs();

        this.createGraph();
        this.geo.attachGraph();

        this.onTargetXfmChanged();
    },

    destroy: function()
    {
        this.geo.destroy();
    },

    // to be overriden by derived class
    /**
     *  @this {XMOT.interaction.geometry.Geometry}
     */
    createDefsElements: function()
    {
        this.geo.addTransforms("t_root", {
            rotation: this.widget.target.getOrientation().str(),
            translation: this.widget.target.getPosition().str(),
        });
        this.onCreateDefsElements();
    },

    /**
     *  @this {XMOT.interaction.geometry.Geometry}
     */
    createGraph: function()
    {
        this.geo.setGraphRoot(XMOT.creation.element("group", {
            id: this.geo.globalID("g_root"),
            transform: "#" + this.geo.globalID("t_root")
        }));

        this.onCreateGraph();
    },

    /** This is called when the target transformation changes.
     *
     *  @this {XMOT.interaction.geometry.Geometry}
     *  @protected
     */
    onTargetXfmChanged: function() {},

    /** This is called when the defs elements are created. The geometry's
     *  root transform t_root is already created.
     *
     *  @this {XMOT.interaction.geometry.Geometry}
     *  @protected
     */
    onCreateDefsElements: function() {},

    /** This is called when the graph is created. The geometry's root
     *  is already initialized.
     *
     *  @this {XMOT.interaction.geometry.Geometry}
     *  @protected
     */
    onCreateGraph: function() {}
});
