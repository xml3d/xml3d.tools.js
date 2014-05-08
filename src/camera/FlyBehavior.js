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
         */
        initialize: function(targetViewGroup, options) {

            this.callSuper(targetViewGroup, options);

            this._moveSpeed = 1;
            if(options !== undefined && options.moveSpeed !== undefined)
                this._moveSpeed = options.moveSpeed;
        },

        /**
         *  @this {XML3D.tools.FlyBehavior}
         */
        moveForward: function() {
            this._moveInCamDirection();
        },

        /**
         *  @this {XML3D.tools.FlyBehavior}
         */
        moveBackward: function() {
            this._moveInCamDirection(true);
        },

        /**
         *  @this {XML3D.tools.FlyBehavior}
         */
        stepRight: function() {
            this._stepRight();
        },

        /**
         *  @this {XML3D.tools.FlyBehavior}
         */
        stepLeft: function() {
            this._stepRight(true);
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
         *  @param {boolean} doInvertDirection
         *  @private
         */
        _stepRight: function(doInvertDirection) {

            var lookDirection = this.getLookDirection();

            var stepDirection = lookDirection.cross(new XML3DVec3(0,1,0));

            if(doInvertDirection) {
                stepDirection = stepDirection.scale(-1);
            }

            this._translateCamera(stepDirection);
        },

        /**
         *  @this {XML3D.tools.FlyBehavior}
         *  @param {boolean} doInvertDirection
         *  @private
         */
        _moveInCamDirection: function(doInvertDirection) {

            var moveDirection = this.getLookDirection();

            if(doInvertDirection) {
                moveDirection = moveDirection.scale(-1);
            }

            this._translateCamera(moveDirection);
        },

        /**
         *  @this {XML3D.tools.FlyBehavior}
         *  @param {window.XML3DVec3} direction
         *  @private
         */
        _translateCamera: function(direction) {

            var transl = direction.scale(this._moveSpeed);
            this.target.translate(transl);
        }
    });
}());
