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

    XML3D.tools.namespace("XML3D.tools.util");

    /** Base class for attaching/detach behavior.
     *  Users of derived classes just invoke the attach()/detach() methods.
     *  Users of this class derive from it and overwrite the onAttach()/onDetach()
     *  methods.
     */
    XML3D.tools.util.Attachable = new XML3D.tools.Class({

        /**
         *  @this {XML3D.tools.interaction.behaviors.Attachable}
         */
        initialize: function()
        {
            this._isAttached = false;
        },

        /**
         *  @this {XML3D.tools.interaction.behaviors.Attachable}
         */
        attach: function()
        {
            if(!this._isAttached)
            {
                this._isAttached = true;
                this.onAttach();
            }
        },

        /**
         *  @this {XML3D.tools.interaction.behaviors.Attachable}
         */
        detach: function()
        {
            if(this._isAttached)
            {
                this._isAttached = false;
                this.onDetach();
            }
        },

        /**
         *  @this {XML3D.tools.interaction.behaviors.Attachable}
         */
        setAttached: function(isAttached)
        {
            this._isAttached = isAttached;
        },

        /**
         *  @this {XML3D.tools.interaction.behaviors.Attachable}
         */
        isAttached: function()
        {
            return this._isAttached;
        },

        /**
         *  @this {XML3D.tools.interaction.behaviors.Attachable}
         *  @protected
         */
        onAttach: function() {},

        /**
         *  @this {XML3D.tools.interaction.behaviors.Attachable}
         *  @protected
         */
        onDetach: function() {}
    });
}());
