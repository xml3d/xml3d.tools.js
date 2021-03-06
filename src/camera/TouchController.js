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

    /** This class encapsulates the setup of touch interaction for the use of camera controllers.
     *  It registers callbacks to the appropriate elements, converts touch coordinates to be
     *  directly usable by a controller behavior and invokes methods in which users of this class
     *  can perform actions.
     *
     *  Usage:
     *  o instantiate or inherit from this class
     *  o override onDragStart(), onDrag() and onDragEnd() to handle the touch events
     *  o call attach() at some point to enable the controller
     *
     *  @constructor
     */
    XML3D.tools.TouchController = new XML3D.tools.Class(XML3D.tools.util.Attachable, {

        /**
         *  @this {XML3D.tools.TouchController}
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
            this._canvasWidth = this._targetXml3d.width || 800;

            /** @private */
            this._canvasHeight = this._targetXml3d.height || 600;

            /** @private */
			this._lastTouchPositions = new Array();
            this._lastTouchPositions[0] = {
                x : -1,
                y : -1
            };

			/** @private */
            this._lastZoomVectorLength = undefined;

            /** @private */
            this._isDragging = false;

            /** @private */
            this._eventDispatcher = null;
            if(options.eventDispatcher)
                this._eventDispatcher = options.eventDispatcher;
            else
                this._eventDispatcher = this._createDefaultEventDispatcher();
        },

        /**
         *  @this {XML3D.tools.TouchController}
         *  @param {XML3D.tools.util.EventDispatcher} eventDispatcher
         */
        setEventDispatcher: function(eventDispatcher) {
            this._eventDispatcher = eventDispatcher;
        },

        /**
         *  @this {XML3D.tools.TouchController}
         */
        onDragStart: function(action) {},

        /**
         *  @this {XML3D.tools.TouchController}
         */
        onDrag: function(action) {},

        /**
         *  @this {XML3D.tools.TouchController}
         */
        onDragEnd: function(action) {},

        /**
         *  @this {XML3D.tools.TouchController}
         */
        getScene: function() {
            return this._targetXml3d;
        },

        /**
         *  @this {XML3D.tools.TouchController}
         *  @protected
         *  @override
         */
        onAttach: function() {
            this._toggleAttached(true);
        },

        /**
         *  @this {XML3D.tools.TouchController}
         *  @protected
         *  @override
         */
        onDetach: function() {
            this._toggleAttached(false);
        },

        /**
         *  @this {XML3D.tools.TouchController}
         *  @private
         */
        _toggleAttached: function(doAttach) {

            var regFn = this._eventDispatcher.on.bind(this._eventDispatcher);

            if(!doAttach) {
                regFn = this._eventDispatcher.off.bind(this._eventDispatcher);
            }

            regFn(this._targetXml3d, "touchstart", this.callback("_onXML3DTouchStart"));
            regFn(document, "touchmove", this.callback("_onDocumentTouchMove"));
            regFn(document, "touchend", this.callback("_onDocumentTouchEnd"));
            regFn(document, "touchcancel", this.callback("_onDocumentTouchEnd"));
        },

        // --- Callbacks ---

        /**
         *  @this {XML3D.tools.TouchController}
         *  @private
         */
        _onXML3DTouchStart: function(evt) {
            evt.preventDefault();

            this._isDragging = true;
            this.onDragStart(this._constructAction(evt));
            this._rememberPositions(evt);
        },

        /**
         *  @this {XML3D.tools.TouchController}
         *  @private
         */
        _onDocumentTouchMove: function(evt) {
            if (evt.target.nodeName.toLowerCase() == "xml3d") {
                evt.preventDefault();
            }

			if(!this._isDragging)
                return;

            this.onDrag(this._constructAction(evt));
            this._rememberPositions(evt);
        },


        /**
         *  @this {XML3D.tools.TouchController}
         *  @private
         */
        _onDocumentTouchEnd: function(evt) {
            if (evt.target.nodeName.toLowerCase() == "xml3d") {
                evt.preventDefault();
            }

            if(!this._isDragging)
                return;

            //touch array is possibly undefined for 0 touches
            if (evt.touches.length > 0) {
                this.onDragEnd(this._constructAction(evt));
                this._rememberPositions(evt);
            } else {
                this._isDragging = false;
            }
        },

        /**
         *  @this {XML3D.tools.TouchController}
         *  @private
         */
        _rememberPositions: function(evt) {
            var touchPositions = new Array();
            for (var i=0; i<evt.touches.length; i++) {
                touchPositions[i] = {x: evt.touches[i].pageX, y: evt.touches[i].pageY};
            }
            this._lastTouchPositions = touchPositions;
        },

        // --- Utils ---

        /**
         *  @this {XML3D.tools.TouchController}
         *  @private
         */
        _createDefaultEventDispatcher: function() {

            var disp = new XML3D.tools.util.EventDispatcher();

            disp.registerCustomHandler("touchstart", function(evt){
                if(evt.type === "touchstart")
                    return true;

                return false;
            });

            return disp;
        },

        /**
         *  @this {XML3D.tools.TouchController}
         *  @private
         */
        _constructAction: function(evt) {

            var positions = new Array();

            for (var i=0; i<evt.touches.length; i++) {
                positions[i] = {x: evt.touches[i].pageX / this._canvasWidth, y: evt.touches[i].pageY / this._canvasHeight};
            }

            var deltas = new Array();

            for (var i=0; i<evt.touches.length; i++) {
                if(this._lastTouchPositions[i] !== undefined) {
                    deltas[i] = {x: (evt.touches[i].pageX - this._lastTouchPositions[i].x) / this._canvasWidth,
                                 y: (evt.touches[i].pageY - this._lastTouchPositions[i].y) / this._canvasHeight};
                }
            }

            var zoomFactor = 1;

            if (evt.touches.length > 1) {
                if (this._lastZoomVectorLength !== undefined) {
                    var dv = {x: positions[0].x - positions[1].x, y: positions[0].y - positions[1].y};
                    var currLength = Math.sqrt(dv.x*dv.x + dv.y*dv.y);
                    zoomFactor = 1.0 + currLength - this._lastZoomVectorLength;
                    this._lastZoomVectorLength = currLength;
                } else {
                    var dv = {x: positions[0].x - positions[1].x, y: positions[0].y - positions[1].y};
                    this._lastZoomVectorLength = Math.sqrt(dv.x*dv.x + dv.y*dv.y);
                }
            } else {
                this._lastZoomVectorLength = undefined;
            }

            return {
                evt: evt,
                positions: positions,
                deltas: deltas,
                zoom: zoomFactor
            };
        }
    });
}());
