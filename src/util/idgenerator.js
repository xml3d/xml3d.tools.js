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

    /** Offers a single function, newID(), which creates an ID that
     *  was not used before in the instance of this class. The created ID is a
     *  string.
     */
    XML3D.tools.util.IDGenerator = new XML3D.tools.Class({

        /**
         *  @this {XML3D.tools.util.IDGenerator}
         */
        initialize: function() {
            this._id = 0;
        },

        /**
         *  @this {XML3D.tools.util.IDGenerator}
         *  @return {string} a new id
         */
        newID: function() {
            var freshId = "" + this._id;
            this._id++;
            return freshId;
        },

        /**
         *  @this {XML3D.tools.util.IDGenerator}
         */
        reset: function() {
            this._id = 0;
        }
    });
}());
