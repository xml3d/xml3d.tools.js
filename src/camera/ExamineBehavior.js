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
    XMOT.ExamineBehavior = new XMOT.Class({

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @param {Element|Transformable} targetViewGroup
         *  @param {Object} options
         *
         *  options:
         *  o rotateSpeed, default 1
         *  o dollySpeed, default 40
         *  o examineOrigin, default: scene's bounding box center on which lookAtScene() is called
         *  o examineOriginResetDistance: default 1. When the target's transformation changes
         *      the internal state needs to be updated. The examination origin is set by offsetting
         *      it by a factor into the camera's forward direction. That factor is this option.
         *
         *  o {min,max}AngleXAxis: constraints for the rotation around the x-axis. Default is
         *      {-Math.PI/2, Math.PI/2} to avoid gimbal lock.
         *  o {min,max}AngleYAxis: constraints for the rotation around the y-axis. Default is
         *      {-Number.MAX_VALUE, Number.MAX_VALUE}.
         *
         *  The min and max values specify values that are NOT to be reached. They are modified
         *  with a bias of 0.01 (i.e. min is actually min + 0.01 and max is max - 0.01)
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
            this._examineOrigin = new window.XML3DVec3();

            /** @private */
            this._angleXAxis = 0;
            /** @private */
            this._angleYAxis =  0;
            /** @private */
            this._distanceExamineOriginTarget = 0;
            /** @private */
            this._dollyCoefficient = this._calculateDollyCoefficient();
            /** @private */
            this._examineOriginResetDistance = 1;

            /** @private */
            this._minAngleXAxis = -Math.PI / 2.0;
            this._maxAngleXAxis = Math.PI / 2.0;
            this._minAngleYAxis = -Number.MAX_VALUE;
            this._maxAngleYAxis = Number.MAX_VALUE;

            /** Helper to keep track when we are changing our own transformation.
             *  Since we will update internal values when the transformation changes
             *  from outside we have to know when not to do this.
             *
             *  @private
             */
            this._doOwnTransformChange = false;

            this._parseOptions(options);

            // no custom origin: look at the whole scene
            if(this._examineOrigin.equals(new window.XML3DVec3())) {
                this.lookAtScene();
            }
            else {
                this.lookAt(this._examineOrigin);
            }

            this._targetTracker = new XMOT.TransformTracker(this.target.object);
            this._targetTracker.xfmChanged = this.callback("_onTargetXfmChanged");
            this._targetTracker.attach();
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @return {window.XML3DVec3}
         */
        getExamineOrigin: function() {
            return new window.XML3DVec3(this._examineOrigin);
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @return {number}
         */
        getRotateSpeed: function() {
            return this._rotateSpeed;
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @return {number}
         */
        getDollySpeed: function() {
            return this._dollySpeed;
        },

        /** Resets the camera pose to look at the whole scene.
         *
         *  @this {XMOT.ExamineBehavior}
         *  @param {number=} distance to the scene center, default: scene's aabb diagonal
         */
        lookAtScene: function(distanceToSceneCenter) {

            var defaultDistance = 1;
            if(distanceToSceneCenter === undefined) {
                distanceToSceneCenter = defaultDistance;
            }

            var sceneCenter = new window.XML3DVec3(0,0,0);

            var bb = this._targetScene.getBoundingBox();
            if (!bb.isEmpty()) {
                sceneCenter.set(bb.center());

                if(distanceToSceneCenter === defaultDistance) {

                    var bbDiagonal = bb.size().length();
                    if(bbDiagonal > distanceToSceneCenter) {
                        distanceToSceneCenter = bbDiagonal;
                    }
                }
            }

            this.resetTargetPose(sceneCenter, distanceToSceneCenter);
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @param {window.XML3DVec3} targetPt
         */
        lookAt: function(targetPt) {

            this._examineOrigin.set(targetPt);
            this._updateDistanceExamineOriginTarget();

            var forward = this._examineOrigin.subtract(this.target.getPosition());
            forward = forward.normalize();

            var temporaryUp = this._rotateInTargetSpace(new window.XML3DVec3(0,1,0));

            var right = forward.cross(temporaryUp);
            if (right.length() < XMOT.math.EPSILON)
            {
                right = this._rotateInTargetSpace(new window.XML3DVec3(1,0,0));
            }
            right = right.normalize();

            var up = right.cross(forward);

            var orientation = new window.XML3DRotation();
            orientation.setFromBasis(right, up, forward.negate());

            this.rotate(orientation);
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @param {window.XML3DVec3} newExamineOrigin
         *  @param {number} distanceToExamineOrigin
         */
        resetTargetPose: function(newExamineOrigin, distanceToExamineOrigin) {

            this._examineOrigin.set(newExamineOrigin);
            this._distanceExamineOriginTarget = distanceToExamineOrigin;

            var positionOffset = new window.XML3DVec3(0, 0, this._distanceExamineOriginTarget);
            var targetPosition = this._examineOrigin.add(positionOffset);

            this._setTargetPosition(targetPosition);
            this._angleXAxis = this._angleYAxis = 0;
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @param {number} delta the value of how much to dolly from the current pose
         */
        dolly: function(delta) {

            var scaledDelta = this._dollySpeed * this._dollyCoefficient * delta;

            var translVec = new window.XML3DVec3(0, 0, scaledDelta);
            translVec = this.target.getOrientation().rotateVec3(translVec);

            this._translateTarget(translVec);

            this._updateDistanceExamineOriginTarget();
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @param {window.XML3DRotation} orientation
         */
        rotate: function(orientation) {

            var eulerAngles = XMOT.math.rotationToEulerXY(orientation);
            this.rotateByAngles(-eulerAngles.x, -eulerAngles.y);
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @param {number} deltaXAxis the value on how much to scale on the x-axis
         *  @param {number} deltaYAxis the value on how much to scale on the y-axis
         */
        rotateByAngles: function(deltaXAxis, deltaYAxis) {

            var yAxisAngle = this._angleYAxis - this._rotateSpeed * deltaYAxis;
            yAxisAngle = this._constrainYAxisAngle(yAxisAngle);
            var xAxisAngle = this._angleXAxis + this._rotateSpeed * deltaXAxis;
            xAxisAngle = this._constrainXAxisAngle(xAxisAngle);

            // Position
            var position = this._calculatePosition(xAxisAngle, yAxisAngle);

            // Right
            var cosAngleYAxis = Math.cos(yAxisAngle);
            var sinAngleYAxis = Math.sin(yAxisAngle);

            var right = new window.XML3DVec3(cosAngleYAxis,0,-sinAngleYAxis);
            right = right.normalize();

            // direction
            var direction = this._examineOrigin.subtract(position);
            direction = direction.normalize();

            // up
            var up = right.cross(direction);

            var orientation = new window.XML3DRotation();
            orientation.setFromBasis(right, up, direction.negate());

            // set values
            var oldPosition = this.target.getPosition();
            if(!this._setTargetPosition(position))
                return;

            if(!this._setTargetOrientation(orientation))
            {
                this._setTargetPosition(oldPosition);
                return;
            }

            this._angleXAxis = xAxisAngle;
            this._angleYAxis = yAxisAngle;
        },

        /** Constrain the given angle to lie within [_minAngleYAxis, maxAngleYAxis].
         *
         *  @this {XMOT.ExamineBehavior}
         *  @private
         *  @param angle
         *  @return {number}
         */
        _constrainYAxisAngle: function(angle) {
            return Math.max(this._minAngleYAxis+0.01, Math.min(this._maxAngleYAxis-0.01, angle));
        },

        /** Constrain the given angle to lie within [_minAngleXAxis, maxAngleXAxis].
         *
         *  @this {XMOT.ExamineBehavior}
         *  @private
         *  @param angle
         *  @return {number}
         */
        _constrainXAxisAngle: function(angle) {
            return Math.max(this._minAngleXAxis+0.01, Math.min(this._maxAngleXAxis-0.01, angle));
        },

        /**
         *  @this {XMOT.ExamineBehavior}
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
            if(options.examineOriginResetDistance !== undefined)
                this._examineOriginResetDistance = options.examineOriginResetDistance;
            if(options.minAngleXAxis !== undefined)
                this._minAngleXAxis = options.minAngleXAxis;
            if(options.maxAngleXAxis !== undefined)
                this._maxAngleXAxis = options.maxAngleXAxis;
            if(options.minAngleYAxis !== undefined)
                this._minAngleYAxis = options.minAngleYAxis;
            if(options.maxAngleYAxis !== undefined)
                this._maxAngleYAxis = options.maxAngleYAxis;
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @private
         */
        _updateDistanceExamineOriginTarget: function() {

            var tarToOrig = this._examineOrigin.subtract(this.target.getPosition());
            if(tarToOrig.length() < XMOT.math.EPSILON) {
                throw new Error("Examine origin and camera position coincide!");
            }
            this._distanceExamineOriginTarget = tarToOrig.length();
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @private
         *  @return {number}
         */
        _calculateDollyCoefficient: function() {
            return this._targetScene.getBoundingBox().size().length() * 0.5;
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @private
         *
         *  @return {window.XML3DVec3}
         */
        _calculatePosition: function(xAxisAngle, yAxisAngle) {

            var cosAngleXAxis = Math.cos(xAxisAngle);
            var cosAngleYAxis = Math.cos(yAxisAngle);
            var sinAngleYAxis = Math.sin(yAxisAngle);

            var position = new window.XML3DVec3(
                cosAngleXAxis * sinAngleYAxis,
                Math.sin(xAxisAngle),
                cosAngleXAxis * cosAngleYAxis);
            position = position.normalize();

            position = position.scale(this._distanceExamineOriginTarget);

            return position.add(this._examineOrigin);
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @private
         *
         *  @return {window.XML3DVec3}
         */
        _rotateInTargetSpace: function(vec) {
            return this.target.getOrientation().rotateVec3(vec);
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @private
         */
        _onTargetXfmChanged: function() {
            if(this._doOwnTransformChange)
                return;

            var position = this.target.getPosition();
            var orientation = this.target.getOrientation();

            // update orientation
            var eulerAngles = XMOT.math.rotationToEulerXY(orientation);
            this._angleXAxis = -eulerAngles.x;
            this._angleYAxis = eulerAngles.y;

            // update pose
            this._distanceExamineOriginTarget = this._examineOriginResetDistance;
            var forward = this._rotateInTargetSpace(new window.XML3DVec3(0,0,-1));
            forward = forward.scale(this._examineOriginResetDistance);
            this._examineOrigin.set(position.add(forward));
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @private
         *  @param {window.XML3DVec3} position
         *  @return {boolean} whether to use the position or not
         */
        _setTargetPosition: function(position) {
            this._doOwnTransformChange = true;
            var usePosition = this.target.setPosition(position);
            this._doOwnTransformChange = false;
            return usePosition;
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @private
         *  @param {window.XML3DRotation} orientation
         *  @return {boolean} whether to use the orientation
         */
        _setTargetOrientation: function(orientation) {
            this._doOwnTransformChange = true;
            var useOrientation = this.target.setOrientation(orientation);
            this._doOwnTransformChange = false;
            return useOrientation;
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @private
         *  @param {window.XML3DVec3} position
         */
        _translateTarget: function(translation) {
            this._doOwnTransformChange = true;
            this.target.translate(translation);
            this._doOwnTransformChange = false;
        }
    });
}());
