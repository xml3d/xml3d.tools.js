
XMOT.namespace("XMOT.interaction.widgets"); 

/** 
 * Widget is a utility base class, that gathers some common functions required 
 * by most widgets. 
 * 
 * o geo and behavior attributes: places where to put geometry and behavior 
 * o attach/detach(): automatic attach and detach and invoking corresponding callbacks, so child classes can react. 
 * o onTargetXfmChanged() : called automatically when target's transformation changes 
 * o callbacks where object creation/destruction takes place 
 * o inherited from XMOT.util.Observable: child classes can use event mechanism easily.
 * 
 * @extends XMOT.util.Observable
 */
XMOT.interaction.widgets.Widget = new XMOT.Class(
    XMOT.util.Observable, {

    /** Sets up the basic construct for a widget and attaches it(!).  
     *
     *  @this {XMOT.interaction.widgets.Widget}
     *  
     *  @param {string} _id the id if this TransformBox and also the id of the corresponding root group node
     *  @param {XMOT.Transformable} _target the target transformable
     *  @param {boolean} [_autoScaleAdj] automatically fit the scale of the widget's root group to the 
     *      scaling of the target node. Default: true. Useful when widgets have to match the dimensions of the
     *      target node.  
     * 
     *  Most probably the target is not the group, that will be modified, but it's parent group, 
     *  i.e. the group where the widget will be attached. Thus, an additional constraint for 
     *  the target's parent node can be defined by calling Widget.setConstraint(). 
     *
     *  IMPORTANT: the target's corresponding transform node (for a group: the attached
     *  transform node and for a mesh that of it's parent node) is modified. If the target's
     *  group node has no transform element attached one is created.
     *  If the _target's parent node is not a group node an exception is thrown.
     */
    initialize: function(_id, _target, _autoScaleAdj)
    {        
        if(_target.object.parentNode.tagName !== "group")
            throw new Error("XMOT.interaction.widgets.Widget: target's parent node must be a group.");
        
        this.callSuper();
        
        this.xml3d = XMOT.util.getXml3dRoot(_target.object);
        this.ID = _id;  
        this.target = _target; 

        // root: the container node whose transform a widget modifies.
        var rootGrp = this.target.object.parentNode;
        this.root = XMOT.ClientMotionFactory.createTransformable(rootGrp); 
        
        this.geo = new XMOT.util.GeoObject(this.ID, this.xml3d, rootGrp); 
        this.behavior = {}; // localID -> behavior, storage for all sensors and alike 
        
        /** @private */ 
        this._autoScaleAdj = (_autoScaleAdj !== undefined) ? _autoScaleAdj : true; 
        
    	this.xml3d.addEventListener("framedrawn", this.callback("_onXml3dFrameDrawn"), false);
        
        this._isAttached = false; 
        this.attach();
    },
    
    /** @this {XMOT.interaction.widgets.Widget} */
    attach: function()
    {
        if(!this._isAttached)
        {
            this._createGeometry();
            this._createBehavior();

            this._isAttached = true;
        }
    },

    /** @this {XMOT.interaction.widgets.Widget} */
    detach: function()
    {
        if(this._isAttached)
        {
            this._destroyBehavior();
            this._destroyGeometry();

            this._isAttached = false;
        }
    },
    
    /** Returns true if any object in the behavior is active. That means 
     *  it has a method isActive and that method returns true. 
     * 
     *  @this {XMOT.interaction.widgets.Widget}
     *  
     *  @return {boolean}
     */
    isActive: function()
    {
        if(!this._isAttached)
            return false; 
        
        for(var i in this.behavior)
        {
            if(this.behavior[i].isActive
            && this.behavior[i].isActive())
                return true; 
        }
        
        return false; 
    }, 
    
    /** Set the given constraint in the root movable. That is the parent node's movable 
     *  of the target movable given in the constructor. 
     * 
     *  @this {XMOT.interaction.widgets.Widget}
     *  
     *  @param {XMOT.Constraint} newConstraint
     */
    setConstraint: function(newConstraint)
    {
        this.root.setConstraint(newConstraint); 
    }, 
    
    // --- Methods to be overriden --- 
    /** Called when transformation of target node changes
     * 
     *  @this {XMOT.interaction.widgets.Widget}
     *  @protected
     */
    onTargetXfmChanged: function() {},  
    
    /** Called when the document finished loading, i.e. the target object's bounding box 
     *  is not empty.  
     *  
     *  @this {XMOT.interaction.widgets.Widget}
     *  @protected
     */
    onDocumentReady: function() {}, 
    
    /** Called when the geo's defs elements should be filled. This is after 
     *  the widget's setup, i.e. a transform called "t_root" will be available already. 
     *  
     *  @this {XMOT.interaction.widgets.Widget}
     *  @protected
     */  
    onCreateDefsElements: function() {}, 
    /** Called when the geo's graph section should be filled. This is after 
     *  the widget's setup, i.e. the graph root is already present and elements should 
     *  be appended to that root. 
     * 
     *  The size of the target node is already incorporated, so the graph elements can 
     *  take a unit size. This is why the widget handles the root element.
     *  
     *  @this {XMOT.interaction.widgets.Widget}
     *  @protected 
     */ 
    onCreateGraph: function() {}, 
    /** Called after defs and groups are attached and the behavior can be set up. This 
     *  is done afterwards a TransformTracker is placed in behavior["target_track"] which 
     *  will invoke the onTarXfmChanged() method, so that clients have a place to adjust 
     *  to transformation changes. 
     *  
     *  @this {XMOT.interaction.widgets.Widget}
     *  @protected
     */ 
    onCreateBehavior: function() {}, 
    /** Called before geo's stuff is destroyed. 
     *  
     *  @this {XMOT.interaction.widgets.Widget}
     *  @protected
     */
    onDestroyGeometry: function() {}, 
    /** Called before geometry is destroyed and where the sensor attribute is still filled. 
     *  
     *  @this {XMOT.interaction.widgets.Widget}
     *  @protected
     */ 
    onDestroyBehavior: function() {}, 
   
    // --- Global ID stuff --- 
    /** all IDs are prefixed with the widget's ID. This function 
     *  encapsulates the creation of such "global" IDs. 
     * 
     *  @this {XMOT.interaction.widgets.Widget}
     *  
     *  @param localID
     *  @return {string} the ID prefixed with the widget's ID 
     */
    globalID: function(localID)
    {
        return this.ID + "_" + localID; 
    },
    
    /** Returns the element corresponding to the global if of the given 
     *  local id. 
     *  
     *  @this {XMOT.interaction.widgets.Widget}
     *  
     *  @param {string} localID
     *  @return {Element} 
     */
    element: function(localID)
    {
        return document.getElementById(this.globalID(localID)); 
    }, 

    // ========================================================================
    // --- Private --- 
    // ========================================================================        
    /** 
     *  @this {XMOT.interaction.widgets.Widget}
     *  @private 
     */
    _createGeometry: function()
    {        
        this._createDefsElements();     // own setup 
        this.onCreateDefsElements();    // client's setup 
        this.geo.attachDefs();          // attach 'em 

        this._createGraph();    
        this.onCreateGraph();  
        this.geo.attachGraph(); 
        
        this._onTargetXfmChanged(); 
    },

    /** 
     *  @this {XMOT.interaction.widgets.Widget}
     *  @private 
     */
    _createBehavior: function() 
    {
        this.behavior["target_track"] = new XMOT.TransformTracker(this.target.object);
        this.behavior["target_track"].xfmChanged = this.callback("_onTargetXfmChanged");
        
        this.onCreateBehavior(); 
    }, 

    /** 
     *  @this {XMOT.interaction.widgets.Widget}
     *  @private 
     */
    _destroyGeometry: function()
    {
        this.onDestroyGeometry(); 
        this.geo.destroy(); 
    },

    /** 
     *  @this {XMOT.interaction.widgets.Widget}
     *  @private 
     */
    _destroyBehavior: function()
    {
        this.onDestroyBehavior(); 
        for(var s in this.behavior)
        {
            if(this.behavior[s].detach)
                this.behavior[s].detach();
        }

        this.behavior = {};
    },

    /** 
     *  @this {XMOT.interaction.widgets.Widget}
     *  @private 
     */
    _onXml3dFrameDrawn: function() 
    {
		/** Funny hack: we don't know right now when the bbox is valid.
		 *  So we wait until we reach a frame where the bounding box is not empty,
		 *  and just then select the instance, i.e. creating the transformbox.
		 */
    	
    	if(!this.target.object.getBoundingBox().isEmpty())
		{
    		this.xml3d.removeEventListener("framedrawn", this.callback("_onXml3dFrameDrawn"), false);     		
    		this._onDocumentReady(); 
		}
    },

    /** 
     *  @this {XMOT.interaction.widgets.Widget}
     *  @private 
     */
    _onDocumentReady: function() 
    {
    	this._updateDefsElements(); 
    	this.onDocumentReady(); 
    }, 

    /** 
     *  @this {XMOT.interaction.widgets.Widget}
     *  @private 
     */
    _onTargetXfmChanged: function() 
    {
        this.onTargetXfmChanged(); 
    },

    /** 
     *  @this {XMOT.interaction.widgets.Widget}
     *  @private 
     */
    _createDefsElements: function()
    {
        // root
        this.geo.addTransforms("t_root");
        
        this._updateDefsElements();
    }, 
    
    _updateDefsElements: function() {
    	
    	// don't yet update when bbox empty 
    	if(this.target.object.getBoundingBox().isEmpty())
    		return; 

        var targetXfm = this.target.transform;
        var tarBBox = this.target.object.getBoundingBox(); 

        // translation: offset of target's bbox 
        var translation = new window.XML3DVec3(tarBBox.center()); 

        // scale: little big bigger than target's bbox size 
        var scale = new window.XML3DVec3(1,1,1);         
        if(this._autoScaleAdj)
        {            
            var tarBBoxSize = tarBBox.size();
            scale = tarBBoxSize.multiply(new window.XML3DVec3(0.55, 0.55, 0.55));
        }

        // root
        this.geo.updateTransforms("t_root", {
        	transl: translation.str(), 
        	scale: scale.str(), 
            rot: targetXfm.rotation.str()
        });
    }, 

    /** 
     *  @this {XMOT.interaction.widgets.Widget}
     *  @private 
     */
    _createGraph: function()
    {
        this.geo.setGraphRoot(XMOT.creation.element("group", {
            id: this.globalID("g_root"),
            transform: "#" + this.globalID("t_root")
        })); 
    }
}); 
