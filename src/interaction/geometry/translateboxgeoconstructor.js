XMOT.namespace("XMOT.interaction.geometry");

XMOT.interaction.geometry.TranslateBoxGeoConstructor = new XMOT.Class({

    /**
     *  @this {XMOT.interaction.geometry.TranslateBoxGeoConstructor}
     *  @param {XMOT.interaction.widgets.Widget} widget
     */
    initialize: function(widget)
    {
        this.geo = widget.geo;
    },

    /**
     *  @this {XMOT.interaction.geometry.TranslateBoxGeoConstructor}
     */
    createDefsElements: function()
    {
        // shaders
        this.geo.addShaders("s_transl", {
            diffCol: "1 1 1", transp: "0.85"
        });
        this.geo.addShaders("s_transl_highlight", {
            diffCol: "1 1 1", transp: "0.4"
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
     *  @this {XMOT.interaction.geometry.TranslateBoxGeoConstructor}
     */
    createGraph: function()
    {
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
     *  @this {XMOT.interaction.geometry.TranslateBoxGeoConstructor}
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
