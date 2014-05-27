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

    /** This behavior provides "fly" mode camera control on the given
     *  camera transformable.
     *  This behavior does have no notion of the interaction device. All it needs
     *  are deltaX and deltaY values, from which it computes the camera pose.
     *
     *  Usage:
     *  o instantiate this class
     *  o call rotate(), move{Forward,Backward}(), step{Left,Right}()
     *
     *  @constructor
     */
    XML3D.tools.FlyBehavior = new XML3D.tools.Class(XML3D.tools.CameraBehavior, {

        /**
         *  @this {XML3D.tools.FlyBehavior}
         *  @param {Element|Transformable} targetViewGroup
         *  @param {Object} options
         *
         *  options:
         *  o rotateSpeed
         *  o moveSpeed
         *  o fastMovementMultiplier: how much faster movement during fast movement should be. Default: 3.
         */
        initialize: function(targetViewGroup, options) {

            this.callSuper(targetViewGroup, options);

            options = options || {};
            this._moveSpeed = options.moveSpeed || 1;
            this._fastMovementMultiplier = options.fastMovementMultiplier || 3;
        },

        /**
         *  @this {XML3D.tools.FlyBehavior}
         *  @param {boolean} moveFast
         */
        moveForward: function(moveFast) {
            this._moveInCamDirection(false, moveFast === true);
        },

        /**
         *  @this {XML3D.tools.FlyBehavior}
         *  @param {boolean} moveFast
         */
        moveBackward: function(moveFast) {
            this._moveInCamDirection(true, moveFast === true);
        },

        /**
         *  @this {XML3D.tools.FlyBehavior}
         *  @param {boolean} moveFast
         */
        stepRight: function(moveFast) {
            this._stepRight(false, moveFast === true);
        },

        /**
         *  @this {XML3D.tools.FlyBehavior}
         *  @param {boolean} moveFast
         */
        stepLeft: function(moveFast) {
            this._stepRight(true, moveFast === true);
        },

        /**
         *  @this {XML3D.tools.FlyBehavior}
         *  @return {number}
         */
        getMoveSpeed: function() {
            return this._moveSpeed;
        },

        /**
         *  @this {XML3D.tools.FlyBehavior}
         *  @param {number} speed
         */
        setMoveSpeed: function(speed) {
            this._moveSpeed = speed;
        },

        /**
         *  @this {XML3D.tools.FlyBehavior}
         *  @return {number}
         */
        getFastMovementMultiplier: function() {
            return this._fastMovementMultiplier;
        },

        /**
         *  @this {XML3D.tools.FlyBehavior}
         *  @param {number} speed
         */
        setFastMovementMultiplier: function(speed) {
            this._fastMovementMultiplier = speed;
        },

        /**
         *  @this {XML3D.tools.FlyBehavior}
         *  @param {boolean} doInvertDirection
         *  @param {boolean} moveFast
         *  @private
         */
        _stepRight: function(doInvertDirection, moveFast) {

            var lookDirection = this.getLookDirection();

            var stepDirection = lookDirection.cross(new XML3DVec3(0,1,0));

            if(doInvertDirection) {
                stepDirection = stepDirection.scale(-1);
            }

            this._translateCamera(stepDirection, moveFast);
        },

        /**
         *  @this {XML3D.tools.FlyBehavior}
         *  @param {boolean} doInvertDirection
         *  @param {boolean} moveFast
         *  @private
         */
        _moveInCamDirection: function(doInvertDirection, moveFast) {

            var moveDirection = this.getLookDirection();

            if(doInvertDirection) {
                moveDirection = moveDirection.scale(-1);
            }

            this._translateCamera(moveDirection, moveFast);
        },

        /**
         *  @this {XML3D.tools.FlyBehavior}
         *  @param {window.XML3DVec3} direction
         *  @param {boolean} moveFast
         *  @private
         */
        _translateCamera: function(direction, moveFast) {

            var speed = this._moveSpeed;
            if(moveFast)
                speed *= this._fastMovementMultiplier;
            var transl = direction.scale(speed);
            this.target.translate(transl);
        }
    });
}());
