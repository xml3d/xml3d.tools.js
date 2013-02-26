
XMOT.namespace("XMOT.interaction.behaviors");

/** The Rotater takes the translation given by the PlaneSensor and interprets
 *  the individual components as angle in radians along the corresponding axis.
 *
 *  @extends XMOT.interaction.behaviors.PlaneSensor
 */
XMOT.interaction.behaviors.Rotater = new XMOT.Class(
    XMOT.interaction.behaviors.PlaneSensor,
{
    /** Constructor of Rotater
     *
     *  @this {XMOT.interaction.behaviors.Rotater}
     *
     *  @param {string} id the id of this sensor
     *  @param {Array.<Object>} pickGrps the group this sensor will listen for events
     *  @param {XMOT.Transformable} targetTransformable the group this sensor will modify.
     *                 If not given, it is equal to the first element in pickGrp.
     *  @param {number} [rotSpeed] rotation speed, default is 1
     *  @param {XML3DVec3|Object} [planeOrient] modifies the orientation of the underlying
     *                  XML3D.interaction.behaviors.PlaneSensor.
     *                  See XML3D.interaction.behaviors.PlaneSensor for further information.
     *
     *  @throws "target no transform" if the target group doesn't have a transform
     *           attribute
     */
    initialize: function(id, pickGrps, targetTransformable, rotSpeed, planeOrient)
    {
        // --- setup pdsensor ---

        this.callSuper(id, pickGrps, planeOrient);

        // --- setup this sensor ---
        if(!targetTransformable)
            targetTransformable = XMOT.ClientMotionFactory.createTransformable(pickGrps[0]);

        this.targetTransformable = targetTransformable;

        this._rotationSpeed = 1;
        if(rotSpeed)
            this._rotationSpeed = rotSpeed;

        this._initialRotation = new XML3DRotation(this.targetTransformable.getOrientation());
        this._rotationOffset = new XML3DRotation(this._initialRotation);

        // listeners
        this.addListener("dragstart", this.callback("_onRotaterDragStart"));
        this.addListener("translchanged", this.callback("_onRotaterTranslChanged"));
    },

    axisRestriction: function(axis)
    {
        if(XMOT.util.isDefined(axis))
        {
            if(axis === "x" || axis === "y")
            {
                this.setPlaneOrientation(new XML3DVec3(0,0,1));
            }
            else if(axis === "z")
            {
                this.setPlaneOrientation(new XML3DVec3(1,0,0));
            }
            else
            {
                throw new Error("XMOT.interaction.behaviors.Rotater: unknown axis restriction: " + axis);
            }

            this._axisRestriction = axis;
        }

        return this._axisRestriction;
    },

    clearAxisRestriction: function()
    {
        this.setPlaneOrientation(new XML3DVec3(0,0,1));
        this._axisRestriction = undefined;
    },

    /** reset the rotation that gets remembered between drags
     *
     *  @this {XMOT.interaction.behaviors.Rotater}
     */
    resetRotation: function()
    {
        this.targetTransformable.setOrientation(this._initialRotation);
    },

    /** Set or retrieve the rotation speed
     *
     *  @this {XMOT.interaction.behaviors.Rotater}
     *
     *  @param {number} [speed] default: do not set the speed.
     *  @return {number} the current speed
     */
    rotationSpeed: function(speed)
    {
        if(speed)
            this.trackBall.rotationSpeed = speed;

        return this.trackBall.rotationSpeed;
    },

    // ========================================================================
    // --- Private ---
    // ========================================================================

    /**
     *  @private
     *  @this {XMOT.interaction.behaviors.Rotater}
     *
     *  @param {XMOT.interaction.behaviors.Rotater} sensor
     */
    _onRotaterDragStart: function(sensor)
    {
        // update the offset with perhaps changed rotation
        this._rotationOffset = new window.XML3DRotation(this.targetTransformable.transform.rotation);
    },

    /**
     *  @this {XMOT.interaction.behaviors.Rotater}
     *  @private
     *
     *  @param {XMOT.interaction.behaviors.Rotater} sensor
     */
    _onRotaterTranslChanged: function(sensor)
    {
        // calculate angle along the axes
        /** in the z=1 plane x-translation should map to y-axis rotation
         *  and y-translation to x-axis rotation
         */
        var angleX = sensor.translation.y * this._rotationSpeed;
        var angleY = sensor.translation.x * this._rotationSpeed;
        var angleZ = sensor.translation.z * this._rotationSpeed;

        // apply axis restrictions
        var rotation = new XML3DRotation();
        if(this._axisRestriction === undefined)
        {
            var rotX = new XML3DRotation(new XML3DVec3(1,0,0), angleX);
            var rotY = new XML3DRotation(new XML3DVec3(0,1,0), angleY);
            var rotZ = new XML3DRotation(new XML3DVec3(0,0,1), angleZ);
            rotation.set(rotX.multiply(rotY.multiply(rotZ)));
        }
        else
        {
            var angleSum = angleX + angleY + angleZ;
            var axis = null;

            if(this._axisRestriction === "x")
            {
                axis = new XML3DVec3(1,0,0);
            }
            else if(this._axisRestriction === "y")
            {
                axis = new XML3DVec3(0,1,0);
            }
            else // === "z"
            {
                axis = new XML3DVec3(0,0,1);
            }

            rotation.setAxisAngle(axis, angleSum);
        }

        // apply rotation offset
        rotation.set(this._rotationOffset.multiply(rotation));

        // and update target orientation
        this.targetTransformable.setOrientation(rotation);
    }
});
