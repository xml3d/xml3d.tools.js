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
     *  This gizmo adds 3 small rectangles to the target object with which the
     *  rotation of the target can be controlled, constrained to single axes the
     *  rectangle present.
     *
     * @extends XML3D.tools.interaction.widgets.OverlayWidget
     */
    XML3D.tools.interaction.widgets.RotateGizmo = new XML3D.tools.Class(
        XML3D.tools.interaction.widgets.OverlayWidget, {

        GeometryType: XML3D.tools.interaction.geometry.RotateGizmo,

        /**
         *  @this {XML3D.tools.interaction.widgets.RotateGizmo}
         *
         *  options:
         *  o geometry.scale: a custom scaling of the widget geometry
         *  o geometry.bandWidth: the width of a band (default: 1)
         */
        initialize: function(id, options)
        {
            this.callSuper(id, options);

            if(options.rotationSpeed)
                this._rotationSpeed = options.rotationSpeed;
        },

        /**
         *  @this {XML3D.tools.interaction.widgets.RotateGizmo}
         *  @override
         *  @protected
         */
        onCreateBehavior: function()
        {
            this.behavior["xaxis"] = this._createRotater("x");
            this.behavior["yaxis"] = this._createRotater("y");
            this.behavior["zaxis"] = this._createRotater("z");
        },

        /**
         *  @this {XML3D.tools.interaction.widgets.RotateGizmo}
         *  @private
         *
         *  @param {string} axis. "x", "y" or "z"
         */
        _createRotater: function(axis)
        {
            var geoId = axis + "axis";

            var eventDispatcher = new XML3D.tools.util.EventDispatcher("mousedown", function(evt) {
                return (evt.button === XML3D.tools.MOUSEBUTTON_LEFT);
            });

            var constraint = this.createReflectingConstraint();
            var behaviorTarget = this.createBehaviorTarget(constraint);

            var pickGrps = [this.geometry.getGeo(geoId)];

            var rot = new XML3D.tools.interaction.behaviors.Rotater(
                this.globalID(geoId), pickGrps, behaviorTarget, this._rotationSpeed, eventDispatcher);
            rot.axisRestriction(axis);

            rot.addListener("dragstart", function() {
                this.geometry.addHighlight(geoId);
            }.bind(this));
            rot.addListener("dragend", function() {
                this.geometry.removeHighlight(geoId);
            }.bind(this));

            return rot;
        }
    });
}());
