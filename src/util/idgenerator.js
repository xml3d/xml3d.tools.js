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
