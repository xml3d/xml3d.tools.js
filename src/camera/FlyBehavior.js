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
    XMOT.FlyBehavior = new XMOT.Class(XMOT.CameraBehavior, {

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

            this.callSuper(targetViewGroup, options);

            this._moveSpeed = 1;
            if(options !== undefined && options.moveSpeed !== undefined)
                this._moveSpeed = options.moveSpeed;
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
         *  @return {number}
         */
        getMoveSpeed: function() {
            return this._moveSpeed;
        },

        /**
         *  @this {XMOT.FlyBehavior}
         *  @param {number} speed
         */
        setMoveSpeed: function(speed) {
            this._moveSpeed = speed;
        },

        /**
         *  @this {XMOT.FlyBehavior}
         *  @param {boolean} doInvertDirection
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
         *  @param {boolean} doInvertDirection
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
         *  @return {window.XML3DVec3}
         */
        _getLookDirection: function() {

            var curRot = this.target.getOrientation();

            var defaultDirection = new window.XML3DVec3(0, 0, -1);
            var lookDirection = curRot.rotateVec3(defaultDirection).normalize();

            return lookDirection;
        },

        /**
         *  @this {XMOT.FlyBehavior}
         *  @param {window.XML3DVec3} direction
         *  @private
         */
        _translateCamera: function(direction) {

            var transl = direction.scale(this._moveSpeed);
            this.target.translate(transl);
        }
    });
}());
