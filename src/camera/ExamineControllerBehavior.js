(function(){

    "use strict";

    /** This behavior will provide "examine" mode camera control on the given
     *  target transformable.
     *  This behavior does have no notion of the interaction device. All it needs
     *  are deltaX and deltaY values, from which it computes the camera pose.
     *
     *  Usage: call dolly() and rotate().
     *
     *  @constructor
     */
    XMOT.ExamineControllerBehavior = new XMOT.Class({

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @param {Element|Transformable} targetViewGroup
         *  @param {Object} options
         *
         *  options:
         *  o rotateSpeed, default 1
         *  o dollySpeed, default 40
         *  o examineOrigin, default scene's bounding box center
         */
        initialize: function(targetViewGroup, options) {

            this.target = XMOT.util.getOrCreateTransformable(targetViewGroup);

            /** @private */
            this._targetScene = XMOT.util.getXml3dRoot(this.target.object);

            /** @private */
            this._rotateSpeed = 1;
            /** @private */
            this._dollySpeed = 1;

            /** @private */
            this._examineOrigin = this._getExamineOriginFromScene();

            /** @private */
            this._angleXAxis = 0;
            /** @private */
            this._angleYAxis =  0;
            /** @private */
            this._distanceExamineOriginTarget = this._getDistanceExamineOriginTarget();
            /** @private */
            this._dollyCoefficient = this._calculateDollyCoefficient();

            this._parseOptions(options);
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @return {window.XML3DVec3}
         */
        getExamineOrigin: function() {
            return new window.XML3DVec3(this._examineOrigin);
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @return {number}
         */
        getRotateSpeed: function() {
            return this._rotateSpeed;
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @return {number}
         */
        getDollySpeed: function() {
            return this._dollySpeed;
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @param {window.XML3DVec3} targetPt
         */
        lookAt: function(targetPt) {
            this._examineOrigin.set(targetPt);
            /*
            TODO: rewrite the lookat-thing
            right now always assume looking down the negative z-axis and simply reset
            position.
            However, if there's an initial camera orientation, this should be the
            orientation, and thus that function becomes interesting again.

            this._lookAtExamineOrigin();
            this.rotate(0,0);

            TODO: incorporate constraint on angles.
            want: never look below the y=0 plane
            */

            this._angleXAxis = this._angleYAxis = 0;
            this.target.setPosition(this._calculateCurrentPosition());
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @param {number} delta the value of how much to dolly from the current pose
         */
        dolly: function(delta) {

            var scaledDelta = this._dollySpeed * this._dollyCoefficient * delta;

            var translVec = new window.XML3DVec3(0, 0, scaledDelta);
            translVec = this.target.getOrientation().rotateVec3(translVec);

            this.target.translate(translVec);

            this._distanceExamineOriginTarget = this._getDistanceExamineOriginTarget();
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @param {number} deltaXAxis the value on how much to scale on the x-axis
         *  @param {number} deltaYAxis the value on how much to scale on the y-axis
         */
        rotate: function(deltaXAxis, deltaYAxis) {

            this._angleYAxis -= this._rotateSpeed * deltaYAxis;
            var xAxisAngle = this._angleXAxis + this._rotateSpeed * deltaXAxis;
            this._angleXAxis = this._constrainXAxisAngle(xAxisAngle);

            // Position
            var position = this._calculateCurrentPosition();

            this.target.setPosition(position);

            // Right
            var cosAngleYAxis = Math.cos(this._angleYAxis);
            var sinAngleYAxis = Math.sin(this._angleYAxis);

            var right = new window.XML3DVec3(cosAngleYAxis,0,-sinAngleYAxis);
            right = right.normalize();

            // direction
            var direction = this._examineOrigin.subtract(position);
            direction = direction.normalize();

            // up
            var up = right.cross(direction);

            var orientation = new window.XML3DRotation();
            orientation.setFromBasis(right, up, direction.negate());
            this.target.setOrientation(orientation);
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @private
         *  @param {Object} options
         */
        _parseOptions: function(options) {

            var options = options || {};
            if(options.rotateSpeed !== undefined)
                this._rotateSpeed = options.rotateSpeed;
            if(options.dollySpeed !== undefined)
                this._dollySpeed = options.dollySpeed;
            if(options.examineOrigin !== undefined)
                this._examineOrigin = options.examineOrigin;
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @private
         *  @return {number}
         */
        _getDistanceExamineOriginTarget: function() {

            var tarToOrig = this._examineOrigin.subtract(this.target.getPosition());
            return tarToOrig.length();
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @private
         *  @return {number}
         */
        _calculateDollyCoefficient: function() {
            return this._targetScene.getBoundingBox().size().length() * 0.5;
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @private
         *  @return {window.XML3DVec3}
         */
        _getExamineOriginFromScene: function() {

            var orig = new window.XML3DVec3(0,0,0);

            var bb = this._targetScene.getBoundingBox();
            if (!bb.isEmpty()) {
                orig.set(bb.center());
            }

            return orig;
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @private
         */
        _lookAtExamineOrigin: function() {

            var lookDir = this._examineOrigin.subtract(this.target.getPosition());

            lookDir = lookDir.normalize();
            if (lookDir.length() < 1E-10)
                return;

            var yAxis = this.target.getOrientation().rotateVec3(new window.XML3DVec3(0,1,0));

            var xAxis = lookDir.cross(yAxis);
            if (xAxis.length() < 1E-10)
            {
                xAxis = this.target.getOrientation().rotateVec3(new window.XML3DVec3(1,0,0));
            }
            xAxis = xAxis.normalize();

            var yAxis = xAxis.cross(lookDir);

            var orientation = new window.XML3DRotation();
            orientation.setFromBasis(xAxis, yAxis, lookDir.negate());

            this.target.setOrientation(orientation);

            var eulerAngles = XMOT.math.rotationToEulerXY(orientation);
            this._angleXAxis = eulerAngles.x;
            this._angleYAxis = eulerAngles.y;
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @private
         *
         *  @return {window.XML3DVec3}
         */
        _calculateCurrentPosition: function() {
            var cosAngleXAxis = Math.cos(this._angleXAxis);
            var cosAngleYAxis = Math.cos(this._angleYAxis);
            var sinAngleYAxis = Math.sin(this._angleYAxis);

            var position = new window.XML3DVec3(
                cosAngleXAxis * sinAngleYAxis,
                Math.sin(this._angleXAxis),
                cosAngleXAxis * cosAngleYAxis);
            position = position.normalize();

            position = position.scale(this._distanceExamineOriginTarget);

            return position.add(this._examineOrigin);
        },

        /** Constrain the given angle to lie within [-90,90] degree interval to
         *  avoid gimbal lock.
         *
         *  @this {XMOT.ExamineControllerBehavior}
         *  @private
         *  @param angle
         *  @return {number}
         */
        _constrainXAxisAngle: function(angle) {
            return Math.max(-Math.PI / 2.0, Math.min(Math.PI / 2.0, angle));
        }
    });
}());
