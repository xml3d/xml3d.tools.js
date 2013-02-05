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
            this.moveable.translate(this.inverseTransformOf([ 0, 0, dollydy ]));
            this.radius = vec3.length(this.moveable.getPosition());
            break;

        case (XMOT.ExamineController.ROTATE):
            this.longitude += -(dx / canvas.width) * Math.PI / 2.0;
            this.latitude += (dy / canvas.height) * Math.PI / 4.0;
            this.latitude = Math.max(0, Math.min(Math.PI / 2.0, this.latitude));

            var cos_latitude = Math.cos(this.latitude);
            var cos_longitude = Math.cos(this.longitude);
            var sin_longitude = Math.sin(this.longitude);

            // Position
            var position = vec3.scale(vec3.normalize([cos_latitude * sin_longitude, Math.sin(this.latitude), cos_latitude * cos_longitude] , vec3.create()), this.radius);
            // Right
            var right = vec3.normalize([cos_longitude,0,-sin_longitude], vec3.create());

            // direction
            var direction = vec3.normalize(vec3.subtract([0,0,0], position));
            var orientation = quat4.create();
            quat4.setFromBasis(right, vec3.cross(right, direction, vec3.create()), vec3.negate(direction, vec3.create()), orientation);

            this.moveable.setPosition(position);
            this.moveable.setOrientation(orientation);

            break;
        }
        this.lastPos.x = pos.x;
        this.lastPos.y = pos.y;
    };

    HemisphereController.prototype.lookAt = function(target) {
        this.setViewDirection(vec3.subtract(target, this.moveable.getPosition(),vec3.create()));
    };

    HemisphereController.prototype.setViewDirection = function(dir) {
         if (vec3.length(dir) < 1E-10)
            return;

        var xAxis = vec3.cross(dir, quat4.multiplyVec3(this.moveable.getOrientation(),[0,1,0], vec3.create()), vec3.create());
        if (vec3.length(xAxis) < 1E-10)
        {
            quat4.multiplyVec3(this.moveable.getOrientation(),[1,0,0], xAxis);
        }
        var result = quat4.create();
        quat4.setFromBasis(xAxis, vec3.cross(xAxis,dir,vec3.create()), vec3.negate(dir), result);
        this.moveable.setOrientation(result);
    };

    XMOT.HemisphereController = HemisphereController;
}());
