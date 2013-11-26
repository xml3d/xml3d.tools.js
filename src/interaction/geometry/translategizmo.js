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
         *  @param {Object=} options
         *
         *  options:
         *      o scale: a custom scale that should be applied to the geometry
         */
        initialize: function(widget, options)
        {
            if(!options)
                options = {};
            options = XMOT.extend({}, options);

            var customScale = new XML3DVec3(0.08, 0.08, 0.08);
            if(!options.scale)
                options.scale = customScale;
            else
                options.scale = options.scale.multiply(customScale);

            this.callSuper(widget, options);
        },

        /**
         *  @this {XMOT.interaction.geometry.TranslateGizmo}
         */
        onCreateDefsElements: function()
        {
            this.callSuper();

            this._createAxisArrowDefs("xaxis", "0 1 0 1.57", "0 0.8 0");
            this._createAxisArrowDefs("yaxis", "1 0 0 -1.57", "0.8 0 0");
            this._createAxisArrowDefs("zaxis", "0 0 1 0", "0 0 0.8");

            this._createAxisPlaneDefs("yzplane", "0 0.8 0", "0 1 0 -1.57", "0 1 1");
            this._createAxisPlaneDefs("xzplane", "0.8 0 0", "1 0 0 1.57", "1 0 1");
            this._createAxisPlaneDefs("xyplane", "0 0 0.8", "0 0 1 0", "1 1 0");
        },

        /**
         *  @this {XMOT.interaction.geometry.TranslateGizmo}
         */
        onCreateGraph: function()
        {
            this.callSuper();

            this.setGeo("xaxis", this._createAxisArrowGroup("xaxis"));
            this.setGeo("yaxis", this._createAxisArrowGroup("yaxis"));
            this.setGeo("zaxis", this._createAxisArrowGroup("zaxis"));

            this.setGeo("yzplane", this._createAxisPlaneGroup("yzplane"));
            this.setGeo("xzplane", this._createAxisPlaneGroup("xzplane"));
            this.setGeo("xyplane", this._createAxisPlaneGroup("xyplane"));

            this.geo.addToGraphRoot([
                this.getGeo("xaxis"),
                this.getGeo("yaxis"),
                this.getGeo("zaxis"),
                this.getGeo("yzplane"),
                this.getGeo("xzplane"),
                this.getGeo("xyplane")
            ]);
        },

        _createAxisArrowDefs: function(id, rotation, color)
        {
            this.geo.addTransforms("t_" + id, {
                rotation: rotation,
                scale: "1 1 2"
            });

            this.geo.addShaders("s_" + id, {
                shaderType: "urn:xml3d:shader:eyelight",
                diffuseColor: color,
                ambientIntensity: "0.3"
            });
        },

        _createAxisArrowGroup: function(id)
        {
            return XMOT.creation.element("group", {
                transform: "#" + this.geo.globalID("t_" + id),
                shader: "#" + this.geo.globalID("s_" + id),
                children: [
                    XMOT.creation.arrow(this.geo.xml3d)
                ]
            });
        },

        _createAxisPlaneDefs: function(id, color, rotation, translation)
        {
            var scaleVec = new XML3DVec3(0.3, 0.3, 0.3);
            var translVec = new XML3DVec3();
            translVec.setVec3Value(translation);
            translVec = translVec.multiply(scaleVec);

            this.geo.addTransforms("t_" + id, {
                rotation: rotation,
                scale: scaleVec.str(),
                translation: translVec.str()
            });

            this.geo.addShaders("s_" + id, {
                shaderType: "urn:xml3d:shader:eyelight",
                diffuseColor: color,
                ambientIntensity: "0.3",
                transparency: "0.5"
            });
        },

        _createAxisPlaneGroup: function(id)
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
