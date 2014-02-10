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
             */
            var localTranslation = this.translation;
            if(this.targetTransformable.object.parentNode.getWorldMatrix !== undefined)
            {
                var localToWorldRotation = this.targetTransformable.object.parentNode.getWorldMatrix().rotation();
                var worldToLocalRotation = localToWorldRotation.inverse();
                localTranslation = worldToLocalRotation.rotateVec3(this.translation);
            }

            var finalTransl = this._translationOffset.add(localTranslation);
            this.targetTransformable.setPosition(finalTransl);
        }
    });
}());
