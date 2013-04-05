(function(){

    "use strict";

    XMOT.namespace("XMOT.interaction.geometry");

    /** The tree of this geometry looks like this:
     *  o graph root
     *      o widget container
     *          o xaxis
     *          o yaxis
     *          o zaxis
     *
     *  The axes can be retrieved by their name using getGeo().
     */
    XMOT.interaction.geometry.TranslateGizmo = new XMOT.Class(
        XMOT.interaction.geometry.ViewedConstantSizeGeometry, {

        /**
         *  @this {XMOT.interaction.geometry.TranslateGizmo}
         *  @param {XMOT.interaction.widgets.Widget} widget
         */
        initialize: function(widget)
        {
            this.callSuper(widget, new XML3DVec3(0.1, 0.1, 0.1));
        },

        /**
         *  @this {XMOT.interaction.geometry.TranslateGizmo}
         */
        onCreateDefsElements: function()
        {
            this.callSuper();

            this._createAxisDefsElements("xAxis", "1 0 0", "0 1 0 1.57", "0 1 0");
            this._createAxisDefsElements("yAxis", "0 1 0", "1 0 0 -1.57", "1 0 0");
            this._createAxisDefsElements("zAxis", "0 0 1", "0 0 1 0", "0 0 1");
        },

        /**
         *  @this {XMOT.interaction.geometry.TranslateGizmo}
         */
        onCreateGraph: function()
        {
            this.callSuper();

            this.setGeo("xaxis", this._createAxisGroup("xAxis"));
            this.setGeo("yaxis", this._createAxisGroup("yAxis"));
            this.setGeo("zaxis", this._createAxisGroup("zAxis"));

            this.geo.addToGraphRoot([
                this.getGeo("xaxis"),
                this.getGeo("yaxis"),
                this.getGeo("zaxis")
            ]);
        },

        _createAxisDefsElements: function(id, translation, rotation, color)
        {
            this.geo.addTransforms("t_" + id, {
                translation: translation,
                rotation: rotation
            });

            this.geo.addShaders("s_" + id, {
                diffCol: color,
                ambInt: "1"
            });
        },

        _createAxisGroup: function(id)
        {
            return XMOT.creation.element("group", {
                transform: "#" + this.geo.globalID("t_" + id),
                shader: "#" + this.geo.globalID("s_" + id),
                children: [
                    XMOT.creation.arrow(this.geo.xml3d)
                ]
            });
        }
    });
}());
