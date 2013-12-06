(function(){

    "use strict";

    /** This class encapsulates the setup of mouse interaction for the use of camera controllers.
     *  It registers callbacks to the appropriate elements, converts mouse coordinates to be
     *  directly usable by a controller behavior and invokes methods in which users of this class
     *  can perform actions.
     *
     *  Usage:
     *  o instantiate or inherit from this class
     *  o override onDragStart(), onDrag() and onDragEnd() to handle the mouse events
     *  o call attach() at some point to enable the controller
     *
     *  @constructor
     */
    XML3D.tools.MouseController = new XML3D.tools.Class(XML3D.tools.util.Attachable, {

        /**
         *  @this {XML3D.tools.MouseController}
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
            this._lastMousePos = {
                x : -1,
                y : -1
            };

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
         *  @this {XML3D.tools.MouseController}
         *  @param {XML3D.tools.util.EventDispatcher} eventDispatcher
         */
        setEventDispatcher: function(eventDispatcher) {
            this._eventDispatcher = eventDispatcher;
        },

        /**
         *  @this {XML3D.tools.MouseController}
         */
        onDragStart: function(action) {},

        /**
         *  @this {XML3D.tools.MouseController}
         */
        onDrag: function(action) {},

        /**
         *  @this {XML3D.tools.MouseController}
         */
        onDragEnd: function(action) {},

        /**
         *  @this {XML3D.tools.MouseController}
         */
        getScene: function() {
            return this._targetXml3d;
        },

        /**
         *  @this {XML3D.tools.MouseController}
         *  @protected
         *  @override
         */
        onAttach: function() {
            this._toggleAttached(true);
        },

        /**
         *  @this {XML3D.tools.MouseController}
         *  @protected
         *  @override
         */
        onDetach: function() {
            this._toggleAttached(false);
        },

        /**
         *  @this {XML3D.tools.MouseController}
         *  @private
         */
        _toggleAttached: function(doAttach) {

            var regFn = this._eventDispatcher.on.bind(this._eventDispatcher);

            if(!doAttach) {
                regFn = this._eventDispatcher.off.bind(this._eventDispatcher);
            }

            regFn(this._targetXml3d, "mousedown", this.callback("_onXML3DMouseDown"));
            regFn(document, "mousemove", this.callback("_onDocumentMouseMove"));
            regFn(document, "mouseup", this.callback("_onDocumentMouseUp"));
        },

        // --- Callbacks ---

        /**
         *  @this {XML3D.tools.MouseController}
         *  @private
         */
        _onXML3DMouseDown: function(evt) {
            evt.preventDefault();

            this._isDragging = true;
            this.onDragStart(this._constructAction(evt));
            this._rememberPosition(evt);
        },

        /**
         *  @this {XML3D.tools.MouseController}
         *  @private
         */
        _onDocumentMouseMove: function(evt) {
            if(!this._isDragging)
                return;

            if (evt.target.nodeName.toLowerCase() == "xml3d") {
                evt.preventDefault();
            }

            this.onDrag(this._constructAction(evt));
            this._rememberPosition(evt);
        },

        /**
         *  @this {XML3D.tools.MouseController}
         *  @private
         */
        _onDocumentMouseUp: function(evt) {
            if(!this._isDragging)
                return;

            if (evt.target.nodeName.toLowerCase() == "xml3d") {
                evt.preventDefault();
            }

            this._isDragging = false;
            this.onDragEnd(this._constructAction(evt));
            this._rememberPosition(evt);
        },

        /**
         *  @this {XML3D.tools.MouseController}
         *  @private
         */
        _rememberPosition: function(evt) {
            this._lastMousePos.x = evt.pageX;
            this._lastMousePos.y = evt.pageY;
        },

        // --- Utils ---

        /**
         *  @this {XML3D.tools.MouseController}
         *  @private
         */
        _createDefaultEventDispatcher: function() {

            var disp = new XML3D.tools.util.EventDispatcher();

            disp.registerCustomHandler("mousedown", function(evt){
                if(evt.button === XML3D.tools.MOUSEBUTTON_LEFT
                || evt.button === XML3D.tools.MOUSEBUTTON_RIGHT)
                    return true;

                return false;
            });

            return disp;
        },

        /**
         *  @this {XML3D.tools.MouseController}
         *  @private
         */
        _constructAction: function(evt) {

            var deltaX = (evt.pageX - this._lastMousePos.x) / this._canvasWidth;
            var deltaY = (evt.pageY - this._lastMousePos.y) / this._canvasHeight;

            return {
                evt: evt,
                pos: {x: evt.pageX / this._canvasWidth, y: evt.pageY / this._canvasHeight},
                delta: {x: deltaX, y: deltaY}
            };
        }
    });
}());
