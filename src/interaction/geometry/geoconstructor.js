XMOT.namespace("XMOT.interaction.geometry");

/** A geometry constructor is used specifically by widgets to
 *  encapsulate it's geometry construction. Usually
 *  a widget defines a certain type of geometry constructor using
 *  the GeoConstructorType field of XMOT.interaction.widgets.Widget
 *  and the Widget does the rest.
 *
 *  Derived classes should override the methods createDefsElements()
 *  as well as createGraph().
 */
XMOT.interaction.geometry.GeoConstructor = new XMOT.Class({

    /**
     *  @this {XMOT.interaction.geometry.GeoConstructor}
     *  @param {XMOT.interaction.widgets.Widget} widget
     */
    initialize: function(widget)
    {
        this.geo = widget.geo;
        this.targetNode = widget.target.object;
    },

    /** Setup the defs elements, attach them to the scene graph,
     *  create the graph and attach the graph, too.
     *
     *  @this {XMOT.interaction.geometry.GeoConstructor}
     */
    construct: function()
    {
        this.createDefsElements();
        this.geo.attachDefs();

        this.createGraph();
        this.geo.attachGraph();
    },

    // to be overriden by derived class
    /**
     *  @this {XMOT.interaction.geometry.GeoConstructor}
     */
    createDefsElements: function() {},

    /**
     *  @this {XMOT.interaction.geometry.GeoConstructor}
     */
    createGraph: function() {}
});
