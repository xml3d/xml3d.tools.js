
XMOT.namespace("XMOT.interaction.widgets"); 

/** 
 * The UniformScaler widget will attach interactive cubes at the edges of the bounding box 
 * of the target node. If the cubes are dragged uniform scaling is performed on the target node. 
 * 
 * @extends XMOT.interaction.widgets.Widget
 */
XMOT.interaction.widgets.UniformScaler = new XMOT.Class(
    XMOT.interaction.widgets.Widget, {
        
    /** 
     *  @this {XMOT.interaction.widgets.UniformScaler}
     *  @override
     *  @protected
     */
    onTargetXfmChanged: function()
    {
        var targetInvScale = XMOT.math.vecInverseScale(
            this.target.object.getWorldMatrix().scale().scale(1.15));

        var cubeFac = 0.1; // scaling of cubes (also here those boxes)
        var cube_scale = targetInvScale.scale(cubeFac);

        var cubeScaleStr = cube_scale.x + " " + cube_scale.y + " " + cube_scale.z;
        this.geo.updateTransforms([
            "t_cube_frontleft", "t_cube_frontright", "t_cube_backleft", "t_cube_backright"
        ], {scale: cubeScaleStr});
    },
    
    /** 
     *  @this {XMOT.interaction.widgets.UniformScaler}
     *  @override
     *  @protected
     */
    onCreateDefsElements: function()
    {
        // shaders
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
     *  @this {XMOT.interaction.widgets.UniformScaler}
     *  @override
     *  @protected
     */
    onCreateGraph: function()
    {
        var top = XMOT.creation.element("group", {
            transform: "#" + this.globalID("t_top_cubes"),
            children: [
                this._createBoxGrp("t_cube_frontleft"),
                this._createBoxGrp("t_cube_frontright"), 
                this._createBoxGrp("t_cube_backleft"),
                this._createBoxGrp("t_cube_backright")
            ]
        });

        var bot = XMOT.creation.element("group", {
            transform: "#" + this.globalID("t_bot_cubes"),
            children: [
                this._createBoxGrp("t_cube_frontleft"),
                this._createBoxGrp("t_cube_frontright"),
                this._createBoxGrp("t_cube_backleft"), 
                this._createBoxGrp("t_cube_backright")
            ]
        });

        var cubes = XMOT.creation.element("group", {
            id: this.globalID("scale"),
            transform: "#" + this.globalID("t_scale"),
            shader: "#" + this.globalID("s_scale"), 
            children: [top, bot]
        });

        this.geo.addToGraphRoot(cubes); 
    },
    
    /** 
     *  @this {XMOT.interaction.widgets.UniformScaler}
     *  @override
     *  @protected
     */
    onCreateBehavior: function()
    {        
        var scalehandle = document.getElementById(this.globalID("scale"));

        this.behavior["scale"] = new XMOT.interaction.behaviors.Scaler(
            this.globalID("scaleSensor"), [scalehandle], this.root, true);

        // setup listeners
        this.behavior["scale"].addListener("dragstart", this.callback("_activateHandles"));        
        this.behavior["scale"].addListener("dragend", this.callback("_deactivateHandles"));
    },

    // --------------------------------
    // -- Behavior --
    // --------------------------------

    /** 
     *  @this {XMOT.interaction.widgets.UniformScaler}
     *  @private 
     */
    _activateHandles: function()
    {        
        XMOT.util.shader(this.element("scale"), 
                         this.element("s_scale_highlight"));
    },

    /** 
     *  @this {XMOT.interaction.widgets.UniformScaler}
     *  @private 
     */
    _deactivateHandles: function()
    {        
        XMOT.util.shader(this.element("scale"), 
                         this.element("s_scale"));
    },

    // --------------------------------
    // -- DOM helpers --
    // --------------------------------
    /** 
     *  @this {XMOT.interaction.widgets.UniformScaler}
     *  @private
     *   
     *  @param {string} localTransformID id of the transform element the created group will refer to
     */
    _createBoxGrp: function(localTransformID)
    {
        var box = XMOT.creation.box(this.xml3d);

        var opts = {};

        opts.transform = "#" + this.globalID(localTransformID);
        opts.children = [box];
         
        var grp = XMOT.creation.element("group", opts);

        return grp;
    }
});
