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

    /** Base class for other behaviors. There's not "the" idea behind it, but rather
     *  a collection of methods that are the same for all behaviors.
     *
     *  @constructor
     */
    XML3D.tools.CameraBehavior = new XML3D.tools.Class(XML3D.tools.util.Attachable, {

        /**
         *  @this {XML3D.tools.CameraBehavior}
         *  @param {Element|Transformable} targetViewGroup
         *  @param {Object=} options
         *
         *  options:
         *  o moveSpeed
         */
        initialize: function(targetViewGroup, options) {

            this.callSuper();

            this.target = XML3D.tools.util.getOrCreateTransformable(targetViewGroup);

            this._rotateSpeed = 1;

            if(options !== undefined && options.rotateSpeed !== undefined)
                this._rotateSpeed = options.rotateSpeed;
        },

        /**
         *  @this {XML3D.tools.CameraBehavior}
         *  @param {window.XML3DRotation} orientation
         *  @return {boolean} true if the rotate action was actually performed
         */
        rotate: function(orientation) {

            var eulerAngles = orientation.toEulerAngles();
            return this.rotateByAngles(eulerAngles.x, eulerAngles.y);
        },

        /**
         *  @this {XML3D.tools.CameraBehavior}
         *  @param {number} xAxisAngle in radians
         *  @param {number} yAxisAngle in radians
         *  @return {boolean} true if the rotate action was actually performed
         *
         */
        rotateByAngles: function(xAxisAngle, yAxisAngle) {

            var newOrientation = this.getNewCameraOrientation(xAxisAngle, yAxisAngle);
            return this.target.setOrientation(newOrientation);
        },

        /** Resets the camera pose to look at the whole scene.
         *
         *  @this {XML3D.tools.CameraBehavior}
         *  @param {number=} distanceToSceneCenter. Default: scene's aabb diagonal
         */
        lookAtScene: function(distanceToSceneCenter) {

            var sceneCenter = new XML3DVec3();

            var scene = XML3D.tools.util.getXml3dRoot(this.target.object);
            var bb = scene.getBoundingBox();
            if(!bb.isEmpty()) {
                sceneCenter.set(bb.center());

                if(distanceToSceneCenter === undefined) {
                    distanceToSceneCenter = bb.size().length();
                }
            }

            this.lookAt(sceneCenter, distanceToSceneCenter);
        },

        /**
         *  @this {XML3D.tools.CameraBehavior}
         *  @param {window.XML3DVec3} point
         *  @param {number=} distanceToPoint. Default: position is not affected
         */
        lookAt: function(point, distanceToPoint) {

            var initCamDirection = new XML3DVec3(0, 0, -1);

            var position = this.target.getPosition();
            var posToPoint = new XML3DVec3(0, 0, -1);
            if(!position.equals(point))
                posToPoint.set(point.subtract(position).normalize());

            var dirRot = new XML3DRotation();
            dirRot.setRotation(initCamDirection, posToPoint);

            this.target.setOrientation(dirRot);

            if(distanceToPoint !== undefined) {
                var pointToPos = posToPoint.negate().scale(distanceToPoint);
                this.target.setPosition(point.add(pointToPos));
            }
        },

        /**
         *  @this {XML3D.tools.CameraBehavior}
         *  @return {number}
         */
        getRotationSpeed: function() {
            return this._rotateSpeed;
        },

        /**
         *  @this {XML3D.tools.CameraBehavior}
         *  @param {number} speed
         */
        setRotationSpeed: function(speed) {
            this._rotateSpeed = speed;
        },

        /**
         *  @this {XML3D.tools.CameraBehavior}
         *  @return {window.XML3DVec3}
         */
        getLookDirection: function() {

            var curRot = this.target.getOrientation();

            var defaultDirection = new window.XML3DVec3(0, 0, -1);
            var lookDirection = curRot.rotateVec3(defaultDirection).normalize();

            return lookDirection;
        },

        /** Calculate and return the camera's orientation with the
         *  given angles applied. The rotation itself is not set in
         *  the camera. This is done in rotateByAngles().
         *
         *  @this {XML3D.tools.CameraBehavior}
         *  @protected
         *  @param {number} xAxisAngle in radians
         *  @param {number} yAxisAngle in radians
         *  @return {window.XML3DRotation}
         */
        getNewCameraOrientation: function(xAxisAngle, yAxisAngle) {

            xAxisAngle *= this._rotateSpeed;
            yAxisAngle *= this._rotateSpeed;

            var mx = new window.XML3DRotation(new window.XML3DVec3(1, 0, 0), xAxisAngle);
            var my = new window.XML3DRotation(new window.XML3DVec3(0, 1, 0), yAxisAngle);

            var currentOrient = this.target.getOrientation();
            return my.multiply(currentOrient.multiply(mx));
        }
    });
}());
