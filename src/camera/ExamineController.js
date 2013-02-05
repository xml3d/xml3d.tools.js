(function() {

    /**
     * @constructor
     */
    var ExamineController = function(cameraGroup, opt) {
        var cam = typeof cameraGroup == 'string' ? document.getElementById(cameraGroup) : cameraGroup;

        /**
         * Constraint
         *
         * @private
         * @type {ConstraintCollection}
         */
        this.constraint = new XMOT.ConstraintCollection();
        var factory = new XMOT.ClientMotionFactory();
        /**
         * The Moveable
         *
         * @private
         * @type {Moveable}
         */
        this.moveable = factory.createMoveable(cam, this.constraint);
        var xml3d = this.getScene(cam) || {};
        this.canvas = {};
        this.canvas.width = xml3d.width || 800;
        this.canvas.height = xml3d.height || 600;

        opt = opt || {};
        this.rotateSpeed = opt.rotateSpeed || 1;
        this.dollySpeed = opt.dollySpeed || 40;
        this.sceneRadius = opt.sceneRadius || this.getSceneRadius(xml3d);
        this.revolveAroundPoint = opt.revolveAroundPoint || this.getRevolveAroundPointFromScene(xml3d);

        this.lastPos = {
            x : -1,
            y : -1
        };
    };

    ExamineController.NONE = 0;
    ExamineController.ROTATE = 1;
    ExamineController.DOLLY = 2;

    ExamineController.prototype.action = ExamineController.NONE;

    ExamineController.prototype.addConstraint = function(constraint) {
        this.constraint.addConstraint(constraint);
    }

    ExamineController.prototype.getScene = function(element) {
        var xml3d = element;
        while (xml3d.nodeName != "xml3d" && xml3d.parentNode)
            xml3d = xml3d.parentNode;
        return xml3d && xml3d.nodeName == "xml3d" ? xml3d : null;
    };

    ExamineController.prototype.getSceneRadius = function(xml3d) {
        if (xml3d && xml3d.getBoundingBox) {
            var length = xml3d.getBoundingBox().size().length();
            return length * 0.5;
        }
        return 1;
    };

    ExamineController.prototype.getRevolveAroundPointFromScene = function(xml3d) {
        if (xml3d && xml3d.getBoundingBox) {
            var bb = xml3d.getBoundingBox();
            if (!bb.isEmpty()) {
                var c = bb.center();
                return vec3.create([ c.x, c.y, c.z ]);
            }
        }
        return vec3.create([ 0, 0, 0 ]);
    };

    ExamineController.prototype.rotateAroundPoint = function(rot, point) {
        this.moveable.rotate(rot);
        var aa = XMOT.quaternionToAxisAngle(rot);
        var q = XMOT.axisAngleToQuaternion(this.inverseTransformOf(aa.axis), aa.angle);
        var trans = quat4.multiplyVec3(q, vec3.subtract(this.moveable.getPosition(), point, vec3.create()), vec3.create());
        this.moveable.setPosition(vec3.add(point, trans, vec3.create()));
    };

    ExamineController.prototype.inverseTransformOf = function(vec) {
        return quat4.multiplyVec3(this.moveable.getOrientation(), vec, vec3.create());
    };

    ExamineController.prototype.start = function(pos, action) {
        this.lastPos.x = pos.x;
        this.lastPos.y = pos.y;
        this.action = action || ExamineController.NONE;
    };

    ExamineController.prototype.stop = function() {
        this.action = ExamineController.NONE;
    };

    ExamineController.prototype.doAction = function(pos) {
        if (!this.action)
            return;

        var canvas = this.canvas;

        switch (this.action) {
        case (ExamineController.DOLLY):
            var coef = 0.2 * this.sceneRadius;
            var dy = coef * this.dollySpeed * (pos.y - this.lastPos.y) / canvas.height;
            this.moveable.translate(this.inverseTransformOf([ 0, 0, dy ]));
            break;
        case (ExamineController.ROTATE):
            var dx = -this.rotateSpeed * (pos.x - this.lastPos.x) * 2.0 * Math.PI / canvas.width;
            var dy = -this.rotateSpeed * (pos.y - this.lastPos.y) * 2.0 * Math.PI / canvas.height;

            var mx = XMOT.axisAngleToQuaternion([ 0, 1, 0 ], dx);
            var my = XMOT.axisAngleToQuaternion([ 1, 0, 0 ], dy);
            var result = quat4.multiply(mx, my);
            this.rotateAroundPoint(result, this.revolveAroundPoint);
            break;
        }
        this.lastPos.x = pos.x;
        this.lastPos.y = pos.y;
    };

    XMOT.ExamineController = ExamineController;
}());
