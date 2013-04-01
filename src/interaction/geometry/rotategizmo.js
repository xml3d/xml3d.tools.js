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
    XMOT.interaction.geometry.RotateGizmo = new XMOT.Class(XMOT.interaction.geometry.Geometry, {

        /**
         *  @this {XMOT.interaction.geometry.RotateGizmo}
         *  @param {XMOT.interaction.widgets.Widget} widget
         */
        initialize: function(widget)
        {
            this.callSuper(widget);
        },

        /**
         *  @this {XMOT.interaction.geometry.RotateGizmo}
         *  @override
         *  @protected
         */
        onCreateDefsElements: function()
        {
            this._halfSize = 0.3;
            var xTransl = "0 " + this._halfSize + " " + this._halfSize;
            this._createAxisDefsElements("xAxis", xTransl, "0 1 0 1.57", "0 1 0");

            var yTransl = this._halfSize + " 0 " + this._halfSize;
            this._createAxisDefsElements("yAxis", yTransl, "1 0 0 1.57", "1 0 0");

            var zTransl = this._halfSize + " " + this._halfSize + " 0";
            this._createAxisDefsElements("zAxis", zTransl, "0 0 1 0", "0 0 1");
        },

        /**
         *  @this {XMOT.interaction.geometry.RotateGizmo}
         *  @override
         *  @protected
         */
        onCreateGraph: function()
        {
            this.setGeo("xaxis", this._createAxisGroup("xAxis"));
            this.setGeo("yaxis", this._createAxisGroup("yAxis"));
            this.setGeo("zaxis", this._createAxisGroup("zAxis"));

            this.geo.addToGraphRoot([
                this.getGeo("xaxis"),
                this.getGeo("yaxis"),
                this.getGeo("zaxis")
            ]);
        },

        /**
         *  @this {XMOT.interaction.geometry.RotateGizmo}
         *  @override
         *  @protected
         */
        onTargetXfmChanged: function()
        {
        },

        /**
         *  @this {XMOT.interaction.geometry.RotateGizmo}
         *  @private
         *
         *  @param {string} id
         *  @param {string} translation
         *  @param {string} rotation
         *  @param {string} color
         */
        _createAxisDefsElements: function(id, translation, rotation, color)
        {
            var scale = this._halfSize + " " + this._halfSize + " " + this._halfSize;
            this.geo.addTransforms("t_" + id, {
                translation: translation,
                rotation: rotation,
                scale: scale
            });

            this.geo.addShaders("s_" + id, {
                diffCol: color,
                ambInt: "1"
            });
        },

        /**
         *  @this {XMOT.interaction.geometry.RotateGizmo}
         *  @private
         *
         *  @param {string} id
         */
        _createAxisGroup: function(id)
        {
            return XMOT.creation.element("group", {
                transform: "#" + this.geo.globalID("t_" + id),
                shader: "#" + this.geo.globalID("s_" + id),
                children: [
                    XMOT.creation.rectangle(this.geo.xml3d)
                ]
            });
        }
    });
}());
