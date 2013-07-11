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
    XMOT.FlyBehavior = new XMOT.Class({

        /**
         *  @this {XMOT.FlyBehavior}
         *  @param {Element|Transformable} targetViewGroup
         *  @param {Object} options
         *
         *  options:
         *  o rotateSpeed
         *  o moveSpeed
         */
        initialize: function(targetViewGroup, options) {

			this.target = XMOT.util.getOrCreateTransformable(targetViewGroup);

            this._rotateSpeed = 1;
            this._moveSpeed = 1;

            this._parseOptions(options);
        },

        /**
         *  @this {XMOT.FlyBehavior}
         */
        rotate: function(deltaX, deltaY) {

            var deltaXAxis = -this._rotateSpeed * deltaX * 2.0 * Math.PI;
            var deltaYAxis = -this._rotateSpeed * deltaY * 2.0 * Math.PI;

            var mx = new window.XML3DRotation();
            mx.setAxisAngle(new window.XML3DVec3(1, 0, 0), deltaXAxis);
            var my = new window.XML3DRotation();
            my.setAxisAngle(new window.XML3DVec3(0, 1, 0), deltaYAxis);

            var currentOrient = this.target.getOrientation();
            var newRot = my.multiply(currentOrient.multiply(mx));

            this.target.setOrientation(newRot);
        },

        /**
         *  @this {XMOT.FlyBehavior}
         */
        moveForward: function() {
            this._moveInCamDirection();
        },

        /**
         *  @this {XMOT.FlyBehavior}
         */
        moveBackward: function() {
            this._moveInCamDirection(true);
        },

        /**
         *  @this {XMOT.FlyBehavior}
         */
        stepRight: function() {
            this._stepRight();
        },

        /**
         *  @this {XMOT.FlyBehavior}
         */
        stepLeft: function() {
            this._stepRight(true);
        },

        /**
         *  @this {XMOT.FlyBehavior}
         */
        lookAt: function(point) {

            var initCamDirection = new XML3DVec3(0, 0, -1);

            // calculate new direction
            var position = this.getPosition();
            var direction = point.subtract(position).normalize();

            var dirRot = new XML3DRotation();
            dirRot.setRotation(initCamDirection, direction);

            this.target.rotate(dirRot);
        },

        getMoveSpeed: function() {
            return this._moveSpeed;
        },

        setMoveSpeed: function(speed) {
            this._moveSpeed = speed;
        },

        getRotationSpeed: function() {
            return this._rotateSpeed;
        },

        setRotationSpeed: function(speed) {
            this._rotateSpeed = speed;
        },

        /**
         *  @this {XMOT.FlyBehavior}
         */
        _parseOptions: function(options) {

            var options = options || {};

            if(options.rotateSpeed !== undefined)
                this._rotateSpeed = options.rotateSpeed;
            if(options.moveSpeed !== undefined)
                this._moveSpeed = options.moveSpeed;
        },

        /**
         *  @this {XMOT.FlyBehavior}
         *  @private
         */
        _moveInCamDirection: function(doInvertDirection) {

            var moveDirection = this._getLookDirection();

            if(doInvertDirection) {
                moveDirection = moveDirection.scale(-1);
            }

            this._translateCamera(moveDirection);
        },

        /**
         *  @this {XMOT.FlyBehavior}
         *  @private
         */
        _stepRight: function(doInvertDirection) {

            var lookDirection = this._getLookDirection();

            var stepDirection = lookDirection.cross(new XML3DVec3(0,1,0));

            if(doInvertDirection) {
                stepDirection = stepDirection.scale(-1);
            }

            this._translateCamera(stepDirection);
        },

        /**
         *  @this {XMOT.FlyBehavior}
         *  @private
         */
        _getLookDirection: function() {

            var curRot = this.target.getOrientation();

            var defaultDirection = new window.XML3DVec3(0, 0, -1);
            var lookDirection = curRot.rotateVec3(defaultDirection).normalize();

            return lookDirection;
        },

        /**
         *  @this {XMOT.FlyBehavior}
         *  @private
         */
        _translateCamera: function(direction) {

            var transl = direction.scale(this._moveSpeed);

            var newPos = this.target.getPosition().add(transl);

            this.target.setPosition(newPos);
        }
    });
}());
