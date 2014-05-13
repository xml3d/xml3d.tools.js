/*
Copyright (c) 2010-2014
              DFKI - German Research Center for Artificial Intelligence
              www.dfki.de

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
 so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
(function(){

    "use strict";

    XML3D.tools.namespace("XML3D.tools.interaction.behaviors");

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
     * @extends XML3D.tools.interaction.behaviors.PlaneSensor
     */
    XML3D.tools.interaction.behaviors.Scaler = new XML3D.tools.Class(
        XML3D.tools.interaction.behaviors.PlaneSensor,
    {
        /** Constructor of Scaler
         *
         *  @this {XML3D.tools.interaction.behaviors.Scaler}
         *
         *  @param {string} id the id of this sensor
         *  @param {Array.<Object>} pickGrps the groups this sensor will listen for events
         *  @param {XML3D.tools.Transformable} targetTransformable the group this sensor will modify. If not given,
         *             it's equal to the first element in pickGrp.
         *  @param {boolean} [uniformScale] whether to perform uniform scaling. Default: true.
         *  @param {XML3D.tools.util.EventDispatcher=} eventDispatcher the object used to register events
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
                targetTransformable = XML3D.tools.MotionFactory.createTransformable(pickGrps[0]);

            this.targetTransformable = targetTransformable;

            // listeners
            this.addListener("dragstart", this.callback("_onScalePlaneDragStart"));
            this.addListener("translchanged", this.callback("_onScalePlaneTranslChanged"));
        },

        // ========================================================================
        // --- Private ---
        // ========================================================================

        /**
         *  @this {XML3D.tools.interaction.behaviors.Scaler}
         *  @private
         *
         *  @param {XML3D.tools.interaction.behaviors.Scaler} sensor
         */
        _onScalePlaneDragStart: function(sensor)
        {
            this._startTarGrpScale = new window.XML3DVec3(this.targetTransformable.transform.scale);

            // adjust scaling factor with world bounding box of target node
            var tarSize = XML3D.tools.util.getWorldBBox(this.targetTransformable.object).size();

            this._scaleAdjFactor = tarSize.length();
        },

        /**
         *  @this {XML3D.tools.interaction.behaviors.Scaler}
         *  @private
         *
         *  @param {XML3D.tools.interaction.behaviors.Scaler} sensor
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
         *  @this {XML3D.tools.interaction.behaviors.Scaler}
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
