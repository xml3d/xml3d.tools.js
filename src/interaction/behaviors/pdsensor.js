
XMOT.namespace("XMOT.interaction.behaviors"); 

if(!XMOT.interaction)
    XMOT.interaction = {}; 

if(!XMOT.interaction.behaviors)
    XMOT.interaction.behaviors = {}; 

/** A simple pointing device sensor.
 *
 * Listens to mouse events and notifies listeners of dragging events, i.e.
 * start/end of dragging and the dragging itself, as well as touch events,
 * when the pointing device touched an element (e.g. mouse click event).
 * The state of the sensor includes a pointing device position (represented
 * by a ray), the current hit element and corresponding hit point.
 *
 * Users of the class register handlers to the dragging events
 * "dragstart", "drag" and "dragend". 
 * 
 * @extends XMOT.util.Observable
 *
 */
XMOT.interaction.behaviors.PDSensor = new XMOT.Class(
    XMOT.util.Observable, {

    /** Constructor of PDSensor
     * @this {XMOT.interaction.behaviors.PDSensor}
     * 
     * @param {string} id the id of this sensor
     * @param {Array.<Object>} grps the groups this sensor should look for. All should have the same xml3d root element. 
     */
    initialize: function(id, grps)
    {        
        // setup listener manager
        this.callSuper([                        
            "dragstart", "drag", "dragend", // args (this, MouseEvent) 
            "touch", // args (this, MouseEvent "mouseup"), drag executed on same location
            "attach", "detach" // args (),  raised during calls to attach()/detach()
        ]); 
        
        this.ID = id;
        this.xml3d = XMOT.util.getXml3dRoot(grps[0]); 
        this.pickGroups = grps;
        
        // -- pointing device's pose and hit information --
        this.pdPose = new window.XML3DRay(new window.XML3DVec3(0,0,0), new window.XML3DVec3(0,0,1));
        this.curHitElement = null;
        this.curHitPoint = null; // if hit occured, holds hit point, else is null

        // pointing stuff 
        /** @private */
        this._sensorIsActive = false; 
        /** @private */        
        this._numObjsOver = 0; // number of objects the sensor is pointing towards 
        /** @private */
        this._mouseDownPos = {x: -1, y: -1};

        // attach sensor 
        /** @private */ 
        this._isAttached = false;
        this.attach();
    },

    // -- attaching/detaching of mouse events --
    /**
     * @this {XMOT.interaction.behaviors.PDSensor}
     */
    attach: function()
    {
        if(!this._isAttached)
        {
            for(var i = 0; i < this.pickGroups.length; i++)
            {
                this.pickGroups[i].addEventListener("mouseover",
                    this.callback("_onMouseOver"), false);
                this.pickGroups[i].addEventListener("mouseout",
                    this.callback("_onMouseOut"), false);
                this.pickGroups[i].addEventListener("mousedown",
                    this.callback("_onMouseDown"), false);
            }

            this.xml3d.addEventListener("mousemove", this.callback("_onMouseMove"), false);
            this.xml3d.addEventListener("mouseup", this.callback("_onMouseUp"), false);
            
            this.notifyListeners("attach"); 

            this._isAttached = true;
        }
    },

    /**
     * @this {XMOT.interaction.behaviors.PDSensor}
     */
    detach: function()
    {
        if(this._isAttached)
        {
            for(var i in this.pickGroups)
            {
                this.pickGroups[i].removeEventListener("mouseover",
                    this.callback("_onMouseOver"), false);
                this.pickGroups[i].removeEventListener("mouseout",
                    this.callback("_onMouseOut"), false);
                this.pickGroups[i].removeEventListener("mousedown",
                    this.callback("_onMouseDown"), false);
            }

            this.xml3d.removeEventListener("mousemove", this.callback("_onMouseMove"), false);
            this.xml3d.removeEventListener("mouseup", this.callback("_onMouseUp"), false);
            
            this.notifyListeners("detach"); 

            this._isAttached = false;
        }
    },

    // -- Status access --
    /**
     * @this {XMOT.interaction.behaviors.PDSensor}
     */
    isOver: function() { return (this._numObjsOver === 0); },
    /**
     * @this {XMOT.interaction.behaviors.PDSensor}
     */
    isActive: function() { return this._sensorIsActive; },

    // ========================================================================
    // --- Private --- 
    // ========================================================================

    // -- Mouse Event Handlers --
    /** onMouseOver: called if pd is moved over the influenced groups
     * 
     *  @this {XMOT.interaction.behaviors.PDSensor}
     *  @private 
     *  @param {MouseEvent} evt
     */
    _onMouseOver: function(evt)
    {
        this._numObjsOver++;
    },

    /** onMouseOut: called when pd is moved out of influenced groups
     * 
     *  @this {XMOT.interaction.behaviors.PDSensor}
     *  @private
     *   
     *  @param {MouseEvent} evt
     */
    _onMouseOut: function(evt)
    {
        this._numObjsOver--;
    },

    /** onMouseDown: called when primary pd button is pressed over influenced groups
     * 
     *  @this {XMOT.interaction.behaviors.PDSensor}
     *  @private 
     *  @param {MouseEvent} evt
     */
    _onMouseDown: function(evt)
    {
    	evt.stopPropagation(); 
    	
        this._mouseDownPos = {x: evt.pageX, y: evt.pageY};

        this._pickAndUpdateStatus(evt.pageX, evt.pageY);

        this._sensorIsActive = true;

        this.notifyListeners("dragstart", this, evt);
    },

    /** onMouseMove: called whenever the pd is moved
     *  important: it is called when a move happens in xml3d tag,
     *  not just over influenced groups
     * 
     *  @this {XMOT.interaction.behaviors.PDSensor}
     *  @private 
     *  @param {MouseEvent} evt
     */
    _onMouseMove: function(evt)
    {    	
        this._pickAndUpdateStatus(evt.pageX, evt.pageY);

        if(this._sensorIsActive)
        {
        	evt.stopPropagation(); 
        	
            this.notifyListeners("drag", this, evt);
        }
    },

    /** Called when mouseup on xml3d element.
     * 
     *  @this {XMOT.interaction.behaviors.PDSensor}
     *  @private 
     *  
     *  @param {MouseEvent} evt
     */
    _onMouseUp: function(evt)
    {
        this._pickAndUpdateStatus(evt.pageX, evt.pageY);

        if(this._sensorIsActive)
        {
        	evt.stopPropagation(); 
        	
            this._sensorIsActive = false;

            this.notifyListeners("dragend", this, evt);
        }

        // raise click if: mouse position is same for mousedown and mouseup event
        // and an element is currently hit
        if(this.curHitElement
        && this._mouseDownPos.x === evt.pageX
        && this._mouseDownPos.y === evt.pageY
        && evt.button == 0) // only take left-button clicks as touch
            this.notifyListeners("touch", this, evt);
    },

    /** perform a pick with the given page coordinates and update the internal state.
     * 
     *  @this {XMOT.interaction.behaviors.PDSensor}
     *  @private 
     *  @param {number} pageX
     *  @param {number} pageY
     */
    _pickAndUpdateStatus: function(pageX, pageY)
    {
        // update pd sensor status
        var pos = XML3D.util.convertPageCoords(this.xml3d, pageX, pageY);

        this.pdPose = this.xml3d.generateRay(pos.x, pos.y);
        this.curHitPoint = new window.XML3DVec3();

        this.curHitElement = this.xml3d.getElementByPoint(pos.x, pos.y, this.curHitPoint);
        if(!this.curHitElement)
            this.curHitPoint = null; // invalidate hit point
    }
});
