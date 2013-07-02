(function(){

    "use strict";

    /** This behavior will provide "examine" mode camera control on the given
     *  target transformable.
     *  This behavior does have no notion of the interaction device. All it needs
     *  are deltaX and deltaY values, from which it computes the camera pose.
     *
     *  Usage:
     *  o instantiate this class
     *  o call dolly() and rotate()
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
            this._scene = XMOT.util.getXml3dRoot(this.target.object);

            /** @private */
            this._rotateSpeed = 1;

            /** @private */
            this._dollySpeed = 40;

            /** @private */
            this._currentAction = this.NONE;

            /** @private */
            this._sceneRadius = this._getSceneRadius();

            /** @private */
            this._examineOrigin = this._getExamineOriginFromScene();

            this._parseOptions(options);
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         */
        lookAt: function(newExamineOrigin) {

            var initCamDirection = new XML3DVec3(0, 0, -1);

            var curDirection = this.target.getOrientation().rotateVec3(initCamDirection);
            var newDirection = newExamineOrigin.subtract(this.target.getPosition());
            newDirection = newDirection.normalize();

            var rotationToNewOrigin = new XML3DRotation();
            rotationToNewOrigin.setRotation(curDirection, newDirection);

            this.target.rotate(rotationToNewOrigin);
            this._examineOrigin.set(newExamineOrigin);
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         */
        dolly: function(deltaX, deltaY) {

            var coef = 0.2 * this._sceneRadius;
            var dy = coef * this._dollySpeed * deltaY;

            var translVec = this._rotateVecToViewSpace(new window.XML3DVec3(0, 0, dy));
            this.target.translate(translVec);
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @param {number} deltaXAngle delta value for rotation around the x-axis
         *  @param {number} deltaYAngle delta value for rotation around the y-axis
         */
        rotate: function(deltaXAngle, deltaYAngle) {
            var dx = -this._rotateSpeed * deltaXAngle * 2.0 * Math.PI;
            var dy = -this._rotateSpeed * deltaYAngle * 2.0 * Math.PI;

            var mx = new window.XML3DRotation(new window.XML3DVec3(1, 0, 0), dx);
            var my = new window.XML3DRotation(new window.XML3DVec3(0, 1, 0), dy);
            var result = mx.multiply(my);

            this._rotateAroundExamineOrigin(result);
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         */
        _rotateVecToViewSpace: function(vec) {
            return this.target.getOrientation().rotateVec3(vec);
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         */
        getRotateSpeed: function() {
            return this._rotateSpeed;
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         */
        getDollySpeed: function() {
            return this._dollySpeed;
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         */
        getSceneRadius: function() {
            return this._sceneRadius;
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         */
        getExamineOrigin: function() {
            return new window.XML3DVec3(this._examineOrigin);
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @private
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
         */
        _rotateAroundExamineOrigin: function(rot) {
            this.target.rotate(rot);
            var q = new XML3DRotation(this._rotateVecToViewSpace(rot.axis), rot.angle);
            var trans = q.rotateVec3(this.target.getPosition().subtract(this._examineOrigin));
            var newPos = this._examineOrigin.add(trans);
            this.target.setPosition(newPos);
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @private
         */
        _getSceneRadius: function() {
            var length = this._scene.getBoundingBox().size().length();
            return length * 0.5;
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @private
         */
        _getExamineOriginFromScene: function() {

            var orig = new window.XML3DVec3();

            var bb = this._scene.getBoundingBox();
            if (!bb.isEmpty()) {
                orig.set(bb.center());
            }

            return orig;
        }
    });
}());
