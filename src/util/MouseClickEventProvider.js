(function(){

    "use strict";

    XML3D.tools.namespace("XML3D.tools.util");

    /** The HTML mouse click event is raised whenever a mouseup is followed by a mousedown.
     *  However this is not expected behavior because in addition we want that the mouse positions
     *  are the same in down and up events. (else it's actually a dragging operation, not a click).
     *
     *  This class fixes this behavior. Give it an element and a callback, which will be invoked
     *  when a "real" click happens.
     */
    XML3D.tools.util.MouseClickEventProvider = new XML3D.tools.Class({

        _mouseDownX: 0,
        _mouseDownY: 0,
        _mouseUpX: 0,
        _mouseUpY: 0,

        _onClickHandler: function(evt) {},

        /**
         * @param targetElement
         * @param {function(window.MouseEvent)} onClickHandler will receive the click event as argument
         */
        initialize: function(targetElement, onClickHandler) {
            this._onClickHandler = onClickHandler;
            targetElement.addEventListener("mousedown", this.callback("_onMouseDown"));
            targetElement.addEventListener("mouseup", this.callback("_onMouseUp"));
            targetElement.addEventListener("click", this.callback("_onClick"));
        },

        _onMouseDown: function(evt) {
            this._mouseDownX = evt.screenX;
            this._mouseDownY = evt.screenY;
        },

        _onMouseUp: function(evt) {
            this._mouseUpX = evt.screenX;
            this._mouseUpY = evt.screenY;
        },

        _onClick: function(evt) {
            if(this._mouseDownX === this._mouseUpX
            && this._mouseDownY === this._mouseUpY) {
                this._onClickHandler(evt);
            }
        }
    });
}());
