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

    /** Provides a method isPressed(key) to check whether a key is currently pressed.
     *  This removes the need to setup callbacks for keydown/up events and managing
     *  a "currently pressed keys" array for yourself.
     *
     *  @constructor
     */
    XML3D.tools.KeyboardState = new XML3D.tools.Singleton({

        /**
         *  @this {XML3D.tools.KeyboardState}
         *  @public
         */
        initialize: function()
        {
            /** map keyvalue => boolean */
            this._currentlyPressedKeys = {};

            document.addEventListener("keydown", this._onKeyDown.bind(this));
            document.addEventListener("keyup", this._onKeyUp.bind(this));
        },

        /**
         *  @this {XML3D.tools.KeyboardState}
         *  @public
         */
        isPressed: function(key)
        {
            return this._currentlyPressedKeys[key];
        },

        // --- Callbacks ---

        /**
         *  @this {XML3D.tools.KeyboardState}
         *  @private
         */
        _onKeyDown: function(evt)
        {
            this._currentlyPressedKeys[evt.keyCode] = true;
        },

        /**
         *  @this {XML3D.tools.KeyboardState}
         *  @private
         */
        _onKeyUp: function(evt)
        {
            this._currentlyPressedKeys[evt.keyCode] = false;
        }
    });
}());
