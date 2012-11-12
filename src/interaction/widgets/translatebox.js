
XMOT.namespace("XMOT.interaction.widgets"); 

/** 
 * The TranslateBox places a semi-transparent cube around the target object. By
 * dragging the sides of that cube the target geometry gets translated along the 
 * dragged plane. 
 * 
 * @extends XMOT.interaction.widgets.Widget
 */
XMOT.interaction.widgets.TranslateBox = new XMOT.Class(
    XMOT.interaction.widgets.Widget, {
    
    /** 
     *  @inheritDoc 
     *  @this {XMOT.interaction.widgets.TranslateBox}
     */
    initialize: function(_id, _target)
    {        
        this.callSuper(_id, _target); 
       
        this.addListenerTypes([
           "dragstart", "dragend", "touch"// args: (this, sensor, original event)   
        ]); 
    }, 

    /** 
     *  @this {XMOT.interaction.widgets.TranslateBox}
     *  @override
     *  @protected
     */
    onTargetXfmChanged: function()
    {
        var rectFac = 0.93; // scale of rectangles (same, 1x1 rects)

        var rectScaleStr = rectFac + " " + rectFac + " " + rectFac;
        
        this.geo.updateTransforms([
            "t_xytrans", "t_xytrans_inv", "t_yztrans", "t_yztrans_inv",
            "t_xztrans", "t_xztrans_inv"
        ], {scale: rectScaleStr});
    },

    // --------------------------------
    // -- Creation --
    // --------------------------------

    /** 
     *  @this {XMOT.interaction.widgets.TranslateBox}
     *  @override
     *  @protected
     */
    onCreateDefsElements: function()
    {
        // shaders
        this.geo.addShaders([
            "s_xytrans", "s_yztrans", "s_xztrans",
            "s_xytrans_inv", "s_yztrans_inv", "s_xztrans_inv"
        ], {
            diffCol: "1 1 1", transp: "0.85"
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
     *  @this {XMOT.interaction.widgets.TranslateBox}
     *  @override
     *  @protected
     */
    onCreateGraph: function()
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
     *  @this {XMOT.interaction.widgets.TranslateBox}
     *  @override
     *  @protected
     */
    onCreateBehavior: function()
    {       
        this._addTransSensor("xytrans");
        this._addTransSensor("xytrans_inv"); 
        this._addTransSensor("yztrans"); 
        this._addTransSensor("yztrans_inv"); 
        this._addTransSensor("xztrans"); 
        this._addTransSensor("xztrans_inv"); 
    },

    // --------------------------------
    // -- Behavior --
    // --------------------------------
    /** Highlights the active plane by modifying the shader under the id localShaderID  
     * 
     *  @this {XMOT.interaction.widgets.TranslateBox}
     *  @private 
     * 
     *  @param {XMOT.interaction.behaviors.PDSensor} sensor
     *  @param {MouseEvent} ev
     *  @param {string} localShaderID 
     */
    _onDragStart: function(sensor, ev, localShaderID)
    {
        var sh = this.element(localShaderID); 
        var transp = XMOT.util.getNamedChild(sh, "transparency"); 
        
        transp.firstChild.data = "0.4";
        
        this.notifyListeners("dragstart", this, sensor, ev); 
    },
    
    /** Removes the highlight of the active plane .
     * 
     *  @this {XMOT.interaction.widgets.TranslateBox}
     *  @private 
     * 
     *  @param {XMOT.interaction.behaviors.PDSensor} sensor
     *  @param {MouseEvent} ev
     *  @param {string} localShaderID 
     */
    _onDragEnd: function(sensor, ev, localShaderID)
    {
        var sh = this.element(localShaderID); 
        var transp = XMOT.util.getNamedChild(sh, "transparency");
        
        transp.firstChild.data = "0.9";
        
        this.notifyListeners("dragend", this, sensor, ev);
    },
    
    /**
     *  @this {XMOT.interaction.widgets.TranslateBox}
     *  @private 
     * 
     *  @param {XMOT.interaction.behaviors.PDSensor} sensor
     *  @param {MouseEvent} ev
     */
    _onTouch: function(sensor, ev)
    {
        this.notifyListeners("touch", this, sensor, ev); 
    }, 
    
    // --------------------------------
    // -- helpers --
    // --------------------------------
    /**
     *  @this {XMOT.interaction.widgets.TranslateBox}
     *  @private
     *  
     *  @param {string} localID
     */
    _addTransSensor: function(localID)
    {
        // create sensor
        var pickGrp = this.element(localID);        
        var id = this.globalID(localID + "Sensor");

        this.behavior[localID] = new XMOT.interaction.behaviors.Translater(
            id, [pickGrp], this.root, pickGrp);
        
        // attach listeners
        var self = this;
        var localShId = "s_" + localID; 

        this.behavior[localID].addListener("dragstart", function(sensor, ev){self._onDragStart(sensor, ev, localShId);});
        this.behavior[localID].addListener("dragend", function(sensor, ev){self._onDragEnd(sensor, ev, localShId);});
        this.behavior[localID].addListener("touch", this.callback("_onTouch")); 
    }, 
    
    /**
     *  @this {XMOT.interaction.widgets.TranslateBox}
     *  @private
     *  
     *  @param {string} localID
     */
    _createRectGrp: function(localID)
    {
        var rect = XMOT.creation.rectangle(this.xml3d);

        var opts = {
            id: this.globalID(localID),
            transform: "#" + this.globalID("t_" + localID), 
            shader: "#" + this.globalID("s_" + localID), 
            children: [rect]
        }; 
        
        return XMOT.creation.element("group", opts);
    }
});
