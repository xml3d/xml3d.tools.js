(function(){

    "use strict";

    /** This class encapsulates the setup of keyboard interaction for the use of camera controllers.
     *  It registers callbacks to the appropriate elements and invokes methods in which users of
     *  this class can perform actions.
     *
     *  Usage:
     *  o instantiate or inherit from this class
     *  o override onKeyDown() and/or onKeyUp() to handle keyboard events
     *  o call attach() at some point to enable the controller
     *
     *  @constructor
     */
    XMOT.KeyboardController = new XMOT.Class(XMOT.util.Attachable, {

        /**
         *  @this {XMOT.KeyboardController}
         *  @param {Element|Transformable} targetViewGroup
         *  @param {Object} options
         *
         *  options:
         *  o eventDispatcher
         */
        initialize: function(targetViewGroup, options) {

            var options = options || {};

            this.target = XMOT.util.getOrCreateTransformable(targetViewGroup);

            /** @private */
            this._targetXml3d = XMOT.util.getXml3dRoot(this.target.object);

            /** @private */
            if(options.eventDispatcher)
                this._eventDispatcher = options.eventDispatcher;
            else
                this._eventDispatcher = new XMOT.util.EventDispatcher();
        },

        /**
         *  @this {XMOT.KeyboardController}
         */
        onKeyDown: function(action) {},

        /**
         *  @this {XMOT.KeyboardController}
         */
        onKeyUp: function(action) {},

        /**
         *  @this {XMOT.KeyboardController}
         *  @protected
         *  @override
         */
        onAttach: function() {
            this._toggleAttached(true);
        },

        /**
         *  @this {XMOT.KeyboardController}
         *  @protected
         *  @override
         */
        onDetach: function() {
            this._toggleAttached(false);
        },

        /**
         *  @this {XMOT.KeyboardController}
         *  @private
         */
        _toggleAttached: function(doAttach) {

            var regFn = this._eventDispatcher.on.bind(this._eventDispatcher);

            if(!doAttach) {
                regFn = this._eventDispatcher.off.bind(this._eventDispatcher);
            }

            regFn(document, "keydown", this.callback("_onKeyDown"));
            regFn(document, "keyup", this.callback("_onKeyUp"));
        },

        // --- Callbacks ---

        /**
         *  @this {XMOT.KeyboardController}
         *  @private
         */
        _onKeyDown: function(evt) {

            this.onKeyDown(evt);
        },

        /**
         *  @this {XMOT.KeyboardController}
         *  @private
         */
        _onKeyUp: function(evt) {

            this.onKeyUp(evt);
        }
    });
}());
