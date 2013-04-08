
/** A simple class to manage a geometric object in XML3D. Elements to be inserted in the defs or
 * xml3d section can be added and removed. The object can be inserted and removed from the
 * document.
 *
 * -- Root Element --
 * Special is the root element. In GeoObject.graph["root"] the root element is placed. We want
 * this to have a unique interface for accessing the root node. Also when attaching the geometry
 * only the root node will be attached. All other elements in the graph attribute can be used
 * for storage. They will be detached from their parents during destruction.
 *
 * -- ID --
 * Each GeoObject has an ID. Storage in the defs and graph sections is addressed by local IDs.
 *
 * For example addShaders() or addTransforms() take local IDs, but construct elements with global
 * IDs, formed by the method globalID().
 */
XMOT.util.GeoObject = new XMOT.Class({

    /** Initializes the object.
     *
     *  @this {XMOT.util.GeoObject}
     *  @param {string} _id the ID of this object
     *  @param {!Object} _xml3d the xml3d element in which the object will reside
     *  @param {!Object} [_rootGrp] the group to which this object is to be attached. If not given
     *              it will be appended to the given xml3d element.
     */
    initialize: function(_id, _xml3d, _rootGrp)
    {
        this.ID = _id;
        this.xml3d = _xml3d;
        this.defsRoot = XMOT.util.getOrCreateDefs(_xml3d);

        if(_rootGrp)
            this.rootGrp = _rootGrp;
        else
            this.rootGrp = _xml3d;

        this._rootTransformable = null; // updated during setGraphRoot()

        this.defs = {};     // local IDs -> defs element
        this.graph = {}; // local IDs -> graph element. this.graph["root"] will hold the root node
    },

    /** Detaches the object and resets the defs and graph.
     *
     *  @this {XMOT.util.GeoObject}
     */
    destroy: function()
    {
        this.detach();

        this.defs = {};
        this.graph = {};
    },

    // ========================================================================
    // --- Attach/Detach ---
    // ========================================================================
    /** Attach the defs elements and the graph. Alternatively attachDefs() and
     *  attachGraph() can be called seperately.
     *
     *  @this {XMOT.util.GeoObject}
     */
    attach: function()
    {
    	this.attachDefs();
    	this.attachGraph();
    },

    /** Remove the graph and defs elements from the DOM.
     *
     *  @this {XMOT.util.GeoObject}
     */
    detach: function()
    {
        this.rootGrp.removeChild(this.graph["root"]);
        this._removeChildren(this.defsRoot, this.defs);
    },

    /** Add all defs elements to the defsRoot
     *
     *  @this {XMOT.util.GeoObject}
     */
    attachDefs: function()
    {
        this._appendChildren(this.defsRoot, this.defs);
    },

    /** Add the graph["root"] object to the root group
     *
     *  @this {XMOT.util.GeoObject}
     */
    attachGraph: function()
    {
        this.rootGrp.appendChild(this.graph["root"]);
    },

    // ========================================================================
    // --- Root Handling ---
    // ========================================================================
    /** Set the given node as the root node in the graph. This is the child node
     *  of this object's root group.
     *
     *  @this {XMOT.util.GeoObject}
     *  @param {!Object} rootNode
     */
    setGraphRoot: function(rootNode)
    {
        this.graph["root"] = rootNode;
        this._rootTransformable = XMOT.ClientMotionFactory.createTransformable(rootNode);
    },

    /** Add the given array of children to the graph root, set previously by
     *  setGraphRoot().
     *
     *  @this {XMOT.util.GeoObject}
     *  @param {Array.<Object>} children
     */
    addToGraphRoot: function(children)
    {
        if(!this.graph["root"])
            throw "XMOT.util.GeoObject: no root node present.";

        if(children.constructor !== Array)
            children = [children];

        for(var i = 0; i < children.length; i++)
            this.graph["root"].appendChild(children[i]);
    },

    /** Retrieve the graph root node.
     *
     *  @this {XMOT.util.GeoObject}
     *  @return {Object}
     */
    getGraphRoot: function()
    {
        return this.graph["root"];
    },


    /** Retrieve a transformable to the graph root node.
     *
     *  @this {XMOT.util.GeoObject}
     *  @return {XMOT.Transformable}
     */
    getGraphRootTransformable: function()
    {
        return this._rootTransformable;
    },

    // ========================================================================
    // --- Helpers ---
    // ========================================================================

    /** Convert a given id to a global one. This is done by prepending this object's
     *  id to the given id. This could be done without such a function, but it's
     *  pretty often used, so the encapsulation is useful.
     *
     *  @this {XMOT.util.GeoObject}
     *  @param {string} id a local ID to be converted
     *  @return {string} the converted, global, ID
     */
    globalID: function(id)
    {
        return this.ID + "_" + id;
    },

    /** Creates phong shaders and adds them to the defs elements.
     *
     *  @this {XMOT.util.GeoObject}
     *  @param {string|Array} IDs a single or array of local IDs for the shader.
     *  @param {Object} [opts] the options for XMOT.creation.phongShader()
     *
     *  The id of the created shaders will be set to global IDs. The options
     *  get applied to each of the given IDs.
     */
    addShaders: function(IDs, opts)
    {
        if(!opts)
            opts = {};

        if(IDs.constructor !== Array)
            IDs = [IDs];

        for(var i = 0; i < IDs.length; i++)
        {
            opts.id = this.globalID(IDs[i]);

            this.defs[IDs[i]] = XMOT.creation.phongShader(opts);
        }
    },

    /** Creates transform elements and adds them to the defs elements.
     *
     *  @this {XMOT.util.GeoObject}
     *  @param {string|Array} IDs a single or array of local IDs for the transform elements
     *  @param {Object} [opts] the options for XMOT.creation.element()
     *
     *  The id of the created shaders will be set to global IDs. The options will
     *  be applied to each ID.
     */
    addTransforms: function(IDs, opts)
    {
        if(!opts)
            opts = {};

        if(IDs.constructor !== Array)
            IDs = [IDs];

        for(var i = 0; i < IDs.length; i++)
        {
            opts.id = this.globalID(IDs[i]);

            this.defs[IDs[i]] = XMOT.creation.element("transform", opts);
        }
    },

    /** Set the contents of the transform elements, that have the given local IDs,
     *  with the given options. So basically setting a lot of transforms to the same
     *  values with a single call.
     *
     *  @this {XMOT.util.GeoObject}
     *  @param {string|Array} localIDs a single ID or an array of IDs
     *  @param {!Object} opts an object of options, supported: transl, scale, rot
     */
    updateTransforms: function(localIDs, opts)
    {
        if(localIDs.constructor !== Array)
            localIDs = [localIDs];

        var len = localIDs.length;
        for(var i = 0; i < len; i++)
        {
            var el = this.defs[localIDs[i]];
            if(!el)
                continue;

            if(opts.transl)
                el.setAttribute("translation", opts.transl);
            if(opts.scale)
                el.setAttribute("scale", opts.scale);
            if(opts.rot)
                el.setAttribute("rotation", opts.rot);
        }
    },

    // ========================================================================
    // --- Private ---
    // ========================================================================

    /** Append all children to the given element.
     *
     *  @this {XMOT.util.GeoObject}
     *  @param {!Object} targetEl
     *  @param {Array.<Object>} children
     */
    _appendChildren: function(targetEl, children)
    {
        for(var i in children)
            targetEl.appendChild(children[i]);
    },

    /** Remove all childen from the given element.
     *
     *  @this {XMOT.util.GeoObject}
     *  @param {!Object} targetEl
     *  @param {Array.<Object>} children
     */
    _removeChildren: function(targetEl, children)
    {
        for(var i in children)
            targetEl.removeChild(children[i]);
    }
});
