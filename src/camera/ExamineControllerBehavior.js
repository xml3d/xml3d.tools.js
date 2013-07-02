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
            this._latitude = 0;
            /** @private */
            this._longitude =  0;
            /** @private */
            this._hemisphereRadius = this._getHemisphereRadius();
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
            this._setViewDirection(targetPt.subtract(this.target.getPosition()));
            this.rotate(0,0);
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

            this._hemisphereRadius = this._getHemisphereRadius();
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @param {number} deltaXAxis the value on how much to scale on the x-axis
         *  @param {number} deltaYAxis the value on how much to scale on the y-axis
         */
        rotate: function(deltaXAxis, deltaYAxis) {

            this._longitude -= this._rotateSpeed * deltaYAxis * Math.PI / 2.0;
            this._latitude += this._rotateSpeed * deltaXAxis * Math.PI / 2.0;
            this._latitude = Math.max(-Math.PI / 2.0, Math.min(Math.PI / 2.0, this._latitude));

            var cos_latitude = Math.cos(this._latitude);
            var cos_longitude = Math.cos(this._longitude);
            var sin_longitude = Math.sin(this._longitude);

            // Position
            var position = new window.XML3DVec3(cos_latitude * sin_longitude, Math.sin(this._latitude),
                    cos_latitude * cos_longitude);
            position = position.normalize();
            position = position.scale(this._hemisphereRadius);

            // Right
            var right = new window.XML3DVec3(cos_longitude,0,-sin_longitude);
            right = right.normalize();

            // direction
            var direction = (new window.XML3DVec3(0,0,0)).subtract(position);
            direction = direction.normalize();

            // up
            var up = right.cross(direction);

            var orientation = new window.XML3DRotation();
            orientation.setFromBasis(right, up, direction.negate());

            this.target.setPosition(position);
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
        _getHemisphereRadius: function() {

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
        _setViewDirection: function(dir) {

            dir = dir.normalize();
            if (dir.length() < 1E-10)
                return;

            var yAxis = this.target.getOrientation().rotateVec3(new window.XML3DVec3(0,1,0));

            var xAxis = dir.cross(yAxis);
            if (xAxis.length() < 1E-10)
            {
                xAxis = this.target.getOrientation().rotateVec3(new window.XML3DVec3(1,0,0));
            }

            var orientation = new window.XML3DRotation();
            orientation.setFromBasis(xAxis, xAxis.cross(dir), dir.negate());

            this.target.setOrientation(orientation);
        }
    });
}());
