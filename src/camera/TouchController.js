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
    XMOT.TouchController = new XMOT.Class(XMOT.util.Attachable, {

        /**
         *  @this {XMOT.TouchController}
         *  @param {Element|Transformable} targetViewGroup
         *  @param {Object} options
         *
         *  options:
         *  o eventDispatcher
         */
        initialize: function(targetViewGroup, options) {

            var options = options || {};

			this.target = XMOT.util.getOrCreateTransformable(targetViewGroup);

            /** @private */
            this._targetXml3d = XMOT.util.getXml3dRoot(this.target.object);

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
         *  @this {XMOT.TouchController}
         */
        onDragStart: function(action) {},

        /**
         *  @this {XMOT.TouchController}
         */
        onDrag: function(action) {},

        /**
         *  @this {XMOT.TouchController}
         */
        onDragEnd: function(action) {},

        /**
         *  @this {XMOT.TouchController}
         */
        getScene: function() {
            return this._targetXml3d;
        },

        /**
         *  @this {XMOT.TouchController}
         *  @protected
         *  @override
         */
        onAttach: function() {
            this._toggleAttached(true);
        },

        /**
         *  @this {XMOT.TouchController}
         *  @protected
         *  @override
         */
        onDetach: function() {
            this._toggleAttached(false);
        },

        /**
         *  @this {XMOT.TouchController}
         *  @private
         */
        _toggleAttached: function(doAttach) {

            var regFn = this._eventDispatcher.on.bind(this._eventDispatcher);

            if(!doAttach) {
                regFn = this._eventDispatcher.off.bind(this._eventDispatcher);
            }

            regFn(this._targetXml3d, "touchstart", this.callback("_onXML3DTouchStart"));
            regFn(document, "touchmove", this.callback("_onXML3DTouchMove"));
            regFn(document, "touchend", this.callback("_onXML3DTouchEnd"));
            regFn(document, "touchcancel", this.callback("_onXML3DTouchEnd"));
        },

        // --- Callbacks ---

        /**
         *  @this {XMOT.TouchController}
         *  @private
         */
        _onXML3DTouchStart: function(evt) {
            evt.preventDefault();

            this._isDragging = true;
            this.onDragStart(this._constructAction(evt));
            this._rememberPositions(evt);
        },

        /**
         *  @this {XMOT.TouchController}
         *  @private
         */
        _onXML3DTouchMove: function(evt) {
            if (evt.target.nodeName.toLowerCase() == "xml3d") {
                evt.preventDefault();
            }

			if(!this._isDragging)
                return;

            this.onDrag(this._constructAction(evt));
            this._rememberPositions(evt);
        },


        /**
         *  @this {XMOT.TouchController}
         *  @private
         */
        _onXML3DTouchEnd: function(evt) {
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
         *  @this {XMOT.TouchController}
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
         *  @this {XMOT.TouchController}
         *  @private
         */
        _createDefaultEventDispatcher: function() {

            var disp = new XMOT.util.EventDispatcher();

            disp.registerCustomHandler("touchstart", function(evt){
                if(evt.type === "touchstart")
                    return true;

                return false;
            });

            return disp;
        },

        /**
         *  @this {XMOT.TouchController}
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
