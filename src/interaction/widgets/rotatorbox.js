(function(){

    "use strict";

    XMOT.namespace("XMOT.interaction.widgets");

    /**
     * A RotatorBox is composed of an invisible box that lets you translate the target object
     * along the box side's planes. If you hold the mouse button down on that box' sides
     * a translation plane pops up. You can then translate the object along that plane.
     *
     * If you click on the side of that box arrows for rotation popup,
     * with which you can rotate the target in 90 degree-steps.
     *
     * @extends XMOT.interaction.widgets.Widget
     */
    XMOT.interaction.widgets.RotatorBox = new XMOT.Class(
        XMOT.interaction.widgets.Widget, {

        GeometryType: XMOT.interaction.geometry.RotatorBox,

        /** Creates the geometry and behavior for the XMOT.interaction.widgets.RotatorBox and attaches it to
         *  the _target node, i.e. adding it to the _target's parent node children.
         *
         *  @this {XMOT.interaction.widgets.RotatorBox}
         *
         *  @param {string} _id the id if this XMOT.interaction.widgets.TransformBox and also the id of the corresponding root group node
         *  @param {XMOT.Transformable} _target
         *  @param {number} [_arrowScaleFac] scales the arrows with the given factor. Default: 1
         *
         *  IMPORTANT: If the target's parent group node has no transform element attached,
         *  one is created. If the _target's parent node is not a group node an exception is thrown.
         */
        initialize: function(_id, _target, _arrowScaleFac)
        {
            this.callSuper(_id, _target);

            if(_arrowScaleFac)
                this.geometry.arrowScaleFactor = _arrowScaleFac;

            // -- Rotation Arrows Variables --
            /** the translation plane group at which the currently active rotation interface
             *  is attached.
             *  @private
             */
            this._activeRotFace = null;
        },

        /**
         *  @this {XMOT.interaction.widgets.RotatorBox}
         *  @override
         *  @protected
         */
        onCreateBehavior: function()
        {
            // translation handles
            this.behavior["transbox"] = new XMOT.interaction.widgets.TranslateBox(
                this.globalID("transbox"), this.target
            );
            this.behavior["transbox"].attach();

            this.behavior["transbox"].addListener("touch", this.callback("_handleTransTouch"));
        },

        /**
         *  @this {XMOT.interaction.widgets.RotatorBox}
         *  @override
         *  @protected
         */
        onDestroyGeometry: function()
        {
            this._deactivateArrow();
            this.geometry.arrows = null;
        },

        // ========================================================================
        // --- Private ---
        // ========================================================================

        // --- Behavior Callbacks ---

        /** Activate/deactive the arrow geometry. Callback from
         *  XMOT.interaction.widgets.TranslateBox.
         *
         *  @this {XMOT.interaction.widgets.RotatorBox}
         *  @private
         *
         *  @param {XMOT.interaction.widgets.TranslateBox} translbox
         *  @param {XMOT.interaction.behaviors.PDSensor} sensor the underlying sensor that caused the touch
         *  @param {MouseEvent} evt the original mouse event that raised the event
         */
        _handleTransTouch: function(translbox, sensor, evt)
        {
            // only popup on "bare" touches
            if(!evt.ctrlKey && !evt.altKey && !evt.shiftKey && !evt.metaKey)
            {
                if(!this.geometry.arrows["root"] || !sensor.pickGroups[0])
                    return;

                // hit arrow, do nothing
                if(this._isArrowMesh(sensor.curHitElement))
                    return;

                if(this._activeRotFace)
                {
                    // remove rotation interface from that face
                    var oldFace = this._deactivateArrow();

                    // if a touch occured on a already selected face
                    // only deselect it, i.e. just return now
                    if(oldFace == sensor.pickGroups[0])
                        return;
                }

                this._activateArrow(sensor.pickGroups[0]);
            }
        },

        /** Place the arrow geometry under the given target group and setup callbacks.
         *
         *  @this {XMOT.interaction.widgets.RotatorBox}
         *  @private
         *
         *  @param {!Object} target
         */
        _activateArrow: function(target)
        {
            var globMat = target.getWorldMatrix();

            target.appendChild(this.geometry.arrows["root"]);
            this._activeRotFace = target;

            // calculate inverse scale of target's global matrix
            var invScale = XMOT.math.vecInverseScale(globMat.scaling());
            var tArrowRoot = XMOT.util.transform(this.geometry.arrows["root"]);
            tArrowRoot.setAttribute("scale", invScale.str());

            // arrows
            this.geometry.arrows["left"].addEventListener("click",
                this.callback("_onRotateLeft"), false);
            this.geometry.arrows["right"].addEventListener("click",
                this.callback("_onRotateRight"), false);
            this.geometry.arrows["top"].addEventListener("click",
                this.callback("_onRotateUp"), false);
            this.geometry.arrows["bot"].addEventListener("click",
                this.callback("_onRotateDown"), false);
        },

        /** Remove the arrow geometry under the given target group.
         *
         *  @this {XMOT.interaction.widgets.RotatorBox}
         *  @private
         */
        _deactivateArrow: function()
        {
            var oldFace = this._activeRotFace;

            if(this.geometry.arrows["root"].parentNode)
                this.geometry.arrows["root"].parentNode.removeChild(this.geometry.arrows["root"]);
            this._activeRotFace = null;

            return oldFace;
        },

        /**
         *  @this {XMOT.interaction.widgets.RotatorBox}
         *  @private
         *
         *  @param {MouseEvent} evt
         */
        _onRotateLeft: function(evt)
        {
            this._arrowRotate(new window.XML3DVec3(0, 1, 0), true);
        },

        /**
         *  @this {XMOT.interaction.widgets.RotatorBox}
         *  @private
         *
         *  @param {MouseEvent} evt
         */
        _onRotateRight: function(evt)
        {
            this._arrowRotate(new window.XML3DVec3(0, 1, 0));
        },

        /**
         *  @this {XMOT.interaction.widgets.RotatorBox}
         *  @private
         *
         *  @param {MouseEvent} evt
         */
        _onRotateUp: function(evt)
        {
            this._arrowRotate(new window.XML3DVec3(1, 0, 0), true);
        },

        /**
         *  @this {XMOT.interaction.widgets.RotatorBox}
         *  @private
         *
         *  @param {MouseEvent} evt
         */
        _onRotateDown: function(evt)
        {
            this._arrowRotate(new window.XML3DVec3(1, 0, 0));
        },

        /** Perform a 90 degree rotation around the given axis
         *
         *  @this {XMOT.interaction.widgets.RotatorBox}
         *  @private
         *
         *  @param {XML3DVec3} localAxis
         *  @param {boolean} negateDirection whether to negate the angle
         */
        _arrowRotate: function(localAxis, negateDirection)
        {
            // setup angle
            var angle = 1.57;
            if(negateDirection)
                angle = -angle;

            // we rotate the given local axis according to the local coordinate
            // the arrows are inside (i.e. on one of the translation planes)
            var xfmRot = XMOT.util.transform(this.geometry.arrows["root"].parentNode).rotation;

            // transform local rotation
            var transAxis = xfmRot.rotateVec3(localAxis);
            var transRot = new window.XML3DRotation();
            transRot.setAxisAngle(transAxis, angle);

            // now update root's rotation
            var rootXfm = this.root.transform;
            var rootRot = rootXfm.rotation;
            var newRot = rootRot.multiply(transRot);

            this.root.setOrientation(newRot);

            // detach the arrow's geometry
            this._deactivateArrow();
        },

        /** Returns true if the given element is a mesh node
         *  and points to arrow geometry.
         *
         *  @this {XMOT.interaction.widgets.RotatorBox}
         *  @private
         *
         *  @param {!Object} el
         *  @return {boolean}
         */
        _isArrowMesh: function(el)
        {
            if(el.tagName !== "mesh")
                return false;

            if(!el.src)
                return false;

            var srcRef = "#" + this.globalID("d_arrow");
            if(el.src === srcRef)
                return true;

            return false;
        }
    });
}());
