XMOT.namespace("XMOT.interaction.geometry");

XMOT.interaction.geometry.SingleAxisRotatorGeoConstructor = new XMOT.Class({

    /**
     *  @this {XMOT.interaction.geometry.SingleAxisRotatorGeoConstructor}
     *  @param {XMOT.interaction.widgets.Widget} widget
     */
    initialize: function(widget)
    {
        this.geo = widget.geo;
        this.targetNode = widget.target.object;

        this.rotationAxis = "y";
        this.color = "0.9 0.9 0.9";
        this.highlightColor = "0.9 0.9 0";
    },

    /**
     *  @this {XMOT.interaction.geometry.SingleAxisRotatorGeoConstructor}
     */
    parseOptions: function(opts)
    {
        if(!opts)
            return;

        if(opts.axis)
            this.rotationAxis = opts.axis;
        if(opts.color)
            this.color = opts.color;
        if(opts.highlightColor)
            this.highlightColor = opts.highlightColor;
    },

    /**
     *  @this {XMOT.interaction.geometry.SingleAxisRotatorGeoConstructor}
     */
    createDefsElements: function()
    {
        // shaders
        this.geo.addShaders("s_rot_root", {diffCol: this.color, ambInt: 0.8});
        this.geo.addShaders("s_rot_root_highlight", {diffCol: this.highlightColor, ambInt: 0.8});

        // transforms
        this.geo.addTransforms("t_rot_1", {translation: "1 0 1"});
        this.geo.addTransforms("t_rot_2", {translation: "-1 0 1"});
        this.geo.addTransforms("t_rot_3", {translation: "1 0 -1"});
        this.geo.addTransforms("t_rot_4", {translation: "-1 0 -1"});

        // roots for rotation handles
        var opts = {};
        if(this.rotationAxis == "x")
            opts.rotation = "0 0 1 1.57";
        else if(this.rotationAxis == "z")
            opts.rotation = "1 0 0 1.57";

        this.geo.addTransforms("t_rot_root", opts);
    },

    /**
     *  @this {XMOT.interaction.geometry.SingleAxisRotatorGeoConstructor}
     */
    createGraph: function()
    {
        var yrot = XMOT.creation.element("group", {
            id: this.geo.globalID("rot_root"),
            shader: "#" + this.geo.globalID("s_rot_root"),
            transform: "#" + this.geo.globalID("t_rot_root"),
            children: [
                this._createBoxGrp("rot_1"),
                this._createBoxGrp("rot_2"),
                this._createBoxGrp("rot_3"),
                this._createBoxGrp("rot_4")
            ]
        });

        this.geo.addToGraphRoot(yrot);
    },

    /**
     *  @this {XMOT.interaction.geometry.SingleAxisRotatorGeoConstructor}
     *  @private
     *
     *  @param {string} localID
     */
    _createBoxGrp: function(localID)
    {
        var opts = {};

        opts.id = this.geo.globalID(localID);
        opts.transform = "#" + this.geo.globalID("t_" + localID);
        opts.children = [XMOT.creation.box(this.geo.xml3d)];

        return XMOT.creation.element("group", opts);
    }
});
