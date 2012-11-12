
XMOT.namespace("XMOT.interaction.widgets"); 

/**
 * Encapsulates the XML3D.interaction.behaviors.RingMenu behavior
 * into a widget that contains arrows for stepping through the items.
 * 
 * @extends XMOT.interaction.widgets.Widget
 */
XMOT.interaction.widgets.RingMenu = new XMOT.Class(
    XMOT.interaction.widgets.Widget, {

    /** Setup the ring menu and attach it to the target group.
     * 
     *  @this {XMOT.interaction.widgets.RingMenu} 
     *  
     *  @param {!Object} _xml3d
     *  @param {string} _id
     *  @param {!Object} _targetGrp
     *  @param {number} _radius
     */
    initialize: function(_id, _targetGrp, _radius)
    {
        /** @private */
        this._radius = _radius; 
        
        // initialization with targetGrp's children        
        var tarXfm = (new XMOT.ClientMotionFactory()).createTransformable(_targetGrp);        
        this.callSuper(_id, tarXfm, false); 
    },

    /** @this {XMOT.interaction.widgets.RingMenu} */
    stepLeft: function()
    {
        this.behavior["ringmenu"].stepLeft();
    },

    /** @this {XMOT.interaction.widgets.RingMenu} */
    stepRight: function()
    {
        this.behavior["ringmenu"].stepRight();
    },

    /** @this {XMOT.interaction.widgets.RingMenu} */
    step: function(numStepsLeft)
    {
        this.behavior["ringmenu"].step(numStepsLeft);
    },

    /** 
     *  @this{XMOT.interaction.widgets.RingMenu}
     *  @override
     *  @protected
     */
    onCreateDefsElements: function()
    {
        // shaders
        this.geo.addShaders("s_choose", {diffCol: "0.9 0 0"});
        this.geo.addShaders("s_chooseHigh", {diffCol: "0 0.9 0"});  

        // transforms
        var menuBBox = XMOT.util.getChildrenBBox(this.target.object);

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

    /** 
     *  @this{XMOT.interaction.widgets.RingMenu}
     *  @override
     *  @protected
     */
    onCreateGraph: function()
    {        
        this._geoChooseLeft = XMOT.creation.element("group", {
            id: this.globalID("chooseleft"), 
            transform: "#" + this.geo.defs["t_chooseLeft"].id,
            shader: "#" + this.geo.defs["s_choose"].id, 
            children: [this._createArrowGroup()]
        });
        
        this._geoChooseRight = XMOT.creation.element("group", {
            id: this.globalID("chooseright"), 
            transform: "#" + this.geo.defs["t_chooseRight"].id,
            shader: "#" + this.geo.defs["s_choose"].id, 
            children: [this._createArrowGroup()]
        });       
        
        this.geo.addToGraphRoot(this._geoChooseLeft); 
        this.geo.addToGraphRoot(this._geoChooseRight); 
    }, 

    /** 
     *  @this{XMOT.interaction.widgets.RingMenu}
     *  @override
     *  @protected
     */
    onCreateBehavior: function() 
    {                
        var beh = new XMOT.interaction.behaviors.RingMenu(
            this.globalID("behavior"), 
            this.target.object, this._radius
        );        

        this._toggleChooserListeners(true);
        
        beh.attach(); 
        this.behavior["ringmenu"] = beh; 
    }, 

    // ========================================================================
    // --- Private ---
    // ========================================================================

    /** 
     *  @this {XMOT.interaction.widgets.RingMenu}
     *  @private 
     *  
     *  @param {boolean} doAttach whether to attach or detach 
     */
    _toggleChooserListeners: function(doAttach)
    {
        var dFn = null; 
        var eFn = null; 
        
        if(doAttach)
        {
            dFn = document.addEventListener; 
            eFn = Element.prototype.addEventListener;
        }
        else
        {
            dFn = document.removeEventListener; 
            eFn = Element.prototype.removeEventListener;            
        }
        
        dFn.call(document, "keyup", 
            this.callback("_onKeyUp"), false);

        // left-arrow focusing
        eFn.call(this._geoChooseLeft, "click", 
            this.callback("stepLeft"), false);
        eFn.call(this._geoChooseLeft, "mouseover", 
                this.callback("_focusLeftArrow"), false);
        eFn.call(this._geoChooseLeft, "mouseout", 
                this.callback("_defocusLeftArrow"), false);    

        // right-arrow focusing
        eFn.call(this._geoChooseRight, "click", 
            this.callback("stepRight"), false);
        eFn.call(this._geoChooseRight, "mouseover", 
                this.callback("_focusRightArrow"), false);
        eFn.call(this._geoChooseRight, "mouseout", 
            this.callback("_defocusRightArrow"), false);
            
    }, 

    /** 
     *  @this {XMOT.interaction.widgets.RingMenu}
     *  @private 
     */
    _focusLeftArrow: function() 
    {
        this._focusArrow(this._geoChooseLeft); 
    }, 

    /** 
     *  @this {XMOT.interaction.widgets.RingMenu}
     *  @private 
     */
    _defocusLeftArrow: function()
    {
        this._focusArrow(this._geoChooseLeft, true);
    },

    /** 
     *  @this {XMOT.interaction.widgets.RingMenu}
     *  @private 
     */
    _focusRightArrow: function() 
    {
        this._focusArrow(this._geoChooseRight); 
    }, 

    /** 
     *  @this {XMOT.interaction.widgets.RingMenu}
     *  @private 
     */
    _defocusRightArrow: function()
    {
        this._focusArrow(this._geoChooseRight, true);
    },

    /** 
     *  @this {XMOT.interaction.widgets.RingMenu}
     *  @private 
     */
    _focusArrow: function(arr, disableFocus)
    {
        if(disableFocus)
            XMOT.util.shader(arr, this.geo.defs["s_choose"]);
        else
            XMOT.util.shader(arr, this.geo.defs["s_chooseHigh"]);
    },

    /** 
     *  @this {XMOT.interaction.widgets.RingMenu}
     *  @private 
     */
    _onKeyUp: function(evt)
    {
        switch(evt.which)
        {
        case 37: // left cursor key
            this.stepLeft();
            break;

        case 39: // right cursor key
            this.stepRight();
            break;
        }
    },

    // --------------------------------
    // -- Creation Helpers --
    // --------------------------------

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
