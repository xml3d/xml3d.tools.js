(function(){

    "use strict";

    XML3D.tools.namespace("XML3D.tools.xml3doverlay.XML3DOverlay");

    /** This class will create an xml3d element on top of the given one.
     *  It will forward any mouse events that don't hit an xml3d element to the target
     *  element. Also it will mirror and track the target element's view.
     *
     *  This implementation will attach listeners to the canvas element, that is
     *  created for xml3d. The graph looks as follows:
     *  o canvas: the visible stuff
     *  o invisible div: container for the xml3d tree
     *      - xml3d: the actual xml3d element
     *
     *  This is wanted because the xml3d element itself will receive other mouse
     *  events. For example an mouseout event of geometry in the overlay will
     *  probably not be a mouseout event in the underlying element.
     *  Thus, we will simply forward the unfiltered events, that the canvas itself
     *  receives.
     *
     *  The overlay element will be attached to the same parent as the target xml3d element.
     *  More specifically it will have the same parent as the target canvas element
     *  (because after attaching the xml3d.js will pack that into a div aso.).
     *
     *  PROBLEM
     *  There is a general problem with overlays: multiple ones on top of each other.
     *  Now the propagation to underlying elements is done by making itself invisible.
     *  However, if multiple overlays are present that causes an infinite loop (switch
     *  the overlay below another one invisible...).
     */
    XML3D.tools.xml3doverlay.XML3DOverlay = new XML3D.tools.Class(
        XML3D.tools.util.Attachable, {

        /**
         *  @this {XML3D.tools.xml3doverlay.XML3DOverlay}
         */
        initialize: function(targetXML3DElement)
        {
            this.callSuper();
            this.xml3dTarget = targetXML3DElement;
            this._canvasTarget = this._getCanvasElement(this.xml3dTarget);
            this.xml3d = this._createXML3DElement();

            this._canvas = null; // set in onAttach()

            this._mirroredView = new XML3D.tools.xml3doverlay.MirroredView(
                targetXML3DElement, this.xml3d);
        },

        /**
         *  @this {XML3D.tools.xml3doverlay.XML3DOverlay}
         *  @override
         *  @protected
         */
        onAttach: function()
        {
            this._canvasTarget.parentNode.appendChild(this.xml3d);
            this._canvas = this._getCanvasElement(this.xml3d);

            this._mirroredView.attach();
            this._registerEventListeners(true);
        },

        /**
         *  @this {XML3D.tools.xml3doverlay.XML3DOverlay}
         *  @override
         *  @protected
         */
        onDetach: function()
        {
            this._registerEventListeners(false);
            this._mirroredView.detach();
            this.xml3d.parentNode.removeChild(this.xml3d);
        },

        _getCanvasElement: function(xml3d)
        {
            if(!xml3d.parentNode || !xml3d.parentNode.previousElementSibling)
                throw new Error("XML3DOverlay: xml3d element has no parent node or no canvas attached.");

            var canvas = xml3d.parentNode.previousElementSibling;
            if(canvas.tagName.toLowerCase() !== "canvas")
                throw new Error("XML3DOverlay: associated element must be a canvas.");

            return canvas;
        },

        /**
         *  @this {XML3D.tools.xml3doverlay.XML3DOverlay}
         *  @private
         */
        _createXML3DElement: function()
        {
            var targetWidth = this.xml3dTarget.offsetWidth;
            var targetHeight = this.xml3dTarget.offsetHeight;
            var targetOffset = {top : this._canvasTarget.offsetTop, left: this._canvasTarget.offsetLeft};
            console.log("offset: " + targetOffset.top + "x" + targetOffset.left);
            var zIndex = this._getTargetZIndex();

            var styleAttrib = "width:" + targetWidth + "px;height:" + targetHeight + "px;";
            styleAttrib += "background-color:transparent;";
            styleAttrib += "z-index:" + zIndex + ";";
            styleAttrib += "position:absolute;";
            // we append the overlay to the same parent as the original element
            // so we want the same offset to the parent as the other xml3d's canvas
            styleAttrib += "top:" + targetOffset.top + "px;left:" + targetOffset.left + "px;";

            return XML3D.tools.creation.element("xml3d", { style: styleAttrib });
        },

        /**
         *  @this {XML3D.tools.xml3doverlay.XML3DOverlay}
         *  @private
         */
        _registerEventListeners: function(doAddListener)
        {
            this._registerOverlayEventListeners(doAddListener);
            this._registerTargetEventListeners(doAddListener);
        },

        /**
         *  @this {XML3D.tools.xml3doverlay.XML3DOverlay}
         *  @private
         */
        _registerOverlayEventListeners: function(doAddListener)
        {
            var registerFn = this._canvas.addEventListener.bind(this._canvas);
            if(doAddListener === false)
                registerFn = this._canvas.removeEventListener.bind(this._canvas);

            registerFn("click", this.callback("_onOverlayMouseEvent"), false);
            registerFn("mousedown", this.callback("_onOverlayMouseEvent"), false);
            registerFn("mouseup", this.callback("_onOverlayMouseEvent"), false);
            registerFn("mouseover", this.callback("_onOverlayMouseEvent"), false);
            registerFn("mousemove", this.callback("_onOverlayMouseEvent"), false);
            registerFn("mouseout", this.callback("_onOverlayMouseEvent"), false);
        },

        _registerTargetEventListeners: function(doAddListener)
        {
            var registerFn = this.xml3dTarget.addEventListener.bind(this.xml3dTarget);
            if(doAddListener === false)
                registerFn = this.xml3dTarget.removeEventListener.bind(this.xml3dTarget);

            registerFn("resize", this.callback("_onTargetResizeEvent"));
        },

        /**
         *  @this {XML3D.tools.xml3doverlay.XML3DOverlay}
         *  @private
         */
        _onOverlayMouseEvent: function(evt)
        {
            var elOverlay = this.xml3d.getElementByPoint(evt.pageX, evt.pageY);
            if(elOverlay)
                return; // hit: do not delegate anything

            var oldStyleDisplay = this._canvas.style.display;

            this._canvas.style.display = "none";
            var newEl = document.elementFromPoint(evt.clientX, evt.clientY);
            this._canvas.style.display = oldStyleDisplay;

            if(newEl)
                this._delegateEvent(evt, newEl);
        },

        _delegateEvent: function(evt, newTarget)
        {
            var newEvt = document.createEvent("MouseEvents");
            newEvt.initMouseEvent(evt.type, evt.bubbles, evt.cancelable,
                evt.view, evt.detail, evt.screenX, evt.screenY,
                evt.clientX, evt.clientY, evt.ctrlKey, evt.altKey, evt.shiftKey,
                evt.metaKey, evt.button, evt.relatedTarget);

            newTarget.dispatchEvent(newEvt);
        },

        /** We are most-def not parented under the same node as the target xml3d element.
         *  Thus, we track the resize event of the target node and forward that to your
         *  overlay manually.
         *
         *  @param evt
         *  @private
         */
        _onTargetResizeEvent: function(evt)
        {
            var dimensions = evt.detail;
            this.xml3d.style.width = dimensions.width + "px";
            this.xml3d.style.height = dimensions.height + "px";
        },

        /**
         *  @this {XML3D.tools.xml3doverlay.XML3DOverlay}
         *  @private
         */
        _getTargetZIndex: function()
        {
            var zIndex = this._getTargetStyleProperty("z-index");
            if(isNaN(zIndex))
                zIndex = 1;
            else
                zIndex++;

            return zIndex;
        },

        /**
         *  @this {XML3D.tools.xml3doverlay.XML3DOverlay}
         *  @private
         */
        _getTargetStyleProperty: function(stylePropertyName)
        {
            if (this.xml3dTarget.currentStyle)
                return this.xml3dTarget.currentStyle[stylePropertyName];
            else if (window.getComputedStyle) {
                var computedStyle = document.defaultView.getComputedStyle(this.xml3dTarget,null);
                return computedStyle.getPropertyValue(stylePropertyName);
            }

            throw new Error("XML3D.tools.xml3doverlay.XML3DOverlay: missing style property '" + stylePropertyName + "' of target element!");
        }
    });

}());
