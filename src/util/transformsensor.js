
/** A simple TransformSensor, similar to X3D's TransformSensor.
 *
 * You give it a bounding box and target node. The sensor tracks transformation changes
 * in the target node and notifies the listeners as soon as the bounding box
 * of the target node intersects with the given bounding box.
 *
 * The registered listeners for "start" and "end" have a single argument:
 * the associated transform sensor. Any additional information can be obtained from
 * that sensor.
 * 
 * @extends XMOT.util.Observable
 */
XMOT.TransformSensor = new XMOT.util.Class(
    XMOT.util.Observable, {

    /** Initializes the sensor with the given values and attaches the sensor to
     *  the target groups.
     *  
     *  @this {XMOT.TransformSensor}
     *  
     *  @param {string} _id a unique identifier for this sensor
     *  @param {Array.<Object>} _tarGrps the groups of which to track transformation changes
     *  @param {XML3DBox} _bbox the bounding box to intersect the target groups with
     */
    initialize: function(_id, _tarGrps, _bbox)
    {        
        this.callSuper([
            "start", "end" // args (this) 
        ]); 

        this.ID = _id;
        this.xml3d = XMOT.util.getXml3dRoot(_tarGrps[0]);
        this.targetGrps = _tarGrps;
        this.bbox = _bbox;

        /** all the target elements that currently intersect with this sensor's
         * bounding box.
         *
         * The type is: grp -> boolean. I.e. it is a set.
         */
        this.currentIntersectGrps = []; 

        this._isAttached = false; 
        this.attach();
    },

    /** @this {XMOT.TransformSensor} */
    attach: function()
    {
        if(!this._isAttached)
        {
            this._observers = [];

            var grps = this.targetGrps;
            for(var i in grps)
            {
                var tar = grps[i];
                this._observers[tar] = new XMOT.TransformTracker(tar);
                this._observers[tar].xfmChanged = this.callback("_xfmChanged");
            }

            this._isAttached = true;
        }
    },

    /** @this {XMOT.TransformSensor} */
    detach: function()
    {
        if(this._isAttached)
        {
            var obs = this._observers;
            for(var i in obs)
            {
                var o = obs[i];

                o.xfmChanged = function() {};
                o.detach();
            }

            this._observers = [];

            this._isAttached = false;
        }
    },

    /** Callback of internally used XMOT.TransformTracker
     * 
     *  @this {XMOT.TransformSensor}
     *  @private
     *  
     *  @param {!Object} tarNode
     */
    _xfmChanged: function(tarNode)
    {
        var tarBBox = tarNode.getBoundingBox();

        var isInt = this.bbox.intersects(tarBBox);
        var alreadyInt = this.currentIntersectGrps[tarNode];

        if(isInt && !alreadyInt) // new intersection (no intersection before)
        {
            this.currentIntersectGrps[tarNode] = true;
            this.notifyListeners("start", this);
        }
        else if(!isInt && alreadyInt) // intersection gone (and intersection before)
        {
            this.currentIntersectGrps[tarNode] = false;
            this.notifyListeners("end", this);
        }
    }
});
