
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
     *  @param {Object} [_opts] options for the rotator 
     *  
     *  The following options are supported: 
     *  	o axis: the axis for rotation. "x", "y" or "z". Defaults to "y".
     *  	o color: the diffuse color of the shader for the axis bars 
     *  	o highlightColor: the diffuse color of the shader for the highlighting of the axis bars
     */
    initialize: function(_id, _target, _opts)
    {        
    	if(!_opts)
    		_opts = {}; 
    	
        /** @private */ 
        this._rotationAxis = "y";         
        if(_opts.axis)
        {
            if(typeof _opts.axis !== "string" 
            ||(_opts.axis != "x" && _opts.axis != "y" && _opts.axis != "z"))
                throw "XMOT.interaction.widgets.AxisRotator: invalid axis specified: " + _opts.axis; 
            
            this._rotationAxis = _opts.axis; 
        } 
        
        /** @private */ 
        this._color = "0.9 0.9 0.9";
        if(_opts.color)
        	this._color = _opts.color; 
        
        /** @private */  
        this._highlightColor = "0.9 0.9 0";
        if(_opts.highlightColor)
        	this._highlightColor = _opts.highlightColor; 
        
        this.callSuper(_id, _target); 
    },

    /** Set and/or retrieve the axis restriction. 
     *  See XMOT.interaction.behaviors.Rotater.axisRestriction(). 
     *  
     *  @this {XMOT.interaction.widgets.SingleAxisRotator} 
     *  
     * 	@param {string} [axis]
     * 	@return {string}
     */
    axisRestriction: function(axis)
    {        
        return this.behavior["rot"].axisRestriction(axis); 
    },

    /** Set or retrieve the status of rotation flipping. 
     *  See XMOT.interaction.behaviors.Rotater.flipRotation(). 
     *  
     *  @this {XMOT.interaction.widgets.SingleAxisRotator} 
     *  
     *  @param {boolean} [flip] 
     *  @return {boolean} 
     */
    flipRotation: function(flip)
    {
    	return this.behavior["rot"].flipRotation(flip); 
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
        this.geo.addShaders("s_rot_root", {diffCol: this._color});        
        this.geo.addShaders("s_rot_root_highlight", {diffCol: this._highlightColor}); 
        
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
