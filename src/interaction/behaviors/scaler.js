(function(){

    "use strict";

    XMOT.namespace("XMOT.interaction.behaviors");

    /** Scaler maps the translation on a plane into a uniform scaling in all 3 dimensions.
     *
     * Scaling is performed as follows. We remember the current scaling of the target at the
     * beginning of a drag operation. That scaling is multiplied with a factor to lead the new
     * scaling.
     * The factor is computed in _calcUniformScaleFactor(). It is based on the length of the
     * canonical translation vector on the plane.
     * Canonical translation is used for easy computation. It will always lie in the in the plane
     * with normal (0, 0, 1). With that length we have an initial estimate.
     * We want to make the object smaller, too. So we do the following. If both components of
     * the canonical translation are negative, the factor will become negative. The same holds,
     * if only one component is negative, but the length is below a small threshold.
     *
     * To make the scaling more intuitive, at last the factor is adjusted with the size of the
     * world bounding box of the whole widget. The bigger the widget, the less fast the factor
     * increases. If we don't do this, the scaling of the object will grow faster than the mouse
     * position is moving and, thus, flips with the scaling factor can happen.
     *
     * @extends XMOT.interaction.behaviors.PlaneSensor
     */
    XMOT.interaction.behaviors.Scaler = new XMOT.Class(
        XMOT.interaction.behaviors.PlaneSensor,
    {
        /** Constructor of Scaler
         *
         *  @this {XMOT.interaction.behaviors.Scaler}
         *
         *  @param {string} id the id of this sensor
         *  @param {Array.<Object>} pickGrps the groups this sensor will listen for events
         *  @param {XMOT.Transformable} targetTransformable the group this sensor will modify. If not given,
         *             it's equal to the first element in pickGrp.
         *  @param {boolean} [uniformScale] whether to perform uniform scaling. Default: true.
         *  @param {XMOT.util.EventDispatcher=} eventDispatcher the object used to register events
         *
         *  @throws "target no transform"/"pick no transform" - targetGrp/pickGrp doesn't have transform attribute
         */
        initialize: function(id, pickGrps, targetTransformable, uniformScale, eventDispatcher)
        {
            // parent class
            this.callSuper(id, pickGrps, undefined, undefined, eventDispatcher);

            this.uniformScale = true;
            if(uniformScale)
                this.uniformScale = uniformScale;

            if(!targetTransformable)
                targetTransformable = XMOT.ClientMotionFactory.createTransformable(pickGrps[0]);

            this.targetTransformable = targetTransformable;

            // listeners
            this.addListener("dragstart", this.callback("_onScalePlaneDragStart"));
            this.addListener("translchanged", this.callback("_onScalePlaneTranslChanged"));
        },

        // ========================================================================
        // --- Private ---
        // ========================================================================

        /**
         *  @this {XMOT.interaction.behaviors.Scaler}
         *  @private
         *
         *  @param {XMOT.interaction.behaviors.Scaler} sensor
         */
        _onScalePlaneDragStart: function(sensor)
        {
            this._startTarGrpScale = new window.XML3DVec3(this.targetTransformable.transform.scale);

            // adjust scaling factor with world bounding box of target node
            var tarSize = XMOT.util.getWorldBBox(this.targetTransformable.object).size();

            this._scaleAdjFactor = tarSize.length();
        },

        /**
         *  @this {XMOT.interaction.behaviors.Scaler}
         *  @private
         *
         *  @param {XMOT.interaction.behaviors.Scaler} sensor
         */
        _onScalePlaneTranslChanged: function(sensor)
        {
            var factor = new window.XML3DVec3();

            if(this.uniformScale)
            {
                var fac = this._calcUniformScaleFactor();
                factor.x = factor.y = factor.z = fac;
            }
            else
                factor = sensor.translation;

            var delta = this._startTarGrpScale.multiply(factor);
            var newScale = this._startTarGrpScale.add(delta);

            this.targetTransformable.setScale(newScale);
        },

        /** Calculates the scaling factor for uniform scaling.
         *  We take the length of the canonical position on the plane. Also
         *  we have to decide when to apply negative scaling. This is done
         *  if either both position attributes, x and y, are negative or
         *  the length is below a certain threshold and one of x and y is negative.
         *
         *  @this {XMOT.interaction.behaviors.Scaler}
         *  @private
         *
         *  @return {number} the scaling factor
         */
        _calcUniformScaleFactor: function()
        {
            var canTrans = this.getCanonicalTranslation();

            var fac = Math.sqrt(canTrans.x*canTrans.x + canTrans.y*canTrans.y);

            if((canTrans.x < 0 && canTrans.y < 0) // both negative
            || ((canTrans.x < 0 || canTrans.y < 0) && fac < XML3D.EPSILON)) // one negative and length below threshold
            {
                fac = -fac;
            }

            fac /= this._scaleAdjFactor;

            return fac;
        }
    });
}());
