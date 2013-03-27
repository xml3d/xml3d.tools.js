
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
     *  @param {window.XML3DVec3|!Object=} planeOrient the group or vector the sensor takes to decide where the plane
     * 			normal should reside. If it's a group the local z=0 plane of the given group is taken.
     * 			If a vector is given, the vector directly is taken. If not specified a plane
     * 			parallel to the user's view is taken.
     *  @param {Object=} translationConstraint constraint that is applied to the final translation output
     *  @param {XMOT.util.EventDispatcher=} eventDispatcher the object used to register events
     */
    initialize: function(id, grps, planeOrient, translationConstraint, eventDispatcher)
    {
        this.callSuper(id, grps, eventDispatcher);

        // the translation in the plane during a drag operation
        this.translation = new window.XML3DVec3(0,0,0);

        this._plane = new XMOT.util.Plane(this.xml3d);
        this._plane.setOrientation(planeOrient);

        /** The translation constraint for constraining the final output value */
        if(translationConstraint !== undefined && translationConstraint !== null)
            this._translationConstraint = translationConstraint;
        else
            this._translationConstraint = new XMOT.BoxedTranslationConstraint();

        // setup listeners
        this.addListenerTypes("translchanged");

        this.addListener("dragstart", this.callback("_onPlaneDragStart"));
        this.addListener("drag", this.callback("_onPlaneDrag"));
        this.addListener("dragend", this.callback("_onPlaneDragEnd"));
    },

    setPlaneOrientation: function(newPlaneOrientation)
    {
        this._plane.setOrientation(newPlaneOrientation);
    },

    /** retrieve the current translation value in the canonical
     *  direction (0,0,1) no matter what the current normal is.
     *
     *  In this method no constraints are applied!
     *
     *  @this {XMOT.interaction.behaviors.PlaneSensor}
     *
     *  @return {XML3DVec3}
     */
    getCanonicalTranslation: function()
    {
        var rotToLocal = new XML3DRotation();
        rotToLocal.setRotation(this._plane.normal(), new XML3DVec3(0,0,1));
        var tp = rotToLocal.rotateVec3(this.translation);

        return tp;
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
        this._plane.origin(sensor.curHitPoint);
        this._planeHitPoint = this._plane.origin();
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
            this._plane.origin(), this._plane.normal(), intersectHitP))
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
        var transl = this._planeHitPoint.subtract(this._plane.origin());

        if(this._translationConstraint.constrainTranslation(transl))
        {
            this.translation.set(transl);
        }
    }
});
