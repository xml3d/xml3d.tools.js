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

    XML3D.tools.namespace("XML3D.tools.interaction.widgets");

    /**
     *  A TranslateGizmo attaches three arrow-handles to the target and
     *  through that enables constraint translation either along a single
     *  axis or a plane.
     *
     *  @extends XML3D.tools.interaction.widgets.OverlayWidget
     *
     *  constructor options:
     *  o geometry.scale: a custom scaling of the widget geometry
     *  o disabledComponents: an array with the names of components that are to be disabled
     *      - values: "xaxis", "yaxis", "zaxis", "xyplane", "xzplane", "yzplane"
     */
    XML3D.tools.interaction.widgets.TranslateGizmo = new XML3D.tools.Class(
        XML3D.tools.interaction.widgets.OverlayWidget, {

        GeometryType: XML3D.tools.interaction.geometry.TranslateGizmo,
        disabledComponents: [],

        initialize: function(id, options)
        {
            if(options.disabledComponents)
            {
                this.disabledComponents = options.disabledComponents;
                if(!options.geometry)
                    options.geometry = {};
                options.geometry.disabledComponents = options.disabledComponents;
            }

            this.callSuper(id, options);
        },

        /**
         *  @this {XML3D.tools.interaction.widgets.TranslateGizmo}
         *  @override
         *  @protected
         */
        onCreateBehavior: function()
        {
            this._setup1DTranslaters();
            this._setup2DTranslaters();
        },

        /**
         *  @this {XML3D.tools.interaction.widgets.TranslateGizmo}
         *  @private
         */
        _setup1DTranslaters: function()
        {
            if(0 > this.disabledComponents.indexOf("xaxis"))
            {
                var xAxisConstraintFn = function(currentTranslation, newTranslation) {
                    newTranslation.y = currentTranslation.y;
                    newTranslation.z = currentTranslation.z;
                };

                this.behavior["xaxis"] = this._create1DTranslater(
                    "xaxis", "zaxis", xAxisConstraintFn);
            }

            if(0 > this.disabledComponents.indexOf("yaxis"))
            {
                var yAxisConstraintFn = function(currentTranslation, newTranslation) {
                    newTranslation.x = currentTranslation.x;
                    newTranslation.z = currentTranslation.z;
                };

                this.behavior["yaxis"] = this._create1DTranslater(
                    "yaxis", "zaxis", yAxisConstraintFn);
            }

            if(0 > this.disabledComponents.indexOf("zaxis"))
            {
                var zAxisConstraintFn = function(currentTranslation, newTranslation) {
                    newTranslation.x = currentTranslation.x;
                    newTranslation.y = currentTranslation.y;
                };

                this.behavior["zaxis"] = this._create1DTranslater(
                    "zaxis", "xaxis", zAxisConstraintFn);
            }
        },

        /**
         *  @this {XML3D.tools.interaction.widgets.TranslateGizmo}
         *  @private
         */
        _setup2DTranslaters: function()
        {
            if(0 > this.disabledComponents.indexOf("xyplane"))
            {
                this.behavior["xyplane"] = this._create2DTranslater("xyplane");
                this.behavior["xyplane-inverse"] = this._create2DTranslater("xyplane-inverse");
            }
            if(0 > this.disabledComponents.indexOf("yzplane"))
            {
                this.behavior["yzplane"] = this._create2DTranslater("yzplane");
                this.behavior["yzplane-inverse"] = this._create2DTranslater("yzplane-inverse");
            }
            if(0 > this.disabledComponents.indexOf("xzplane"))
            {
                this.behavior["xzplane"] = this._create2DTranslater("xzplane");
                this.behavior["xzplane-inverse"] = this._create2DTranslater("xzplane-inverse");
            }
        },

        /** Sets up a XML3D.tools.interaction.behaviors.Translater for 1D translation.
         *  An event dispatcher will be configured for mousedown event to allow
         *  only left button in combination if no ctrl key being pressed.
         *
         *  @this {XML3D.tools.interaction.widgets.TranslateGizmo}
         *  @private
         *
         *  @param {string} id should be the axisname, e.g. xaxis and correspond to the geometry name
         *  @param {string} planeOrientGrp the plane orientation of the translater
         *  @param {function(window.XML3DVec3,window.XML3DVec3)} constraintFn
         *  @return {XML3D.tools.interaction.behaviors.Translater}
         */
        _create1DTranslater: function(id, planeOrientGrpId, constraintFn)
        {
            var eventDispatcher = new XML3D.tools.util.EventDispatcher("mousedown", function(evt){
                return (evt.button === XML3D.tools.MOUSEBUTTON_LEFT);
            });

            var constraint = this._createTranslationConstraint(constraintFn);
            var behaviorTarget = this.createBehaviorTarget(constraint);

            var pickGrps = [this.geometry.getGeo(id)];

            var translater = new XML3D.tools.interaction.behaviors.Translater(
                this.globalID(id), pickGrps, behaviorTarget,
                this.geometry.getGeo(planeOrientGrpId), eventDispatcher);

            translater.addListener("dragstart", function() {
                this.geometry.addHighlight(id);
            }.bind(this));
            translater.addListener("dragend", function() {
                this.geometry.removeHighlight(id);
            }.bind(this));

            return translater;
        },

        /** Sets up a XML3D.tools.interaction.behaviors.Translater for 2D translation.
         *
         *  @this {XML3D.tools.interaction.widgets.TranslateGizmo}
         *  @private
         *
         *  @param {string} id
         *  @return {XML3D.tools.interaction.behaviors.Translater}
         */
        _create2DTranslater: function(id)
        {
            var eventDispatcher = new XML3D.tools.util.EventDispatcher("mousedown", function(evt) {
                return (evt.button === XML3D.tools.MOUSEBUTTON_LEFT);
            });

            var constraint = this._createTranslationConstraint(function(){});
            var behaviorTarget = this.createBehaviorTarget(constraint);

            var pickGrps = [this.geometry.getGeo(id)];

            var translater = new XML3D.tools.interaction.behaviors.Translater(
                this.globalID(id), pickGrps, behaviorTarget,
                pickGrps[0], eventDispatcher);

            translater.addListener("dragstart", function() {
                this.geometry.addHighlight(id);
            }.bind(this));
            translater.addListener("dragend", function() {
                this.geometry.removeHighlight(id);
            }.bind(this));

            return translater;
        },

        /** Creates a translation constraint, where the given constraint function is applied
         *  and afterwards updates the real target's translation with the new translation.
         *
         *  @this {XML3D.tools.interaction.widgets.TranslateGizmo}
         *  @private
         *
         *  @param {function(window.XML3DVec3,window.XML3DVec3)} constrainTranslationFunction
         *  @return {XML3D.tools.Constraint}
         *
         *  The constraint function is given the current translation and new translation
         *  and should update the new translation. The given translation values are
         *  in local space of the target node.
         */
        _createTranslationConstraint: function(constrainTranslationFunction) {
            function constrainTranslation(newTranslation, opts)
            {
                if(!opts.transformable)
                    throw new Error("Constraint: no transformable given.");

                /** We want the translation to be in local space of the target node, which
                 *  includes the target node's own rotation. This rotation is not yet applied
                 *  to the translation value, so we transform it here.
                 */
                // apply target node's rotation
                var currentTranslation = opts.transformable.getPosition();
                var targetRotation = opts.transformable.getOrientation();
                var invTargetRotation = targetRotation.inverse();

                // we take the inverse rotation because we want to transform from the target's
                // "world" space to the target's local space (incl. rotation)
                var localCurTranslation = invTargetRotation.rotateVec3(currentTranslation);
                var localNewTranslation = invTargetRotation.rotateVec3(newTranslation);

                // constrain it
                constrainTranslationFunction(localCurTranslation, localNewTranslation);

                // invert the rotation again
                var targetNewTranslation = targetRotation.rotateVec3(localNewTranslation);
                newTranslation.set(targetNewTranslation);

                return true;
            };

            return this.createReflectingConstraint({constrainTranslation: constrainTranslation});
        }
    });

}());
