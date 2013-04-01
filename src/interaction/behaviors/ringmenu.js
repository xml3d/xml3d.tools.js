(function(){

    "use strict";

    XMOT.namespace("XMOT.interaction.behaviors");

    /**
     * This class creates and manages the behavior of a ring menu.
     * This ring menu is supposed to be rather simple. You give it a
     * target node and a radius and it places the objects under the target
     * node on a ring. You can obtain the currently
     * selected object RingMenu.currentSelectedObj and make it step
     * one item to the left or right.
     *
     * IMPORTANT: the transform properties of the target node as well as
     * all children will be overriden. In particular, the rotation property
     * of the target node will be overriden, as well as the translation and
     * rotation properties of the child nodes.
     */
    XMOT.interaction.behaviors.RingMenu = new XMOT.Class({

        /** Creates the ring menu with the given arguments. This method
         *  creates everything it needs for the menu but does not do
         *  any insertions into the dom. The menu will lie in the
         *  world origin with the first selected item in the (0,0,1) direction.
         *
         *  @this {XMOT.interaction.behaviors.RingMenu}
         *
         *  @param {string} id the identifier of the object. All ids in the ring menu
         *         will include that id somehow. Also the root group of this
         *         menu will have that id so it can be queried easily.
         *  @param {!Object} targetGrp the group under which the menu items reside
         *  @param {number} radius the radius of the ring the objects will lie on
         */
        initialize: function(id, targetGrp, radius)
        {
            this.xml3d = XMOT.util.getXml3dRoot(targetGrp);
            this.ID = id;

            this.targetGrp = targetGrp;

            /** @private */
            this._currentSelectedObjIdx = 0;

            /** @private */
            this._targetChildren = XMOT.util.getXML3DChildren(targetGrp);

            if(this._targetChildren.length < 1)
                throw "RingMenu: at least one child must be present.";

            /** storage for object interpolators. They will do exactly the
             * opposite of what the root interpolator does, to keep the
             * object always aligned to the front when the menu rotates.
             *  @private
             */
            this._objInterpolators = new Array();

            // rotation angle stuff
            /** @private
             *  @const
             */
            this._angleStep = (2*Math.PI) / this._targetChildren.length;
            /** @private */
            this._curAngle = 0; // current rotation of the menu
            /** @private */
            this._stepRotation = new window.XML3DRotation(new window.XML3DVec3(0, 1, 0), this._angleStep);
            /** @private */
            this._radius = radius;

            // setup menu
            this._createInterpolators();
        },

        /** Attach the menu to the given group and all necessary elements to
         *  the defs section.
         *
         *  @this {XMOT.interaction.behaviors.RingMenu}
         */
        attach: function()
        {
            this._setupChildren();

            // attach & update interpolators
            document.body.appendChild(this._rootInterpolator);
            Array.forEach(this._objInterpolators, function(pol) {
                document.body.appendChild(pol);
            });
        },

        /** Detach the previously attached menu. This includes entries in the def section
         *
         *  @this {XMOT.interaction.behaviors.RingMenu}
         */
        detach: function()
        {
            // detach interpolator
            document.body.removeChild(this._rootInterpolator);
            Array.forEach(this._objInterpolators, function(pol) {
                document.body.removeChild(pol);
            });
        },

        /** Select the left item next to the current one.
         *  It rotates the menu one position in the right direction and thus
         *  selects the element to the left of the current one.
         *
         *  @this {XMOT.interaction.behaviors.RingMenu}
         */
        stepLeft: function()
        {
            this.step(1);
        },

        /** Selects the right item next to the current one.
         *  See stepRight().
         *
         * @this {XMOT.interaction.behaviors.RingMenu}
         */
        stepRight: function()
        {
            this.step(-1);
        },

        /** Perform a number of steps in the given direction.
         *
         *  @this {XMOT.interaction.behaviors.RingMenu}
         *  @param {number} numStepsLeft number of steps to go left. If you want to go right,
         *          negate the number of steps.
         */
        step: function(numStepsLeft)
        {
            // create key values
            var startRootRot = "0 1 0 " + this._curAngle;
            var startObjRot = "0 1 0 " + -this._curAngle;

            this._curAngle += numStepsLeft * this._angleStep;

            var endRootRot = "0 1 0 " + this._curAngle;
            var endObjRot = "0 1 0 " + -this._curAngle;

            /** do these checks after the rotation is set
             * to hit the reset button before the next initial
             * rotation.
             */
            if(this._curAngle > 3.14 || this._curAngle < -3.14)
                this._curAngle = 0;

            // set attribute and start root interpolator
            this._startAnimation(this._rootInterpolator, this.targetGrp,
                    startRootRot, endRootRot);

            // start animation of each menu object group
            for(var i = 0; i < this._targetChildren.length; i++)
            {
                this._startAnimation(this._objInterpolators[i],
                    this._targetChildren[i],
                    startObjRot, endObjRot);
            }

            /** modify idx of currently selected object. numStepsLeft might
             *  be negative which might yield a negative new index, too.
             *  In that case (new idx < 0) we subtract the new index
             *  from the highest possible index. Since it was modulated before
             *  this will yield always a number between 0 and the number of objects
             *  minus one.
             */
            var newIdx = this._currentSelectedObjIdx + numStepsLeft;
            newIdx %= this._targetChildren.length;
            if(newIdx < 0)
                newIdx = this._targetChildren.length - newIdx - 1;

            this._currentSelectedObjIdx += newIdx;
        },

        /** The object in the given objList (see initialize()) that is
         *  currently selected.
         *
         *  Selected means it is the object that is currently positioned
         *  in the local (0,0,1) direction.
         *
         *  @this {XMOT.interaction.behaviors.RingMenu}
         *  @return {Object}
         */
        currentSelectedObj: function()
        {
            return this._targetChildren[this._currentSelectedObjIdx];
        },

        // ========================================================================
        // --- Private ---
        // ========================================================================

        /** Translates all target children to their proper position on the ring.
         *
         *  @this {XMOT.interaction.behaviors.RingMenu}
         *  @private
         */
        _setupChildren: function()
        {
            this._attachedObjs = new Array();

            // object offset rotation vectors
            var objOffs = new Array();
            objOffs[0] = new window.XML3DVec3(0,0,this._radius);

            for(var i = 0; i < this._targetChildren.length; i++)
            {
                var curChild = this._targetChildren[i];

                // calculate relative translation
                if(i != 0)
                    objOffs[i] = this._stepRotation.rotateVec3(objOffs[i-1]);

                // setup object's translation
                var objXfm = XMOT.util.getOrCreateTransform(curChild, "t_" + this.ID + "_obj_" + i);
                objXfm.translation.set(objOffs[i]);
            }

            this.currentSelectedObjIdx = 0;
        },

        /** Creates local interpolators for each object and a root node interpolator.
         *  The local interpolators will do the inverse rotation of the root to always
         *  keep them facing towards the front.
         *
         *  @this {XMOT.interaction.behaviors.RingMenu}
         *  @private
         *  @param {Array.<Object>} objList
         */
        _createInterpolators: function()
        {
            for(var i = 0; i < this._targetChildren.length; i++)
            {
                // setup object interpolator
                var pol = document.createElementNS(XML3D.x3dNS,
                                                   "x3d:OrientationInterpolator");

                pol.setAttribute("id", "oi_obj_" + this.ID + "_obj_" + i);
                pol.setAttribute("key", "0 1");
                pol.setAttribute("keyValue", "0 1 0 0 0 1 0 0");

                this._objInterpolators.push(pol);
            }

            /* create root interpolator.
             */
            var rpol = document.createElementNS(XML3D.x3dNS,
                                                          "x3d:OrientationInterpolator");

            rpol.setAttribute("id", "oi_root_" + this.ID);
            rpol.setAttribute("key", "0 1");
            rpol.setAttribute("keyValue", "0 1 0 0 0 1 0 0");

            this._rootInterpolator = rpol;
        },

        /** Start an animation by setting the interpolator attributes
         *  and invoking XML3D.startAnimation()
         *
         *  @this {XMOT.interaction.behaviors.RingMenu}
         *  @private
         *
         *  @param {!Object} pol the X3D interpolator
         *  @param {!Object} tarEl the element on which to start the animation
         *  @param {string} startRot initial orientation string
         *  @param {string} endRot final orientation string
         */
        _startAnimation: function(pol, tarEl, startRot, endRot)
        {
            pol.setAttribute("keyValue", startRot + " " + endRot);

            var polId = pol.getAttribute("id");
            var xfmId = XMOT.util.transform(tarEl).getAttribute("id");

            if(XML3D.isAnimationRunning(polId, xfmId, "rotation"))
                return;

            XML3D.startAnimation(polId, xfmId, "rotation", 500);
        }
    });
}());
