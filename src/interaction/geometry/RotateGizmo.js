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

    XML3D.tools.namespace("XML3D.tools.interaction.geometry");

    /** The tree of this geometry looks like this:
     *  o graph root
     *      o widget container
     *          o xaxis
     *          o yaxis
     *          o zaxis
     *
     *  The axes can be retrieved by their name using getGeo().
     */
    XML3D.tools.interaction.geometry.RotateGizmo = new XML3D.tools.Class(
        XML3D.tools.interaction.geometry.ViewedConstantSizeGeometry, {

        bandWidth: 1,

        /**
         *  @this {XML3D.tools.interaction.geometry.RotateGizmo}
         *  @param {XML3D.tools.interaction.widgets.Widget} widget
         *  @param {Object=} options
         *
         *  options:
         *      o scale: a custom scale that should be applied to the geometry
         *      o bandWidth: the width of a band (default: 1)
         */
        initialize: function(widget, options)
        {
            if(!options)
                options = {};
            options = XML3D.tools.extend({}, options);

            var customScale = new XML3DVec3(0.05, 0.05, 0.05);
            if(!options.scale)
                options.scale = customScale;
            else
                options.scale = options.scale.multiply(customScale);
            if(options.bandWidth)
                this.bandWidth = options.bandWidth;


            this.callSuper(widget, options);
        },

        /**
         *  @this {XML3D.tools.interaction.geometry.RotateGizmo}
         *  @override
         *  @protected
         */
        onCreateDefsElements: function()
        {
            this.callSuper();

            this._createAxisDefsElements("xaxis", "0 0.8 0", "0 1 0 -1.57", 0);
            this._createAxisDefsElements("yaxis", "0.8 0 0", "1 0 0 1.57", 0.01);
            this._createAxisDefsElements("zaxis", "0 0 0.8", "0 0 1 0", 0.02);
        },

        /**
         *  @this {XML3D.tools.interaction.geometry.RotateGizmo}
         *  @override
         *  @protected
         */
        onCreateGraph: function()
        {
            this.callSuper();

            this.setGeo("xaxis", this._createAxisGroup("xaxis"));
            this.setGeo("yaxis", this._createAxisGroup("yaxis"));
            this.setGeo("zaxis", this._createAxisGroup("zaxis"));

            this.geo.addToGraphRoot([
                this.getGeo("xaxis"),
                this.getGeo("yaxis"),
                this.getGeo("zaxis")
            ]);
        },

        /**
         *  @this {XML3D.tools.interaction.geometry.RotateGizmo}
         *  @private
         *
         *  @param {string} id
         *  @param {string} color
         *  @param {string=} rotation
         */
        _createAxisDefsElements: function(id, color, rotation, sizeOffset)
        {
            var scaleVec = new XML3DVec3(1, 1, 0.1*this.bandWidth);
            // when increasing the bandwidth the size and thus offset of the band to the lower ones
            // should increase, too, else we get an overlap. Thus, we scale the size offset by the
            // band width
            scaleVec = scaleVec.scale(1 + sizeOffset*this.bandWidth);

            this.geo.addTransforms("t_" + id, {
                scale: scaleVec.str(),
                rotation: rotation
            });

            this.geo.addShaders("s_" + id, {
                shaderType: "urn:xml3d:shader:tools-eyelight",
                diffuseColor: color,
                ambientIntensity: "0.3",
                transparency: "0.5"
            });
        },

        /**
         *  @this {XML3D.tools.interaction.geometry.RotateGizmo}
         *  @private
         *
         *  @param {string} id
         */
        _createAxisGroup: function(id)
        {
            return XML3D.tools.creation.element("group", {
                transform: "#" + this.geo.globalID("t_" + id),
                shader: "#" + this.geo.globalID("s_" + id),
                children: [
                    XML3D.tools.creation.cylinder(this.geo.xml3d)
                ]
            });
        }
    });
}());
