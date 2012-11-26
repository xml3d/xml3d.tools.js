
XMOT.namespace("XMOT.interaction.widgets"); 

/** 
 * The SingleAxisRotator class places thin rotation bars along one of the major axes 
 * to enable easy, axis-constrained rotation of a target object. 
 * 
 * As the name suggests, this rotator will place handles to do rotation around the local 
 * y-axis. For other axes simply place it under a group that rotates the widget geometry 
 * to the proper axis 
 * 
 * @extends XMOT.interaction.widgets.Widget
 */
XMOT.interaction.widgets.SingleAxisRotator = new XMOT.Class(
    XMOT.interaction.widgets.Widget, {
     
    /** Initializes the AxisRotator.
     *  
     *  @this {XMOT.interaction.widgets.SingleAxisRotator} 
     *  
     *  @param {string} _id 
     *  @param {!Element} _target
     *  @param {string} [_axis] the axis for rotation. "x", "y" or "z". Defaults to "y".
     */
    initialize: function(_id, _target, _axis)
    {        
        /** @private */ 
        this._rotationAxis = "y";         
        if(_axis)
        {
            if(typeof _axis !== "string" 
            ||(_axis != "x" && _axis != "y" && _axis != "z"))
                throw "XMOT.interaction.widgets.AxisRotator: invalid axis specified: " + _axis; 
            
            this._rotationAxis = _axis; 
        } 
        
        this.callSuper(_id, _target); 
    }, 

    // --------------------------------
    // -- Widget callbacks --
    // --------------------------------
    /** 
     *  @this {XMOT.interaction.widgets.SingleAxisRotator} 
     *  @override
     *  @protected 
     */
    onTargetXfmChanged: function()
    {
        // variables
        var targetInvScale = XMOT.math.vecInverseScale(
            this.target.object.getWorldMatrix().scale().scale(1.15));

        var handleFac = 0.05; // scaling of handles (are 1x1x1 boxes, so scale them down)

        var handle_scale = targetInvScale.scale(handleFac);

        // rotation handles
        var handleScaleStr = handle_scale.x + " 1 " + handle_scale.z;
        this.geo.updateTransforms([
            "t_rot_1", "t_rot_2", "t_rot_3", "t_rot_4"
        ], {scale: handleScaleStr});
    },

    /** 
     *  @this {XMOT.interaction.widgets.SingleAxisRotator} 
     *  @override
     *  @protected 
     */
    onCreateDefsElements: function()
    {
        // shaders
        this.geo.addShaders("s_rot_root", {diffCol: "0.9 0.9 0.9"});        
        this.geo.addShaders("s_rot_root_highlight", {diffCol: "0.9 0.9 0"}); 
        
        // transforms
        this.geo.addTransforms("t_rot_1", {translation: "1 0 1"});
        this.geo.addTransforms("t_rot_2", {translation: "-1 0 1"});
        this.geo.addTransforms("t_rot_3", {translation: "1 0 -1"});
        this.geo.addTransforms("t_rot_4", {translation: "-1 0 -1"});

        // roots for rotation handles
        var opts = {}; 
        if(this._rotationAxis == "x")
            opts.rotation = "0 0 1 1.57"; 
        else if(this._rotationAxis == "z")
            opts.rotation = "1 0 0 1.57"; 
        
        this.geo.addTransforms("t_rot_root", opts);
    },

    /** 
     *  @this {XMOT.interaction.widgets.SingleAxisRotator} 
     *  @override
     *  @protected 
     */
    onCreateGraph: function()
    {
        var yrot = XMOT.creation.element("group", {
            id: this.globalID("rot_root"),
            shader: "#" + this.globalID("s_rot_root"),
            transform: "#" + this.globalID("t_rot_root"), 
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
     *  @this {XMOT.interaction.widgets.SingleAxisRotator} 
     *  @override
     *  @protected 
     */
    onCreateBehavior: function()
    {
        // rotation handles
        this.behavior["rot"] = this._createRotSensor("rotSensor", "rot_root");
        this.behavior["rot"].axisRestriction(this._rotationAxis); 

        // setup listeners
        this.behavior["rot"].addListener("dragstart", this.callback("_activateHandles"));
        this.behavior["rot"].addListener("dragend", this.callback("_deactivateHandles"));
    },
    // --------------------------------
    // -- Behavior --
    // --------------------------------

    /** 
     *  @this {XMOT.interaction.widgets.SingleAxisRotator} 
     *  @private 
     */
    _activateHandles: function()
    {
        var grp = this.element("rot_root");
        var sh = this.element("s_rot_root_highlight"); 
        
        XMOT.util.shader(grp, sh); 

        XML3D.debug.logInfo("_activateHandles");
    },

    /** 
     *  @this {XMOT.interaction.widgets.SingleAxisRotator} 
     *  @private 
     */
    _deactivateHandles: function()
    {
        var grp = this.element("rot_root");
        var sh = this.element("s_rot_root"); 
        
        XMOT.util.shader(grp, sh); 

        XML3D.debug.logInfo("_deactivateHandles");
    },

    // --------------------------------
    // -- creation helpers --
    // --------------------------------
    /** 
     *  @this {XMOT.interaction.widgets.SingleAxisRotator} 
     *  @private
     *  
     *  @param {string} localID  
     */
    _createBoxGrp: function(localID)
    {
        var opts = {};
        
        opts.id = this.globalID(localID);
        opts.transform = "#" + this.globalID("t_" + localID);
        opts.children = [XMOT.creation.box(this.xml3d)];
         
        return XMOT.creation.element("group", opts);
    },

    /** 
     *  @this {XMOT.interaction.widgets.SingleAxisRotator} 
     *  @private
     * 
     *  @param {string} localID the id of the sensor 
     *  @param {string} localPickGrpID the id of the target picking group.
     *   
     *  @return {XMOT.interaction.behaviors.Rotater} 
     */
    _createRotSensor: function(localID, localPickGrpID)
    {
        var pickGrp = document.getElementById(this.globalID(localPickGrpID));
        
        return new XMOT.interaction.behaviors.Rotater(
            this.globalID(localID), [pickGrp], this.root, null, this.root.object);
    }
});
