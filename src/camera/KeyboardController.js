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

    /** This class encapsulates the setup of keyboard interaction for the use of camera controllers.
     *  It registers callbacks to the appropriate elements and invokes methods in which users of
     *  this class can perform actions.
     *
     *  Usage:
     *  o instantiate or inherit from this class
     *  o override onKeyDown() and/or onKeyUp() to handle keyboard events
     *  o call attach() at some point to enable the controller
     *
     *  @constructor
     */
    XML3D.tools.KeyboardController = new XML3D.tools.Class(XML3D.tools.util.Attachable, {

        /**
         *  @this {XML3D.tools.KeyboardController}
         *  @param {Element|Transformable} targetViewGroup
         *  @param {Object} options
         *
         *  options:
         *  o eventDispatcher
         */
        initialize: function(targetViewGroup, options) {

            var options = options || {};

            this.target = XML3D.tools.util.getOrCreateTransformable(targetViewGroup);

            /** @private */
            this._targetXml3d = XML3D.tools.util.getXml3dRoot(this.target.object);

            /** @private */
            if(options.eventDispatcher)
                this._eventDispatcher = options.eventDispatcher;
            else
                this._eventDispatcher = new XML3D.tools.util.EventDispatcher();
        },

        /**
         *  @this {XML3D.tools.KeyboardController}
         */
        onKeyDown: function(action) {},

        /**
         *  @this {XML3D.tools.KeyboardController}
         */
        onKeyUp: function(action) {},

        /**
         *  @this {XML3D.tools.KeyboardController}
         *  @protected
         *  @override
         */
        onAttach: function() {
            this._toggleAttached(true);
        },

        /**
         *  @this {XML3D.tools.KeyboardController}
         *  @protected
         *  @override
         */
        onDetach: function() {
            this._toggleAttached(false);
        },

        /**
         *  @this {XML3D.tools.KeyboardController}
         *  @private
         */
        _toggleAttached: function(doAttach) {

            var regFn = this._eventDispatcher.on.bind(this._eventDispatcher);

            if(!doAttach) {
                regFn = this._eventDispatcher.off.bind(this._eventDispatcher);
            }

            regFn(document, "keydown", this.callback("_onKeyDown"));
            regFn(document, "keyup", this.callback("_onKeyUp"));
        },

        // --- Callbacks ---

        /**
         *  @this {XML3D.tools.KeyboardController}
         *  @private
         */
        _onKeyDown: function(evt) {

            this.onKeyDown(evt);
        },

        /**
         *  @this {XML3D.tools.KeyboardController}
         *  @private
         */
        _onKeyUp: function(evt) {

            this.onKeyUp(evt);
        }
    });
}());
