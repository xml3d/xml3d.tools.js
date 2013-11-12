(function(){

    "use strict";

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
     *  PROBLEM
     *  There is a general problem with overlays: multiple ones on top of each other.
     *  Now the propagation to underlying elements is done by making itself invisible.
     *  However, if multiple overlays are present that causes an infinite loop (switch
     *  the overlay below another one invisible...).
     */
    XMOT.xml3doverlay.XML3DOverlay = new XMOT.Class(
        XMOT.util.Attachable, {

        /**
         *  @this {XMOT.xml3doverlay.XML3DOverlay}
         */
        initialize: function(targetXML3DElement)
        {
            this.xml3dTarget = targetXML3DElement;
            this.xml3d = this._createXML3DElement();

            this._xml3dCanvas = null; // set in _registerEventListeners()

            this._mirroredView = new XMOT.interaction.behaviors.MirroredView(
                targetXML3DElement, this.xml3d);
        },

        /**
         *  @this {XMOT.xml3doverlay.XML3DOverlay}
         *  @override
         *  @protected
         */
        onAttach: function()
        {
            document.body.appendChild(this.xml3d);
            this._mirroredView.attach();
            this._registerEventListeners(true);
        },

        /**
         *  @this {XMOT.xml3doverlay.XML3DOverlay}
         *  @override
         *  @protected
         */
        onDetach: function()
        {
            this._registerEventListeners(false);

            this._mirroredView.detach();
            var canvas = this.xml3d.parentNode.previousSibling;

            document.body.removeChild(this.xml3d.parentNode);
            document.body.removeChild(canvas);
        },

        /**
         *  @this {XMOT.xml3doverlay.XML3DOverlay}
         *  @private
         */
        _createXML3DElement: function()
        {
            var targetWidth = this.xml3dTarget.offsetWidth;
            var targetHeight = this.xml3dTarget.offsetHeight;
            var targetOffset = this._calculateOffset(this.xml3dTarget);
            var zIndex = this._getTargetZIndex();

            var styleAttrib = "width:" + targetWidth + "px;height:" + targetHeight + "px;";
            styleAttrib += "background-color:transparent;";
            styleAttrib += "z-index:" + zIndex + ";";
            styleAttrib += "position:absolute;";
            styleAttrib += "top:" + targetOffset.top + "px;left:" + targetOffset.left + "px;";

            return XMOT.creation.element("xml3d", { style: styleAttrib });
        },

        /**
         *  @this {XMOT.xml3doverlay.XML3DOverlay}
         *  @private
         */
        _registerEventListeners: function(doAddListener)
        {
            if(!this.xml3d.parentNode || !this.xml3d.parentNode.previousElementSibling)
                throw new Error("XML3DOverlay: xml3d element has no parent node or no canvas attached.");

            this._xml3dCanvas = this.xml3d.parentNode.previousElementSibling;

            if(this._xml3dCanvas.tagName.toLowerCase() !== "canvas")
                throw new Error("XML3DOverlay: associated element must be a canvas.");

            var registerFn = this._xml3dCanvas.addEventListener.bind(this._xml3dCanvas);
            if(doAddListener === false)
                registerFn = this._xml3dCanvas.removeEventListener.bind(this._xml3dCanvas);

            registerFn("click", this.callback("_onOverlayMouseEvent"), false);
            registerFn("mousedown", this.callback("_onOverlayMouseEvent"), false);
            registerFn("mouseup", this.callback("_onOverlayMouseEvent"), false);
            registerFn("mouseover", this.callback("_onOverlayMouseEvent"), false);
            registerFn("mousemove", this.callback("_onOverlayMouseEvent"), false);
            registerFn("mouseout", this.callback("_onOverlayMouseEvent"), false);
        },

        /**
         *  @this {XMOT.xml3doverlay.XML3DOverlay}
         *  @private
         */
        _onOverlayMouseEvent: function(evt)
        {
            var elOverlay = this.xml3d.getElementByPoint(evt.pageX, evt.pageY);
            if(elOverlay)
                return; // hit: do not delegate anything

            var oldStyleDisplay = this._xml3dCanvas.style.display;

            this._xml3dCanvas.style.display = "none";
            var newEl = document.elementFromPoint(evt.clientX, evt.clientY);
            this._xml3dCanvas.style.display = oldStyleDisplay;

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

        /**
         *  @this {XMOT.xml3doverlay.XML3DOverlay}
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
         *  @this {XMOT.xml3doverlay.XML3DOverlay}
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

            throw new Error("XMOT.xml3doverlay.XML3DOverlay: missing style property '" + stylePropertyName + "' of target element!");
        },

        /** Calculate the offset of the given element and return it.
         *
         *  @param {Object} element
         *  @return {{top:number, left:number}} the offset
         *
         *  This code is taken from http://javascript.info/tutorial/coordinates .
         *  We don't want to do it with the offsetParent way, because the xml3d
         *  element is actually invisible and thus offsetParent will return null
         *  at least in WebKit. Also it's slow. So we use getBoundingClientRect().
         *  However it returns the box relative to the window, not the document.
         *  Thus, we need to incorporate the scroll factor. And because IE is so
         *  awesome some workarounds have to be done and the code gets complicated.
         */
        _calculateOffset: function(element)
        {
            var box = element.getBoundingClientRect();
            var body = document.body;
            var docElem = document.documentElement;

            // get scroll factor (every browser except IE supports page offsets)
            var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
            var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

            // the document (`html` or `body`) can be shifted from left-upper corner in IE. Get the shift.
            var clientTop = docElem.clientTop || body.clientTop || 0;
            var clientLeft = docElem.clientLeft || body.clientLeft || 0;

            var top  = box.top +  scrollTop - clientTop;
            var left = box.left + scrollLeft - clientLeft;

            // for Firefox an additional rounding is sometimes required
            return {top: Math.round(top), left: Math.round(left)};
        }
    });

}());
