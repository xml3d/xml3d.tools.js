(function(){

    "use strict";

    XMOT.namespace("XMOT.interaction.geometry");

    XMOT.interaction.geometry.TranslateBox = new XMOT.Class(
        XMOT.interaction.geometry.TargetScaledGeometry, {

        /**
         *  @this {XMOT.interaction.geometry.TranslateBox}
         *  @override
         *  @protected
         */
        onCreateDefsElements: function()
        {
            this.callSuper();

            // shaders
            this.geo.addShaders("s_transl", {
                diffuseColor: "1 1 1", transparency: "0.85"
            });
            this.geo.addShaders("s_transl_highlight", {
                diffuseColor: "1 1 1", transparency: "0.4"
            });

            // transforms
            this.geo.addTransforms("t_xytrans", {
                translation: "0 0 1"});
            this.geo.addTransforms("t_xytrans_inv", {
                translation: "0 0 -1", rotation: "0 1 0 3.14"});
            this.geo.addTransforms("t_yztrans", {
                translation: "1 0 0", rotation: "0 1 0 1.57"});
            this.geo.addTransforms("t_yztrans_inv", {
                translation: "-1 0 0", rotation: "0 1 0 -1.57"});
            this.geo.addTransforms("t_xztrans", {
                translation: "0 1 0", rotation: "1 0 0 -1.57"});
            this.geo.addTransforms("t_xztrans_inv", {
                translation: "0 -1 0", rotation: "1 0 0 1.57"});
        },

        /**
         *  @this {XMOT.interaction.geometry.TranslateBox}
         *  @override
         *  @protected
         */
        onCreateGraph: function()
        {
            this.callSuper();

            this.geo.addToGraphRoot([
                 this._createRectGrp("xytrans"),
                 this._createRectGrp("yztrans"),
                 this._createRectGrp("xztrans"),
                 this._createRectGrp("xytrans_inv"),
                 this._createRectGrp("yztrans_inv"),
                 this._createRectGrp("xztrans_inv")
            ]);
        },

        /**
         *  @this {XMOT.interaction.geometry.TranslateBox}
         *  @override
         *  @protected
         */
        onTargetXfmChanged: function()
        {
            this.callSuper();

            var rectFac = 0.93; // scale of rectangles (same, 1x1 rects)

            var rectScaleStr = rectFac + " " + rectFac + " " + rectFac;

            this.geo.updateTransforms([
                "t_xytrans", "t_xytrans_inv", "t_yztrans", "t_yztrans_inv",
                "t_xztrans", "t_xztrans_inv"
            ], {scale: rectScaleStr});
        },

        /**
         *  @this {XMOT.interaction.geometry.TranslateBox}
         *  @private
         *
         *  @param {string} localID
         */
        _createRectGrp: function(localID)
        {
            var rect = XMOT.creation.rectangle(this.geo.xml3d);

            var opts = {
                id: this.geo.globalID(localID),
                transform: "#" + this.geo.globalID("t_" + localID),
                shader: "#" + this.geo.globalID("s_transl"),
                children: [rect]
            };

            return XMOT.creation.element("group", opts);
        }
    });
}());
