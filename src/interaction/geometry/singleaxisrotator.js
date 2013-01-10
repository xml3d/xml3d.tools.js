XMOT.namespace("XMOT.interaction.geometry");

XMOT.interaction.geometry.SingleAxisRotator = new XMOT.Class(XMOT.interaction.geometry.Geometry, {

    /**
     *  @this {XMOT.interaction.geometry.SingleAxisRotator}
     *  @param {XMOT.interaction.widgets.Widget} widget
     */
    initialize: function(widget)
    {
        this.callSuper(widget);

        this.rotationAxis = "y";
        this.color = "0.9 0.9 0.9";
        this.highlightColor = "0.9 0.9 0";
    },

    /**
     *  @this {XMOT.interaction.geometry.SingleAxisRotator}
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
     *  @this {XMOT.interaction.geometry.SingleAxisRotator}
     */
    onCreateDefsElements: function()
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
     *  @this {XMOT.interaction.geometry.SingleAxisRotator}
     */
    onCreateGraph: function()
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
     *  @this {XMOT.interaction.geometry.SingleAxisRotator}
     *  @override
     *  @protected
     */
    onTargetXfmChanged: function()
    {
        // variables
        var targetInvScale = XMOT.math.vecInverseScale(
            this.targetNode.getWorldMatrix().scaling().scale(1.15));

        var handleFac = 0.05; // scaling of handles (are 1x1x1 boxes, so scale them down)

        var handle_scale = targetInvScale.scale(handleFac);

        // rotation handles
        var handleScaleStr = handle_scale.x + " 1 " + handle_scale.z;
        this.geo.updateTransforms([
            "t_rot_1", "t_rot_2", "t_rot_3", "t_rot_4"
        ], {scale: handleScaleStr});
    },

    /**
     *  @this {XMOT.interaction.geometry.SingleAxisRotator}
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
