(function() {

    "use strict";

    XMOT.namespace("XMOT.util");

    /** Offers a single function, newID(), which creates an ID that
     *  was not used before in the instance of this class. The created ID is a
     *  string.
     */
    XMOT.util.IDGenerator = new XMOT.Class({

        /**
         *  @this {XMOT.util.IDGenerator}
         */
        initialize: function() {
            this._id = 0;
        },

        /**
         *  @this {XMOT.util.IDGenerator}
         *  @return {string} a new id
         */
        newID: function() {
            var freshId = "" + this._id;
            this._id++;
            return freshId;
        },

        /**
         *  @this {XMOT.util.IDGenerator}
         */
        reset: function() {
            this._id = 0;
        }
    });
}());
