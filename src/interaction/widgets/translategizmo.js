(function(){

    "use strict";

    XMOT.namespace("XMOT.interaction.widgets");

    /**
     *  A TranslateGizmo attaches three arrow-handles to the target and
     *  through that enables constraint translation either along a single
     *  axis or a plane.
     *
     *  @extends XMOT.interaction.widgets.OverlayWidget
     *
     *  constructor options:
     *  o geometry.scale: a custom scaling of the widget geometry
     */
    XMOT.interaction.widgets.TranslateGizmo = new XMOT.Class(
        XMOT.interaction.widgets.OverlayWidget, {

        GeometryType: XMOT.interaction.geometry.TranslateGizmo,

        /**
         *  @this {XMOT.interaction.widgets.TranslateGizmo}
         *  @override
         *  @protected
         */
        onCreateBehavior: function()
        {
            this._setup1DTranslaters();
            this._setup2DTranslaters();
        },

        /**
         *  @this {XMOT.interaction.widgets.TranslateGizmo}
         *  @private
         */
        _setup1DTranslaters: function()
        {
            var xAxisConstraintFn = function(currentTranslation, newTranslation) {

                newTranslation.y = currentTranslation.y;
                newTranslation.z = currentTranslation.z;
            };

            var yAxisConstraintFn = function(currentTranslation, newTranslation) {

                newTranslation.x = currentTranslation.x;
                newTranslation.z = currentTranslation.z;
            };

            var zAxisConstraintFn = function(currentTranslation, newTranslation) {

                newTranslation.x = currentTranslation.x;
                newTranslation.y = currentTranslation.y;
            };

            this.behavior["xaxis"] = this._create1DTranslater(
                "xaxis", "zaxis", xAxisConstraintFn);
            this.behavior["yaxis"] = this._create1DTranslater(
                "yaxis", "zaxis", yAxisConstraintFn);
            this.behavior["zaxis"] = this._create1DTranslater(
                "zaxis", "xaxis", zAxisConstraintFn);
        },

        /**
         *  @this {XMOT.interaction.widgets.TranslateGizmo}
         *  @private
         */
        _setup2DTranslaters: function()
        {
            this.behavior["xyaxis"] = this._create2DTranslater(
                "xyaxis", "zaxis");
            this.behavior["zyaxis"] = this._create2DTranslater(
                "zyaxis", "xaxis");
            this.behavior["xzaxis"] = this._create2DTranslater(
                "xzaxis", "yaxis");
        },

        /** Sets up a XMOT.interaction.behaviors.Translater for 1D translation.
         *  An event dispatcher will be configured for mousedown event to allow
         *  only left button in combination if no ctrl key being pressed.
         *
         *  @this {XMOT.interaction.widgets.TranslateGizmo}
         *  @private
         *
         *  @param {string} id should be the axisname, e.g. xaxis and correspond to the geometry name
         *  @param {string} planeOrientGrp the plane orientation of the translater
         *  @param {function(window.XML3DVec3,window.XML3DVec3)} constraintFn
         *  @return {XMOT.interaction.behaviors.Translater}
         */
        _create1DTranslater: function(id, planeOrientGrpId, constraintFn)
        {
            var eventDispatcher = new XMOT.util.EventDispatcher("mousedown", function(evt){
                return (!evt.ctrlKey && evt.button === XMOT.MOUSEBUTTON_LEFT);
            });

            var constraint = this._createTranslationConstraint(constraintFn);
            var behaviorTarget = this.createBehaviorTarget(constraint);

            var pickGrps = [this.geometry.getGeo(id)];

            return new XMOT.interaction.behaviors.Translater(
                this.globalID(id), pickGrps, behaviorTarget,
                this.geometry.getGeo(planeOrientGrpId), eventDispatcher);
        },

        /** Sets up a XMOT.interaction.behaviors.Translater for 2D translation.
         *  An event dispatcher will be configured for mousedown event to allow
         *  only left button in combination if the ctrl key being pressed.
         *
         *  @this {XMOT.interaction.widgets.TranslateGizmo}
         *  @private
         *
         *  @param {string} id
         *  @param {string} pickGrpId id of the geometry item for picking
         *  @param {XML3DVec3|!window.Element=} planeOrient the plane orientation of the translater
         *  @return {XMOT.interaction.behaviors.Translater}
         */
        _create2DTranslater: function(id, pickGrpId)
        {
            var eventDispatcher = new XMOT.util.EventDispatcher("mousedown", function(evt) {
                return (evt.ctrlKey && evt.button === XMOT.MOUSEBUTTON_LEFT);
            });

            var constraint = this._createTranslationConstraint(function(){});
            var behaviorTarget = this.createBehaviorTarget(constraint);

            var pickGrps = [this.geometry.getGeo(pickGrpId)];

            return new XMOT.interaction.behaviors.Translater(
                this.globalID(id), pickGrps, behaviorTarget,
                pickGrps[0], eventDispatcher);
        },

        /** Creates a translation constraint, where the given constraint function is applied
         *  and afterwards updates the real target's translation with the new translation.
         *
         *  @this {XMOT.interaction.widgets.TranslateGizmo}
         *  @private
         *
         *  @param {function(window.XML3DVec3,window.XML3DVec3)} constrainTranslationFunction
         *  @return {XMOT.Constraint}
         *
         *  The constraint function is given the current translation and new translation
         *  and should update the new translation. The given translation values are
         *  in local space of the target node. This is supposed to ease the constraining,
         *  which it does.
         */
        _createTranslationConstraint: function(constrainTranslationFunction) {
            function constrainTranslation(newTranslation, opts)
            {
                if(!opts.transformable)
                    throw new Error("Constraint: no transformable given.");

                var worldMatrix = opts.transformable.object.getWorldMatrix();
                var invWorldMatrix = worldMatrix.inverse();

                var currentTranslation = opts.transformable.getPosition();

                var localCurrentTransl = invWorldMatrix.multiplyPt(currentTranslation);
                var localNewTransl = invWorldMatrix.multiplyPt(newTranslation);

                constrainTranslationFunction(localCurrentTransl, localNewTransl);

                newTranslation.set(worldMatrix.multiplyPt(localNewTransl));

                return true;
            };

            return this.createReflectingConstraint({constrainTranslation: constrainTranslation});
        }
    });

}());
