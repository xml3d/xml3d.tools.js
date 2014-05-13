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
(function() {

    "use strict";

    XML3D.tools.namespace("XML3D.tools.util");

    /** An EventDispatcher is used to control the specific events that are needed by some
     *  classes, e.g. XML3D.tools.interaction.behaviors.PDSensor.
     *
     *  Why a dispatcher?
     *  Per default the PDSensor emits a "dragstart" event, when any mouse button is pressed.
     *  But what if the behavior is to be toggled only when the left mouse button is pressed
     *  or the left mouse button in combination with the ctrl key?
     *  In that case we can design a custom EventDispatcher, that only propagates the
     *  "mousedown" event, if the left mouse button is pressed or in addition the ctrl key
     *  is pressed.
     *
     *  Using a dispatcher:
     *  Instead of the usual myElement.{add,remove}EventListener() calls invoke
     *  the dispatcher's on() and off() methods.
     *
     *  Creating a custom dispatcher:
     *  1) Derive from or instantiate this class
     *  2) Call registerCustomHandler() for the events you want to control
     *  3) Upon receiving an event decide whether you want the event to be dispatched.
     *      If you don't want it to be dispatched return false. Else return anything else.
     */
    XML3D.tools.util.EventDispatcher = new XML3D.tools.Class({

        /** Initializes the dispatcher.
         *  Optionally a custom handler can be registered right away by providing the
         *  proper arguments.
         *
         *  @this {XML3D.tools.util.EventDispatcher}
         *
         *  @param {string=} eventName
         *  @param {function(Event):boolean=} callback
         */
        initialize: function(eventName, callback) {
            this._callbackContexts = [];
            this._customHandlers = {}; // eventName -> array of callbacks

            if(arguments.length == 2)
                this.registerCustomHandler(eventName, callback);
        },

        /** Register an event listener on the given target element.
         *  Use this method as a user of the dispatcher, i.e. to abstract from the
         *  direct event.
         *
         *  @this {XML3D.tools.util.EventDispatcher}
         *
         *  @param {window.Element} targetElement
         *  @param {string} eventName
         *  @param {function(window.Event)} callback
         */
        on: function(targetElement, eventName, callback) {

            if(!this._hasCustomHandlers(eventName)) {
                this._registerListenerOnTarget(targetElement, eventName, callback);
                return;
            }

            var ctx = {
                targetElement: targetElement,
                eventName: eventName,
                callback: callback
            };

            function internalCB(evt) {
                this._handleEvent(evt, ctx);
            };

            ctx.internalCallback = internalCB.bind(this);

            this._callbackContexts.push(ctx);

            this._registerListenerOnTarget(targetElement, eventName, ctx.internalCallback);
        },

        /** Deregister an event listener on the given target element.
         *  Use this method as a user of the dispatcher, i.e. to abstract from the
         *  direct event.
         *
         *  @this {XML3D.tools.util.EventDispatcher}
         *
         *  @param {window.Element} targetElement
         *  @param {string} eventName
         *  @param {function(window.Event)} callback
         */
        off: function(targetElement, eventName, callback) {

            if(!this._hasCustomHandlers(eventName)) {
                this._deregisterListenerOnTarget(targetElement, eventName, callback);
                return;
            }

            var ctxIdx = this._findContextIndex(targetElement, eventName, callback);
            if(ctxIdx < 0)
                return;

            var ctx = this._callbackContexts[ctxIdx];

            this._deregisterListenerOnTarget(ctx.targetElement, ctx.eventName, ctx.internalCallback);
            this._callbackContexts.splice(ctxIdx, 1);
        },

        /** Tell the dispatcher to be notified for the given event.
         *  Use this method as a custom event dispatcher to tell this dispatcher to
         *  forward any events to the given callback and ask it whether to actually
         *  dispatch the event.
         *
         *  @this {XML3D.tools.util.EventDispatcher}
         *
         *  @param {string} eventName
         *  @param {function(window.Event): boolean} callback
         */
        registerCustomHandler: function(eventName, callback) {
            if(!this._customHandlers[eventName])
                this._customHandlers[eventName] = [];

            this._customHandlers[eventName].push(callback);
        },

        /** Registers an event in the "traditional" way.
         *
         *  @this {XML3D.tools.util.EventDispatcher}
         *  @private
         */
        _registerListenerOnTarget: function(targetElement, eventName, callback)
        {
            targetElement.addEventListener(eventName, callback, false);
        },

        /** Deregisters an event in the "traditional" way.
         *
         *  @this {XML3D.tools.util.EventDispatcher}
         *  @private
         */
        _deregisterListenerOnTarget: function(targetElement, eventName, callback)
        {
            targetElement.removeEventListener(eventName, callback, false);
        },

        /** Will invoke all the custom handlers and ask them whether to dispatch the given event.
         *  If any of the handlers says no, the event will not be dispatched.
         *
         *  @this {XML3D.tools.util.EventDispatcher}
         *  @private
         */
        _handleEvent: function(evt, ctx) {

            var handlers = this._customHandlers[ctx.eventName];
            if(!handlers)
                return;

            var dispatchEvent = true;
            for(var i = 0; i < handlers.length; i++) {
                if(handlers[i](evt) === false)
                    dispatchEvent = false;
            }

            if(dispatchEvent)
                ctx.callback(evt);
        },

        /**
         *  @this {XML3D.tools.util.EventDispatcher}
         *  @private
         */
        _hasCustomHandlers: function(eventName) {

            if(this._customHandlers[eventName])
                return true;
            else
                return false;
        },

        /**
         *  @this {XML3D.tools.util.EventDispatcher}
         *  @private
         */
        _findContextIndex: function(targetElement, eventName, callback) {

            for(var i = 0; i < this._callbackContexts.length; i++) {

                var ctx = this._callbackContexts[i];

                if(ctx.targetElement === targetElement
                && ctx.eventName === eventName
                && ctx.callback === callback)
                    return i;
            }

            return -1;
        }
    });
}());
