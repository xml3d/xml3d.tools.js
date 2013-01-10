XMOT.namespace("XMOT.interaction.geometry");

XMOT.interaction.geometry.RingMenuGeoConstructor = new XMOT.Class({

	initialize: function(widget)
	{
		this.geo = widget.geo;
		this.targetNode = widget.target.object;

		// explicit pointers to the arrow geometries
		// constructed during createGraph()
		this.geoChooseLeft = null;
		this.geoChooseRight = null;
	},

	createDefsElements: function()
	{
        // shaders
        this.geo.addShaders("s_choose", {diffCol: "0.9 0 0"});
        this.geo.addShaders("s_chooseHigh", {diffCol: "0 0.9 0"});

        // transforms
        var menuBBox = XMOT.util.getChildrenBBox(this.targetNode);

        var transly = menuBBox.min.y -1 ;
        var translz = menuBBox.max.z;

        this.geo.addTransforms("t_chooseLeft", {
            translation: -2 + " " + transly + " " + translz,
            rotation: "0 1 0 -1.57",
            scale: "1.3 1.3 1.3"
        });

        this.geo.addTransforms("t_chooseRight", {
            translation: 2 + " " + transly + " " + translz,
            rotation: "0 1 0 1.57",
            scale: "1.3 1.3 1.3"
        });
	},

	createGraph: function()
	{
        this.geoChooseLeft = XMOT.creation.element("group", {
            id: this.geo.globalID("chooseleft"),
            transform: "#" + this.geo.defs["t_chooseLeft"].id,
            shader: "#" + this.geo.defs["s_choose"].id,
            children: [this._createArrowGroup()]
        });

        this.geoChooseRight = XMOT.creation.element("group", {
            id: this.geo.globalID("chooseright"),
            transform: "#" + this.geo.defs["t_chooseRight"].id,
            shader: "#" + this.geo.defs["s_choose"].id,
            children: [this._createArrowGroup()]
        });

        this.geo.addToGraphRoot(this.geoChooseLeft);
        this.geo.addToGraphRoot(this.geoChooseRight);
	},


    /**
     *  @this {XMOT.interaction.widgets.RingMenu}
     *  @private
     */
    _createArrowGroup: function()
    {
        var mesh = XMOT.creation.element("mesh", {src: "#d_arrow"});

        var grp = XMOT.creation.element("group", {transform: "#t_arrow"});
        grp.appendChild(mesh);

        return grp;
    }
});
