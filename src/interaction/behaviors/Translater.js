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

    /** Translater is a plane sensor that maps the translation output of that sensor
     *  directly to the given group transform's translation attribute.
     *
     *  @extends XML3D.tools.interaction.behaviors.PlaneSensor
     */
    XML3D.tools.interaction.behaviors.Translater = new XML3D.tools.Class(
            XML3D.tools.interaction.behaviors.PlaneSensor,
    {
        /** Constructor of Translater
         *
         *  @this {XML3D.tools.interaction.behaviors.Translater}
         *
         *  @param {string} id the id of this sensor
         *  @param {Array.<window.Element>} pickGrps the group this sensor should look for
         *  @param {XML3D.tools.Transformable} targetTransformable the movable this sensor will modify.
         *                 If not given, a Movable will be created from the first element of pickGrps
         *  @param {XML3DVec3|!window.Element} [planeOrient] the group or vector the sensor takes to decide where the plane
         *             normal should reside. If it's a group the local z=0 plane of the given group is taken.
         *             If a vector is given, the vector directly is taken. If not specified a plane
         *             parallel to the user's view is taken.
         *  @param {XML3D.tools.util.EventDispatcher=} eventDispatcher the object used to register events
         */
        initialize: function(id, pickGrps, targetTransformable, planeOrient, eventDispatcher)
        {
            if(!targetTransformable)
                targetTransformable = XML3D.tools.MotionFactory.createTransformable(pickGrps[0]);

            this.targetTransformable = targetTransformable;

            // take local matrix as initial offset
            // we manipulate the transform node of the group, so take the local one
            this._translationOffset = new window.XML3DVec3(this.targetTransformable.transform.translation);

            this.callSuper(id, pickGrps, planeOrient, undefined, eventDispatcher);

            this.addListener("dragstart", this.callback("_onTransPlaneDragStart"));
            this.addListener("translchanged", this.callback("_onTranslChanged"));
        },


        // ========================================================================
        // --- Private ---
        // ========================================================================

        /**
         *  @this {XML3D.tools.interaction.behaviors.Translater}
         *  @private
         *
         *  @param {XML3D.tools.interaction.behaviors.Translater} sensor
         */
        _onTransPlaneDragStart: function(sensor)
        {
            this._translationOffset.set(this.targetTransformable.getPosition());
        },

        /**
         *  @this {XML3D.tools.interaction.behaviors.Translater}
         *  @private
         *
         *  @param {XML3D.tools.interaction.behaviors.Translater} sensor
         */
        _onTranslChanged: function(sensor)
        {
            /** The translation of the PDSensor is in world-space, thus we will transform
             *  it to fit into the target node's local space. It does not need to be translated
             *  since that is what we care about. But the rotation should match the target node's
             *  space. Thus we will transform it by the parent node's world orientation.
             *  We do not take the target node's world orientation itself because the translation
             *  of the target node does not include it's rotation (an object is translate and afterwards
             *  it is rotated).
             *  We do the same for the scaling factor. If the scaling of the parent node is too high/low
             *  the translation will be too much/less.
             */
            var localTranslation = this.translation;
            if(this.targetTransformable.object.parentNode.getWorldMatrix !== undefined)
            {
                var parentWorldMatrix = this.targetTransformable.object.parentNode.getWorldMatrix();
                var worldToLocalRotation = parentWorldMatrix.rotation().inverse();
                var localToWorldScale = parentWorldMatrix.scaling();
                var worldToLocalScale =
                    new XML3DVec3(1/localToWorldScale.x, 1/localToWorldScale.y, 1/localToWorldScale.z);
                localTranslation = localTranslation.multiply(worldToLocalScale);
                localTranslation = worldToLocalRotation.rotateVec3(localTranslation);
            }

            var finalTransl = this._translationOffset.add(localTranslation);
            this.targetTransformable.setPosition(finalTransl);
        }
    });
}());
