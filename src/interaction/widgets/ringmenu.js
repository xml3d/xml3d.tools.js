
XMOT.namespace("XMOT.interaction.widgets");

/**
 * Encapsulates the XML3D.interaction.behaviors.RingMenu behavior
 * into a widget that contains arrows for stepping through the items.
 *
 * @extends XMOT.interaction.widgets.Widget
 */
XMOT.interaction.widgets.RingMenu = new XMOT.Class(
    XMOT.interaction.widgets.Widget, {

    GeoConstructorType: XMOT.interaction.geometry.RingMenuGeoConstructor,

    /** Setup the ring menu and attach it to the target group.
     *
     *  @this {XMOT.interaction.widgets.RingMenu}
     *
     *  @param {!Object} _xml3d
     *  @param {string} _id
     *  @param {!XMOT.Transformable} _target
     *  @param {number} _radius
     */
    initialize: function(_id, _target, _radius)
    {
        this.callSuper(_id, _target, false);

        /** @private */
        this._radius = _radius;
    },

    /** @this {XMOT.interaction.widgets.RingMenu} */
    stepLeft: function()
    {
        this.behavior["ringmenu"].stepLeft();
    },

    /** @this {XMOT.interaction.widgets.RingMenu} */
    stepRight: function()
    {
        this.behavior["ringmenu"].stepRight();
    },

    /** @this {XMOT.interaction.widgets.RingMenu} */
    step: function(numStepsLeft)
    {
        this.behavior["ringmenu"].step(numStepsLeft);
    },

    /**
     *  @this {XMOT.interaction.widgets.RingMenu}
     *  @override
     *  @protected
     */
    onCreateBehavior: function()
    {
        var beh = new XMOT.interaction.behaviors.RingMenu(
            this.globalID("behavior"),
            this.target.object, this._radius
        );

        this._toggleChooserListeners(true);

        beh.attach();
        this.behavior["ringmenu"] = beh;
    },

    // ========================================================================
    // --- Private ---
    // ========================================================================

    /**
     *  @this {XMOT.interaction.widgets.RingMenu}
     *  @private
     *
     *  @param {boolean} doAttach whether to attach or detach
     */
    _toggleChooserListeners: function(doAttach)
    {
        var dFn = null;
        var eFn = null;

        if(doAttach)
        {
            dFn = document.addEventListener;
            eFn = Element.prototype.addEventListener;
        }
        else
        {
            dFn = document.removeEventListener;
            eFn = Element.prototype.removeEventListener;
        }

        dFn.call(document, "keyup",
            this.callback("_onKeyUp"), false);

        // left-arrow focusing
        eFn.call(this.geoConstructor.geoChooseLeft, "click",
            this.callback("stepLeft"), false);
        eFn.call(this.geoConstructor.geoChooseLeft, "mouseover",
                this.callback("_focusLeftArrow"), false);
        eFn.call(this.geoConstructor.geoChooseLeft, "mouseout",
                this.callback("_defocusLeftArrow"), false);

        // right-arrow focusing
        eFn.call(this.geoConstructor.geoChooseRight, "click",
            this.callback("stepRight"), false);
        eFn.call(this.geoConstructor.geoChooseRight, "mouseover",
                this.callback("_focusRightArrow"), false);
        eFn.call(this.geoConstructor.geoChooseRight, "mouseout",
            this.callback("_defocusRightArrow"), false);
    },

    /**
     *  @this {XMOT.interaction.widgets.RingMenu}
     *  @private
     */
    _focusLeftArrow: function()
    {
        this._focusArrow(this.geoConstructor.geoChooseLeft);
    },

    /**
     *  @this {XMOT.interaction.widgets.RingMenu}
     *  @private
     */
    _defocusLeftArrow: function()
    {
        this._focusArrow(this.geoConstructor.geoChooseLeft, true);
    },

    /**
     *  @this {XMOT.interaction.widgets.RingMenu}
     *  @private
     */
    _focusRightArrow: function()
    {
        this._focusArrow(this.geoConstructor.geoChooseRight);
    },

    /**
     *  @this {XMOT.interaction.widgets.RingMenu}
     *  @private
     */
    _defocusRightArrow: function()
    {
        this._focusArrow(this.geoConstructor.geoChooseRight, true);
    },

    /**
     *  @this {XMOT.interaction.widgets.RingMenu}
     *  @private
     */
    _focusArrow: function(arr, disableFocus)
    {
        if(disableFocus)
            XMOT.util.shader(arr, this.geo.defs["s_choose"]);
        else
            XMOT.util.shader(arr, this.geo.defs["s_chooseHigh"]);
    },

    /**
     *  @this {XMOT.interaction.widgets.RingMenu}
     *  @private
     */
    _onKeyUp: function(evt)
    {
        switch(evt.which)
        {
        case 37: // left cursor key
            this.stepLeft();
            break;

        case 39: // right cursor key
            this.stepRight();
            break;
        }
    }
});
