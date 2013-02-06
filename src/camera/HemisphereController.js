(function() {

    var HemisphereController = function(cameraGroup, opt) {
        XMOT.base(this, cameraGroup, opt);
        this.latitude = Math.PI / 4.0;
        this.longitude =  0;
        this.radius = 1200;
    };
    XMOT.inherit(HemisphereController, XMOT.ExamineController);


   HemisphereController.prototype.init = function(pos) {
        this.doAction({x: 0, y:0}, XMOT.ExamineController.ROTATE);
   };

   HemisphereController.prototype.doAction = function(pos, forceAction) {
        if (!this.action && !forceAction)
            return;

        var dy = pos.y - this.lastPos.y;
        var dx = pos.x - this.lastPos.x;

        var canvas = this.canvas;
        switch (this.action || forceAction) {
        case (XMOT.ExamineController.DOLLY):
            var dollydy = 0.2 * this.sceneRadius * this.dollySpeed * (pos.y - this.lastPos.y) / canvas.height;
            this.transformable.translate(this.inverseTransformOf(new window.XML3DVec3(0, 0, dollydy)));
            this.radius = this.transformable.getPosition().length();
            break;

        case (XMOT.ExamineController.ROTATE):
            this.longitude += -(dx / canvas.width) * Math.PI / 2.0;
            this.latitude += (dy / canvas.height) * Math.PI / 4.0;
            this.latitude = Math.max(0, Math.min(Math.PI / 2.0, this.latitude));

            var cos_latitude = Math.cos(this.latitude);
            var cos_longitude = Math.cos(this.longitude);
            var sin_longitude = Math.sin(this.longitude);

            // Position
            var position = new window.XML3DVec3(cos_latitude * sin_longitude, Math.sin(this.latitude),
                    cos_latitude * cos_longitude);
            position = position.normalize();
            position = position.scale(this.radius);

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

            this.transformable.setPosition(position);
            this.transformable.setOrientation(orientation);

            break;
        }
        this.lastPos.x = pos.x;
        this.lastPos.y = pos.y;
    };

    HemisphereController.prototype.lookAt = function(target) {

        this.setViewDirection(target.subtract(this.transformable.getPosition()));
    };

    HemisphereController.prototype.setViewDirection = function(dir) {
        if (dir.length() < 1E-10)
            return;

        var yAxis = this.transformable.getOrientation().rotateVec3(new window.XML3DVec3(0,1,0));

        var xAxis = dir.cross(yAxis);
        if (xAxis.length() < 1E-10)
        {
            xAxis = this.transformable.getOrientation().rotateVec3(new window.XML3DVec3(1,0,0));
        }

        var orientation = new window.XML3DRotation();
        orientation.setFromBasis(xAxis, xAxis.cross(dir), dir.negate());

        this.transformable.setOrientation(orientation);
    };

    XMOT.HemisphereController = HemisphereController;
}());
