(function() {

    "use strict";

    /**
     * @constructor
     */
    XMOT.FlyControllerBehavior = new XMOT.Class({

        initialize: function(cameraTransformable, options) {

            var options = options || {};

            this.target = cameraTransformable;

            this._rotateSpeed = options.rotateSpeed || 1;
            this._moveSpeed = options.moveSpeed || 1;

            this._initialRotation = new XML3DRotation();
            this._yAxisAngle = 0;
            this._xAxisAngle = 0;
            this._maxXAxisAngle = Math.PI/2 - 0.2;

            this._setInitialRotation(cameraTransformable.getOrientation());
        },

        rotate: function(deltaX, deltaY) {

            var deltaXAxis = -this._rotateSpeed * deltaY * 2.0 * Math.PI;
            var deltaYAxis = -this._rotateSpeed * deltaX * 2.0 * Math.PI;

            this._xAxisAngle += deltaXAxis;
            this._yAxisAngle += deltaYAxis;

            if(this._xAxisAngle >= this._maxXAxisAngle)
                this._xAxisAngle = this._maxXAxisAngle;
            if(this._xAxisAngle <= -this._maxXAxisAngle)
                this._xAxisAngle = -this._maxXAxisAngle;

            var mx = new window.XML3DRotation(new window.XML3DVec3(1, 0, 0), this._xAxisAngle);
            var my = new window.XML3DRotation(new window.XML3DVec3(0, 1, 0), this._yAxisAngle);
            var rot = my.multiply(mx);

            var newRot = rot.multiply(this._initialRotation);

            this.target.setOrientation(newRot);
        },

        moveForward: function() {
            this._moveInCamDirection();
        },

        moveBackward: function() {
            this._moveInCamDirection(true);
        },

        stepRight: function() {
            this._stepRight();
        },

        stepLeft: function() {
            this._stepRight(true);
        },

        setPosition: function(position) {
            this.target.setPosition(position);
        },

        setOrientation: function(orientation) {
            this._setInitialRotation(orientation);
        },

        getPosition: function() {
            return this.target.getPosition();
        },

        getOrientation: function() {
            return this.target.getOrientation();
        },

        _moveInCamDirection: function(doInvertDirection) {

            var moveDirection = this._getLookDirection();

            if(doInvertDirection) {
                moveDirection = moveDirection.scale(-1);
            }

            this._translateCamera(moveDirection);
        },

        _stepRight: function(doInvertDirection) {

            var lookDirection = this._getLookDirection();

            var stepDirection = lookDirection.cross(new XML3DVec3(0,1,0));

            if(doInvertDirection) {
                stepDirection = stepDirection.scale(-1);
            }

            this._translateCamera(stepDirection);
        },

        _getLookDirection: function() {

            var curRot = this.target.getOrientation();

            var defaultDirection = new window.XML3DVec3(0, 0, -1);
            var lookDirection = curRot.rotateVec3(defaultDirection).normalize();

            return lookDirection;
        },

        _translateCamera: function(direction) {

            var transl = direction.scale(this._moveSpeed);

            var newPos = this.target.getPosition().add(transl);
            this.target.setPosition(newPos);
        },

        _setInitialRotation: function(rot) {

            var euler = this._toEuler(rot);

            this._xAxisAngle = euler.x;
            this._yAxisAngle = euler.y;
            this._initialRotation.set(new XML3DRotation());

            // align the target's orientation to compensate for precision errors
            this.rotate(0, 0);
        },

        _toEuler: function(rot) {

            // from: http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToEuler/
            //  - disregard for qxy + qzw case, since we never change z
            // and https://truesculpt.googlecode.com/hg-history/38000e9dfece971460473d5788c235fbbe82f31b/Doc/rotation_matrix_to_euler.pdf
            //  - disregard for two-fold solution of y, works up to now

            var q = rot.getQuaternion();

            var qxx = q[0]*q[0];
            var qxz = q[0]*q[2];
            var qxw = q[0]*q[3];
            var qyy = q[1]*q[1];
            var qyz = q[1]*q[2];
            var qyw = q[1]*q[3];
            var qzz = q[2]*q[2];

            var y = Math.atan2(2*(qyw + qxz), 1 - 2*(qyy + qzz));
            var x = Math.atan2(2*(qxw + qyz), 1 - 2*(qxx + qzz));
            if(Math.cos(y) < -0.01)
                x = -x;

            return {x: x, y: y};
        }
    });
}());
