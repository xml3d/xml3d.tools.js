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
