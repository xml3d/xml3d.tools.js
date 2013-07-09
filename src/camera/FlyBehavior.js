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
    XMOT.FlyBehavior = new XMOT.Class(XMOT.util.Attachable, {

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

            var options = options || {};

            this._rotateSpeed = options.rotateSpeed || 1;
            this._moveSpeed = options.moveSpeed || 1;

            this._initialRotation = new XML3DRotation();
            this._yAxisAngle = 0;
            this._xAxisAngle = 0;
            this._maxXAxisAngle = Math.PI/2 - 0.2;

            /** Helper to keep track when we are changing our own transformation.
             *  Since we will update internal values when the transformation changes
             *  from outside we have to know when not to do this.
             *
             *  @private
             */
            this._doOwnTransformChange = false;
            /** @private */
            this._ignoreRotationAnimations = false;

            /** @private */
            this._targetTracker = new XMOT.TransformTracker(this.target.object);
            this._targetTracker.xfmChanged = this.callback("_onTargetXfmChanged");

            this._setInitialRotation(this.target.getOrientation());
        },

        /**
         *  @this {XMOT.FlyBehavior}
         */
        rotate: function(deltaX, deltaY) {

            var deltaXAxis = -this._rotateSpeed * deltaX * 2.0 * Math.PI;
            var deltaYAxis = -this._rotateSpeed * deltaY * 2.0 * Math.PI;

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

            this._doOwnTransformChange = true;
            this.target.setOrientation(newRot);
            this._doOwnTransformChange = false;
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
            var direction = point.subtract(position);
            direction = direction.normalize();

            // create rotation from angle b/w initial and new direction
            var dirRot = new XML3DRotation();
            dirRot.setRotation(initCamDirection, direction);

            this._setInitialRotation(dirRot);
        },

        /**
         *  @this {XMOT.FlyBehavior}
         */
        setPosition: function(position) {
            this._doOwnTransformChange = true;
            this.target.setPosition(position);
            this._doOwnTransformChange = false;
        },

        /**
         *  @this {XMOT.FlyBehavior}
         */
        setOrientation: function(orientation) {
            this._setInitialRotation(orientation);
        },

        /**
         *  @this {XMOT.FlyBehavior}
         */
        getPosition: function() {
            return this.target.getPosition();
        },

        /**
         *  @this {XMOT.FlyBehavior}
         */
        getOrientation: function() {
            return this.target.getOrientation();
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
        ignoreRotationAnimations: function(doIgnore) {
            this._ignoreRotationAnimations = doIgnore;
        },

        /**
         *  @this {XMOT.FlyBehavior}
         *  @protected
         *  @override
         */
        onAttach: function() {
            this._targetTracker.attach();
        },

        /**
         *  @this {XMOT.FlyBehavior}
         *  @protected
         *  @override
         */
        onDetach: function() {
            this._targetTracker.detach();
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

            this.setPosition(newPos);
        },

        /**
         *  @this {XMOT.FlyBehavior}
         *  @private
         */
        _onTargetXfmChanged: function() {
            if(this._doOwnTransformChange)
                return;

            if(!this._ignoreRotationAnimations)
                this._setInitialRotation(this.target.getOrientation());
        },

        /**
         *  @this {XMOT.FlyBehavior}
         *  @private
         */
        _setInitialRotation: function(rot) {

            var euler = XMOT.math.rotationToEulerXY(rot);

            this._xAxisAngle = euler.x;
            this._yAxisAngle = euler.y;
            this._initialRotation.set(new XML3DRotation());
        }
    });
}());
