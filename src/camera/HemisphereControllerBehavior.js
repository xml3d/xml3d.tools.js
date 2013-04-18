(function(){

    "use strict";

    /** This behavior will provide "examine" mode camera control on a hemisphere.
     *  This behavior does have no notion of the interaction device. All it needs
     *  are deltaX and deltaY values, from which it computes the camera pose.
     *
     *  Usage: call dolly() and rotate().
     *
     *  @constructor
     */
    XMOT.HemisphereControllerBehavior = new XMOT.Class(
        XMOT.ExamineControllerBehavior, {

        /**
         *  @this {XMOT.HemisphereControllerBehavior}
         */
        initialize: function(targetViewTransformable, options) {

            this.callSuper(targetViewTransformable, options);

            this._latitude = 0;
            this._longitude =  0;
            this._radius = 1;

            this.lookAt(this.getExamineOrigin());
        },

        /**
         *  @this {XMOT.HemisphereControllerBehavior}
         *  @override
         */
        dolly: function(deltaX, deltaY) {

            this.callSuper(deltaX, deltaY);
            this._radius = this.target.getPosition().length();
        },

        /**
         *  @this {XMOT.HemisphereControllerBehavior}
         *  @override
         */
        rotate: function(deltaX, deltaY) {

            this._longitude += deltaX * Math.PI / 2.0;
            this._latitude += deltaY * Math.PI / 4.0;
            this._latitude = Math.max(0, Math.min(Math.PI / 2.0, this._latitude));

            var cos_latitude = Math.cos(this._latitude);
            var cos_longitude = Math.cos(this._longitude);
            var sin_longitude = Math.sin(this._longitude);

            // Position
            var position = new window.XML3DVec3(cos_latitude * sin_longitude, Math.sin(this._latitude),
                    cos_latitude * cos_longitude);
            position = position.normalize();
            position = position.scale(this._radius);

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
         *  @this {XMOT.HemisphereControllerBehavior}
         */
        lookAt: function(targetPt) {
            this._setViewDirection(targetPt.subtract(this.target.getPosition()));
        },

        /**
         *  @this {XMOT.HemisphereControllerBehavior}
         *  @private
         */
        _setViewDirection: function(dir) {
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