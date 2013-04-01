(function(){

    "use strict";

    XMOT.namespace("XMOT.interaction.geometry");

    XMOT.interaction.geometry.UniformScaler = new XMOT.Class(XMOT.interaction.geometry.Geometry, {

        /**
         *  @this {XMOT.interaction.geometry.UniformScaler}
         */
        onCreateDefsElements: function()
        {
            this.geo.addShaders("s_scale", {diffCol: "0.9 0.9 0.9"});
            this.geo.addShaders("s_scale_highlight", {diffCol: "0.9 0.9 0"});

            // cubes
            this.geo.addTransforms("t_scale");
            this.geo.addTransforms("t_top_cubes", {translation: "0 1 0"});
            this.geo.addTransforms("t_bot_cubes", {translation: "0 -1 0"});

            this.geo.addTransforms("t_cube_frontleft", {translation: "-1 0 1"});
            this.geo.addTransforms("t_cube_frontright", {translation: "1 0 1"});
            this.geo.addTransforms("t_cube_backleft", {translation: "-1 0 -1"});
            this.geo.addTransforms("t_cube_backright", {translation: "1 0 -1"});
        },

        /**
         *  @this {XMOT.interaction.geometry.UniformScaler}
         */
        onCreateGraph: function()
        {
            var top = XMOT.creation.element("group", {
                transform: "#" + this.geo.globalID("t_top_cubes"),
                children: [
                    this._createBoxGrp("t_cube_frontleft"),
                    this._createBoxGrp("t_cube_frontright"),
                    this._createBoxGrp("t_cube_backleft"),
                    this._createBoxGrp("t_cube_backright")
                ]
            });

            var bot = XMOT.creation.element("group", {
                transform: "#" + this.geo.globalID("t_bot_cubes"),
                children: [
                    this._createBoxGrp("t_cube_frontleft"),
                    this._createBoxGrp("t_cube_frontright"),
                    this._createBoxGrp("t_cube_backleft"),
                    this._createBoxGrp("t_cube_backright")
                ]
            });

            var cubes = XMOT.creation.element("group", {
                id: this.geo.globalID("scale"),
                transform: "#" + this.geo.globalID("t_scale"),
                shader: "#" + this.geo.globalID("s_scale"),
                children: [top, bot]
            });

            this.geo.addToGraphRoot(cubes);
        },

        /**
         *  @this {XMOT.interaction.geometry.UniformScaler}
         *  @override
         *  @protected
         */
        onTargetXfmChanged: function()
        {
            var cubeFac = 0.1; // scaling of cubes (are 1x1x1 boxes, so scale them down)
            var cube_scale = new window.XML3DVec3(cubeFac, cubeFac, cubeFac);

            var cubeScaleStr = cube_scale.x + " " + cube_scale.y + " " + cube_scale.z;
            this.geo.updateTransforms([
                "t_cube_frontleft", "t_cube_frontright", "t_cube_backleft", "t_cube_backright"
            ], {scale: cubeScaleStr});
        },

        /**
         *  @this {XMOT.interaction.geometry.UniformScaler}
         *  @private
         *
         *  @param {string} localTransformID id of the transform element the created group will refer to
         */
        _createBoxGrp: function(localTransformID)
        {
            var box = XMOT.creation.box(this.geo.xml3d);

            var opts = {};

            opts.transform = "#" + this.geo.globalID(localTransformID);
            opts.children = [box];

            var grp = XMOT.creation.element("group", opts);

            return grp;
        }
    });
}());
