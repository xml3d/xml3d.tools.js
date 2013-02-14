
XMOT.namespace("XMOT.interaction.behaviors");

/** A plane sensor is a pointing device sensor that maps the movement of
 *  the pointing device on a plane. Listeners can be registered for the
 *  event "translchanged", which is raised whenever the pointing
 *  device changed the position on that plane.
 *  In this case the translation property gives the translation since the
 *  start of dragging.
 *
 *  In addition a constraint can be specified to adjust the calculated translation.
 *
 *  One handy thing is the getCanonicalTranslation() method. No matter what the
 *  current plane origin or normal is, this returns the translation in the
 *  canonical [o: (0,0,0), d: (0,0,1)] plane. This comes in handy when
 *  you need to rely on two dimensions (often the case with mouse).
 *
 *  @extends XMOT.interaction.behaviors.PDSensor
 */

XMOT.interaction.behaviors.PlaneSensor = new XMOT.Class(
    XMOT.interaction.behaviors.PDSensor,
{
    /** Constructor of PlaneSensor
     *
     *  @this {XMOT.interaction.behaviors.PlaneSensor}
     *
     *  @param {string} id the id of this sensor
     *  @param {Array.<Object>} grps the groups this sensor should look for
     *  @param {XML3DVec3|!Object=} planeOrient the group or vector the sensor takes to decide where the plane
     * 			normal should reside. If it's a group the local z=0 plane of the given group is taken.
     * 			If a vector is given, the vector directly is taken. If not specified a plane
     * 			parallel to the user's view is taken.
     *  @param {Object=} translationConstraint constraint that is applied to the final translation output
     */
    initialize: function(id, grps, planeOrient, translationConstraint)
    {
        this.callSuper(id, grps);

        // the translation in the plane during a drag operation
        this.translation = new window.XML3DVec3(0,0,0);
        // plane origin during a drag operation
        this.planeOrigin = new window.XML3DVec3(0,0,0);

        /** The translation constraint for constraining the final output value */
        if(translationConstraint !== undefined && translationConstraint !== null)
            this._translationConstraint = translationConstraint;
        else
            this._translationConstraint = new XMOT.BoxedTranslationConstraint();

        this.setPlaneOrientation(planeOrient);

        // setup listeners
        this.addListenerTypes("translchanged");

        this.addListener("dragstart", this.callback("_onPlaneDragStart"));
        this.addListener("drag", this.callback("_onPlaneDrag"));
        this.addListener("dragend", this.callback("_onPlaneDragEnd"));
    },

    /** retrieve the current translation value in the canonical
     *  plane [o: (0,0,0), d: (0,0,1)] no matter what the current origin or
     *  normal is.
     *
     *  In this method no constraints are applied!
     *
     *  @this {XMOT.interaction.behaviors.PlaneSensor}
     *
     *  @return {XML3DVec3}
     */
    getCanonicalTranslation: function()
    {
        var mat = XMOT.math.getTransformPlaneToPlane(this.planeOrigin, this.getPlaneNormal());

        var torig = mat.multiplyPt(this.planeOrigin);
        var tp = mat.multiplyPt(this.planeOrigin.add(this.translation));
        tp = tp.subtract(torig);

        return tp;
    },

    /** Set the plane orientation vector or group.
     *
     *  @this {XMOT.interaction.behaviors.PlaneSensor}
     *
     *  @param {XML3DVec3|Object} planeOrient
     */
    setPlaneOrientation: function(planeOrient)
    {
        // The plane normal calculated during getPlaneNormal().
        this._validPlaneNormal = new window.XML3DVec3(0, 0, 1);
        this._planeNormalValid = false;

        // user-defined plane orientation
        this._planeNormal = null;
        this._orientGrp = null;

        if(planeOrient)
        {
            if(planeOrient.constructor === window.XML3DVec3)
                this._planeNormal = planeOrient;
            else // no vector, assume group
                this._orientGrp = planeOrient;
        }
    },

    /** Calculate the plane normal. Always use this method to obtain the plane
     *  normal.
     *
     *  @this {XMOT.interaction.behaviors.PlaneSensor}
     *
     *  @return {XML3DVec3}
     */
    getPlaneNormal: function()
    {
        if(this._planeNormalValid)
            return this._validPlaneNormal;

        // user set normal
        if(this._planeNormal)
        {
            this._validPlaneNormal = this._planeNormal;
        }
        // user set group
        else if(this._orientGrp)
        {
            var plNorm = new window.XML3DVec3(0, 0, 1);
            this._validPlaneNormal = this._orientGrp.getWorldMatrix().multiplyDir(plNorm);
        }
        // take view as basis
        else
        {
            var va = XML3D.util.getOrCreateActiveView(this.xml3d);
            var wMat = va.getViewMatrix().inverse();

            this._validPlaneNormal = wMat.multiplyDir(new window.XML3DVec3(0,0,1));
        }

        this._validPlaneNormal = this._validPlaneNormal.normalize();
        this._planeNormalValid = true;

        return this._validPlaneNormal;
    },

    // ========================================================================
    // --- Private ---
    // ========================================================================

    // --- Drag methods ---
    /** Callback for PDSensor's dragstart event
     *
     *  @this {XMOT.interaction.behaviors.PlaneSensor}
     *  @private
     *
     *  @param {XMOT.interaction.behaviors.PDSensor} sensor
     */
    _onPlaneDragStart: function(sensor)
    {
        this.planeOrigin = new window.XML3DVec3(sensor.curHitPoint);
        this._planeHitPoint = new window.XML3DVec3(this.planeOrigin);
        this._planeNormalValid = false;
    },

    /** Callback for PDSensor's drag event
     *
     *  @this {XMOT.interaction.behaviors.PlaneSensor}
     *  @private
     *
     *  @param {XMOT.interaction.behaviors.PDSensor} sensor
     */
    _onPlaneDrag: function(sensor)
    {
        var hitP = this._calcPlaneHitPoint();
        if(!hitP)
            return;
        this._planeHitPoint = hitP;

        this._calcTranslation();

        this.notifyListeners("translchanged", this);
    },

    /** Callback for PDSensor's dragend event
     *
     *  @this {XMOT.interaction.behaviors.PlaneSensor}
     *  @private
     *
     *  @param {XMOT.interaction.behaviors.PDSensor} sensor
     */
    _onPlaneDragEnd: function(sensor)
    {
    },

    /** Calculate the hit point on the sensor's plane.
     *
     *  @this {XMOT.interaction.behaviors.PlaneSensor}
     *  @private
     *
     *  @return {XML3DVec3} the hit point or null in case no hit occured
     */
    _calcPlaneHitPoint: function()
    {
        // intersect ray with view plane norm
        var intersectHitP = new window.XML3DVec3();

        if(1 !== XMOT.math.intersectRayPlane(this.pdPose,
            this.planeOrigin, this.getPlaneNormal(), intersectHitP))
        {
            // either didnt hit or whole ray lies on plane
            // ignore it
            return null;
        }

        return intersectHitP;
    },

    /** Calculate translation based on the current _planeHitPoint
     *  and apply translation offset and constrain it. It will set
     *  the translation property of this instance.
     *
     *  @this {XMOT.interaction.behaviors.PlaneSensor}
     *  @private
     */
    _calcTranslation: function()
    {
        var transl = this._planeHitPoint.subtract(this.planeOrigin);

        if(this._translationConstraint.constrainTranslation(transl))
        {
            this.translation.set(transl);
        }
    }
});
