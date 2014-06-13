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
    XML3D.tools.interaction.geometry.TranslateGizmo = new XML3D.tools.Class(
        XML3D.tools.interaction.geometry.ViewedConstantSizeGeometry, {

        disabledComponents: [],
        highlightColorMultiplier: 1.2,

        /**
         *  @this {XML3D.tools.interaction.geometry.TranslateGizmo}
         *  @param {XML3D.tools.interaction.widgets.Widget} widget
         *  @param {Object=} options
         *
         *  options:
         *      o scale: a custom scale that should be applied to the geometry
         *      o disabledComponents: an array with the names of components that are to be disabled
         *          - values: "xaxis", "yaxis", "zaxis", "xyplane", "xzplane", "yzplane"
         */
        initialize: function(widget, options)
        {
            if(!options)
                options = {};
            options = XML3D.tools.extend({}, options);

            var customScale = new XML3DVec3(0.08, 0.08, 0.08);
            if(!options.scale)
                options.scale = customScale;
            else
                options.scale = options.scale.multiply(customScale);
            if(options.disabledComponents)
                this.disabledComponents = options.disabledComponents;

            this.callSuper(widget, options);
        },

        /**
         *  @this {XML3D.tools.interaction.geometry.TranslateGizmo}
         */
        onCreateDefsElements: function()
        {
            this.callSuper();

            if(0 > this.disabledComponents.indexOf("xaxis"))
                this._createAxisArrowDefs("xaxis", "0 1 0 1.57", "0 0.8 0");
            if(0 > this.disabledComponents.indexOf("yaxis"))
                this._createAxisArrowDefs("yaxis", "1 0 0 -1.57", "0.8 0 0");
            if(0 > this.disabledComponents.indexOf("zaxis"))
                this._createAxisArrowDefs("zaxis", "0 0 1 0", "0 0 0.8");
            if(0 > this.disabledComponents.indexOf("yzplane")) {
                var color = "0 0.8 0";
                var translation = "0 1 1";
                this._createAxisPlaneDefs("yzplane", color, "0 1 0 -1.57", translation);
                this._createAxisPlaneDefs("yzplane-inverse", color, "0 1 0 1.57", translation);
            }
            if(0 > this.disabledComponents.indexOf("xzplane")) {
                var color = "0.8 0 0";
                var translation = "1 0 1";
                this._createAxisPlaneDefs("xzplane", color, "1 0 0 1.57", translation);
                this._createAxisPlaneDefs("xzplane-inverse", color, "1 0 0 -1.57", translation);
            }
            if(0 > this.disabledComponents.indexOf("xyplane")) {
                var color = "0 0 0.8";
                var translation = "1 1 0";
                this._createAxisPlaneDefs("xyplane", color, "0 1 0 0", translation);
                this._createAxisPlaneDefs("xyplane-inverse", color, "0 1 0 3.14", translation);
            }
        },

        /**
         *  @this {XML3D.tools.interaction.geometry.TranslateGizmo}
         */
        onCreateGraph: function()
        {
            this.callSuper();

            if(0 > this.disabledComponents.indexOf("xaxis"))
                this._createAxisArrowGroup("xaxis");
            if(0 > this.disabledComponents.indexOf("yaxis"))
                this._createAxisArrowGroup("yaxis");
            if(0 > this.disabledComponents.indexOf("zaxis"))
                this._createAxisArrowGroup("zaxis");
            if(0 > this.disabledComponents.indexOf("yzplane")) {
                this._createAxisPlaneGroup("yzplane");
                this._createAxisPlaneGroup("yzplane-inverse");
            }
            if(0 > this.disabledComponents.indexOf("xzplane")) {
                this._createAxisPlaneGroup("xzplane");
                this._createAxisPlaneGroup("xzplane-inverse");
            }
            if(0 > this.disabledComponents.indexOf("xyplane")) {
                this._createAxisPlaneGroup("xyplane");
                this._createAxisPlaneGroup("xyplane-inverse");
            }
        },

        _createAxisArrowDefs: function(id, rotation, color)
        {
            this.geo.addTransforms("t_" + id, {
                rotation: rotation,
                scale: "1 1 2"
            });

            this.geo.addShaders("s_" + id, {
                shaderType: "urn:xml3d:shader:toolsmatte",
                diffuseColor: color
            });
        },

        _createAxisArrowGroup: function(id)
        {
            var group = XML3D.tools.creation.element("group", {
                transform: "#" + this.geo.globalID("t_" + id),
                shader: "#" + this.geo.globalID("s_" + id),
                children: [
                    XML3D.tools.creation.arrow(this.geo.xml3d)
                ]
            });

            this.setGeo(id, group);
            this.geo.addToGraphRoot(group);
        },

        _createAxisPlaneDefs: function(id, color, rotation, translation)
        {
            var scaleVec = new XML3DVec3(0.3, 0.3, 0.3);
            var translVec = new XML3DVec3();
            translVec.setVec3Value(translation);
            translVec = translVec.multiply(scaleVec);

            this.geo.addTransforms("t_" + id, {
                rotation: rotation,
                scale: scaleVec.str(),
                translation: translVec.str()
            });

            this.geo.addShaders("s_" + id, {
                shaderType: "urn:xml3d:shader:toolsmatte",
                diffuseColor: color,
                transparency: "0.5"
            });
        },

        _createAxisPlaneGroup: function(id)
        {
            var group = XML3D.tools.creation.element("group", {
                transform: "#" + this.geo.globalID("t_" + id),
                shader: "#" + this.geo.globalID("s_" + id),
                children: [
                    XML3D.tools.creation.rectangle(this.geo.xml3d)
                ]
            });

            this.setGeo(id, group);
            this.geo.addToGraphRoot(group);
        }
    });
}());
