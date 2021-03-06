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

    XML3D.tools.namespace("XML3D.tools.interaction.behaviors");

    /** Simple 2DOF controlled rotator.
     *
     * Before usage the bounds have to be set. During dragging the given
     * coordinates are assumed to be in the ranges [0,maxX] and [0,maxY] for x and y
     * coordinates, respectively.
     *
     * The rotating speed can be set using the rotateSpeed attribute.
     *
     * The trackball remembers the rotations of previous rotations so that
     * a new drag operation starts at the last executed rotation. To reset
     * the rotation call resetRotationOffset() before starting to drag.
     *
     * Rotation idea taken from xml3d scene controller's rotate action.
     * See XML3D.Xml3dSceneController.prototype.mouseMoveEvent() "case(this.ROTATE)"
     * for more info.
     */
    XML3D.tools.interaction.behaviors.TrackBall = new XML3D.tools.Class({

        /** Initializes the trackball with the dimensions of the tracking space.
         *
         *  The dimensions are needed to normalize the dragging input.
         *
         *  @this {XML3D.tools.interaction.behaviors.TrackBall}
         *
         *  @param {number} maxX
         *  @param {number} maxY
         */
        initialize: function(maxX, maxY)
        {
            if(maxX && maxY)
                this.setBounds(maxX, maxY);

            this.rotationSpeed = 1;
            this.lastRotation = new window.XML3DRotation(); // last rotation calculated in drag()

            /** accumulated rotation of the lastRotation values of previous drag operations
             * Using rotationOffset we can remember the rotation of a drag operation and
             * use it as starting rotation in a next drag operation.
             * Without this every new drag operation would reset the object's rotation to zero
             * angle.
             */
            this.rotationOffset = new XML3DRotation();

            /** 2D start position of dragging
             *  @private
             */
            this._start2DPos = {x:0, y:0};
            /** @private */
            this._axisRestriction = null;
        },

        /** Sets the maximum x and y values. This is used for
         *  normalizing the 2D positions
         *
         *  @this {XML3D.tools.interaction.behaviors.TrackBall}
         *
         *  @param {number} maxX
         *  @param {number} maxY
         */
        setBounds: function(maxX, maxY)
        {
            this.maxX = maxX;
            this.maxY = maxY;
        },

        /** Clear the rotation offset
         *
         *  @this {XML3D.tools.interaction.behaviors.TrackBall}
         */
        resetRotationOffset: function()
        {
            this.rotationOffset = new window.XML3DRotation();
        },

        /** Restrict the rotation to x or y axis
         *
         *  @this {XML3D.tools.interaction.behaviors.TrackBall}
         *
         *  @param {string} [axis] the axis to restrict to. Can be "x", "y" or "z". Default: release
         *      the restriction.
         */
        axisRestriction: function(axis)
        {
            if(axis && (axis === "x" || axis === "y" || axis === "z"))
                this._axisRestriction = axis;
            else
                this._axisRestriction = null;

            return this._axisRestriction;
        },

        /** Sets the initial point on the sphere
         *
         *  @this {XML3D.tools.interaction.behaviors.TrackBall}
         *
         *  @param {number} x within [0,maxX]
         *  @param {number} y within [0,maxY]
         */
        dragStart: function(x, y)
        {
            this._start2DPos.x = x;
            this._start2DPos.y = y;
        },

        /** Remember the last output rotation as new offset.
         *
         *  @this {XML3D.tools.interaction.behaviors.TrackBall}
         */
        dragEnd: function()
        {
            this.rotationOffset = this.lastRotation;
        },

        /** calculate the rotation from start to current point on sphere.
         *
         *  @this {XML3D.tools.interaction.behaviors.TrackBall}
         *
         *  @param {number} x within [0,maxX]
         *  @param {number} y within [0,maxY]
         *  @return {XML3DRotation} the calculated rotation
         */
        drag: function(x, y)
        {
            var newRot = null;

            var fac = this.rotationSpeed * 2.0 * Math.PI;

            // clamp too big values
            if(x > this.maxX)
                x = this.maxX;
            if(y > this.maxY)
                y = this.maxY;

            // calculate deltas from start position
            var dx = (x - this._start2DPos.x) / this.maxX;
            dx *= fac;

            var dy = (y - this._start2DPos.y) / this.maxY;
            dy *= fac;

            var angle = dx + dy;

            // calculate rotation based on the axis restriction
            if(this._axisRestriction == "x")
            {
                newRot = new window.XML3DRotation(new window.XML3DVec3(1,0,0), angle);
            }
            else if(this._axisRestriction == "y")
            {
                newRot = new window.XML3DRotation(new window.XML3DVec3(0,1,0), angle);
            }
            else if(this._axisRestriction == "z")
            {
                newRot = new window.XML3DRotation(new window.XML3DVec3(0,0,1), angle);
            }
            else
            {
                var mx = new window.XML3DRotation(new window.XML3DVec3(0,1,0), dx);
                var my = new window.XML3DRotation(new window.XML3DVec3(1,0,0), dy);

                newRot = mx.multiply(my);
            }

            this.lastRotation = newRot.multiply(this.rotationOffset);

            return this.lastRotation;
        }
    });
}());
