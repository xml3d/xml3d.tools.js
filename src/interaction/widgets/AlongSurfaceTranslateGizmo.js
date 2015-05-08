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

    /** Attaches a XML3D.tools.interaction.behaviors.AlongSurfaceTranslater to the given
     *  target. You can disable the constraint when dragging by pressing a key (Ctrl by default).
     *
     *  @extends XML3D.tools.interaction.widgets.Widget
     */
    XML3D.tools.interaction.widgets.AlongSurfaceTranslateGizmo = new XML3D.tools.Class(
        XML3D.tools.interaction.widgets.Widget, {

            /**
             *  @this {XML3D.tools.interaction.widgets.AlongSurfaceTranslateGizmo}
             *  @override
             *  @public
             *
             *  options:
             *      o keyDisableConstraint: the key with which to disable the constraint (Ctrl by default)
             */
            initialize: function(id, target, options)
            {
                var options = options || {};
                this._keyDisableConstraint = XML3D.tools.KEY_CTRL;
                if(options.keyDisableConstraint !== undefined)
                    this._keyDisableConstraint = options.keyDisableConstraint;

                this.callSuper(id, target, options);
            },

            /**
             *  @this {XML3D.tools.interaction.widgets.AlongSurfaceTranslateGizmo}
             *  @override
             *  @protected
             */
            onCreateBehavior: function()
            {
                this.behavior["main"] = new XML3D.tools.interaction.behaviors.AlongSurfaceTranslater(
                    this.globalID("main"), [this.target.object], this.target);
                this.behavior["main"].addListener("dragstart", this._onDragStart.bind(this));
                this.behavior["main"].addListener("dragend", this._onDragEnd.bind(this));
            },

            /**
             *  @this {XML3D.tools.interaction.widgets.AlongSurfaceTranslateGizmo}
             *  @private
             */
            _onDragStart: function()
            {
                if(XML3D.tools.KeyboardState.isPressed(this._keyDisableConstraint))
                    this.behavior["main"].disableConstraint();
            },

            /**
             *  @this {XML3D.tools.interaction.widgets.AlongSurfaceTranslateGizmo}
             *  @private
             */
            _onDragEnd: function()
            {
                this.behavior["main"].enableConstraint();
            }
        });
}());
