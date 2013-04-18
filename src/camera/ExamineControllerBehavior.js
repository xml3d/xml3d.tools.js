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
         */
        initialize: function(targetViewTransformable, options) {

            this.target = targetViewTransformable;

            /** @private */
            this._scene = XMOT.util.getXml3dRoot(targetViewTransformable.object);

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
        dolly: function(deltaX, deltaY) {

            var coef = 0.2 * this._sceneRadius;
            var dy = coef * this._dollySpeed * deltaY;

            var translVec = this.rotateVecToViewSpace(new window.XML3DVec3(0, 0, dy));
            this.target.translate(translVec);
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         */
        rotate: function(deltaX, deltaY) {
            var dx = -this._rotateSpeed * deltaX * 2.0 * Math.PI;
            var dy = -this._rotateSpeed * deltaY * 2.0 * Math.PI;

            var mx = new window.XML3DRotation(new window.XML3DVec3(0, 1, 0), dx);
            var my = new window.XML3DRotation(new window.XML3DVec3(1, 0, 0), dy);
            var result = mx.multiply(my);

            this._rotateAroundPoint(result, this._examineOrigin);
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         */
        rotateVecToViewSpace: function(vec) {
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
            if(options.sceneRadius !== undefined)
                this._sceneRadius = options.sceneRadius;
            if(options.examineOrigin !== undefined)
                this._examineOrigin = options.examineOrigin;
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @private
         */
        _rotateAroundPoint: function(rot, point) {
            this.target.rotate(rot);
            var q = new XML3DRotation(this.rotateVecToViewSpace(rot.axis), rot.angle);
            var trans = q.rotateVec3(this.target.getPosition().subtract(point));
            var newPos = point.add(trans);
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