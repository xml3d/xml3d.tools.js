(function(){

    "use strict";

    XMOT.namespace("XMOT.util");

    /** Base class for attaching/detach behavior.
     *  Users of derived classes just invoke the attach()/detach() methods.
     *  Users of this class derive from it and overwrite the onAttach()/onDetach()
     *  methods.
     */
    XMOT.util.Attachable = new XMOT.Class({

        /**
         *  @this {XMOT.interaction.behaviors.Attachable}
         */
        initialize: function()
        {
            this._isAttached = false;
        },

        /**
         *  @this {XMOT.interaction.behaviors.Attachable}
         */
        attach: function()
        {
            if(!this._isAttached)
            {
                this.onAttach();
                this._isAttached = true;
            }
        },

        /**
         *  @this {XMOT.interaction.behaviors.Attachable}
         */
        detach: function()
        {
            if(this._isAttached)
            {
                this.onDetach();
                this._isAttached = false;
            }
        },

        /**
         *  @this {XMOT.interaction.behaviors.Attachable}
         */
        setAttached: function(isAttached)
        {
            this._isAttached = isAttached;
        },

        /**
         *  @this {XMOT.interaction.behaviors.Attachable}
         */
        isAttached: function()
        {
            return this._isAttached;
        },

        /**
         *  @this {XMOT.interaction.behaviors.Attachable}
         *  @protected
         */
        onAttach: function() {},

        /**
         *  @this {XMOT.interaction.behaviors.Attachable}
         *  @protected
         */
        onDetach: function() {}
    });
}());
