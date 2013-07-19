(function() {

    "use strict";

    /** Base class for other behaviors. There's not "the" idea behind it, but rather
     *  a collection of methods that are the same for all behaviors.
     *
     *  @constructor
     */
    XMOT.CameraBehavior = new XMOT.Class(XMOT.util.Attachable, {

        /**
         *  @this {XMOT.CameraBehavior}
         *  @param {Element|Transformable} targetViewGroup
         *  @param {Object=} options
         *
         *  options:
         *  o moveSpeed
         */
        initialize: function(targetViewGroup, options) {

            this.callSuper();

            this.target = XMOT.util.getOrCreateTransformable(targetViewGroup);

            this._rotateSpeed = 1;

            if(options !== undefined && options.rotateSpeed !== undefined)
                this._rotateSpeed = options.rotateSpeed;
        },

        /**
         *  @this {XMOT.CameraBehavior}
         *  @param {window.XML3DRotation} orientation
         *  @return {boolean} true if the rotate action was actually performed
         */
        rotate: function(orientation) {

            var eulerAngles = orientation.toEulerAngles();
            return this.rotateByAngles(eulerAngles.x, eulerAngles.y);
        },

        /**
         *  @this {XMOT.CameraBehavior}
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
         *  @this {XMOT.CameraBehavior}
         *  @param {number=} distanceToSceneCenter. Default: scene's aabb diagonal
         */
        lookAtScene: function(distanceToSceneCenter) {

            var sceneCenter = new XML3DVec3();

            var scene = XMOT.util.getXml3dRoot(this.target.object);
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
         *  @this {XMOT.CameraBehavior}
         *  @param {window.XML3DVec3} point
         *  @param {number=} distanceToPoint. Default: position is not affected
         */
        lookAt: function(point, distanceToPoint) {

            var initCamDirection = new XML3DVec3(0, 0, -1);

            var position = this.getPosition();
            var posToPoint = point.subtract(position).normalize();

            var dirRot = new XML3DRotation();
            dirRot.setRotation(initCamDirection, posToPoint);

            this.target.setRotation(dirRot);

            if(distanceToPoint !== undefined) {
                var pointToPos = posToPoint.negate().scale(distanceToPoint);
                this.target.setPosition(point.add(pointToPos));
            }
        },

        /**
         *  @this {XMOT.CameraBehavior}
         *  @return {number}
         */
        getRotationSpeed: function() {
            return this._rotateSpeed;
        },

        /**
         *  @this {XMOT.CameraBehavior}
         *  @param {number} speed
         */
        setRotationSpeed: function(speed) {
            this._rotateSpeed = speed;
        },

        /** Calculate and return the camera's orientation with the
         *  given angles applied. The rotation itself is not set in
         *  the camera. This is done in rotateByAngles().
         *
         *  @this {XMOT.CameraBehavior}
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
