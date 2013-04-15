(function(){

    "use strict";

    /**
     *  @constructor
     */
    XMOT.MouseExamineController = new XMOT.Class(XMOT.util.Attachable, {

        // interaction types
        NONE: 0,
        ROTATE: 1,
        DOLLY: 2,

        initialize: function(targetViewTransformable, options) {

            /** @private */
            this._targetXml3d = XMOT.util.getXml3dRoot(targetViewTransformable.object);

            /** @private */
            this._transformable = targetViewTransformable;

            /** @private */
            this._canvasWidth = this._targetXml3d.width || 800;

            /** @private */
            this._canvasHeight = this._targetXml3d.height || 600;

            /** @private */
            this._currentAction = this.NONE;

            /** @private */
            this._lastMousePos = {
                x : -1,
                y : -1
            };

            /** @private */
            this._rotateSpeed = 1;

            /** @private */
            this._dollySpeed = 40;

            /** @private */
            this._sceneRadius = this._getSceneRadius();

            /** @private */
            this._examineOrigin = this._getExamineOriginFromScene();

            /** @private */
            this._eventDispatcher = this._createDefaultEventDispatcher();

            this._parseOptions(options);
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @protected
         *  @override
         */
        onAttach: function() {
            this._toggleAttached(true);
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @protected
         *  @override
         */
        onDetach: function() {
            this._toggleAttached(false);
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @private
         */
        _toggleAttached: function(doAttach) {

            var regFn = this._eventDispatcher.on.bind(this._eventDispatcher);

            if(!doAttach) {
                regFn = this._eventDispatcher.off.bind(this._eventDispatcher);
            }

            regFn(this._targetXml3d, "mousedown", this._onXML3DMouseDown.bind(this));
            regFn(document.body, "mousemove", this._onBodyMouseMove.bind(this));
            regFn(document.body, "mouseup", this._onBodyMouseUp.bind(this));
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @private
         */
        _createDefaultEventDispatcher: function() {

            var disp = new XMOT.util.EventDispatcher();

            disp.registerCustomHandler("mousedown", function(evt){
                if(evt.button === XMOT.MOUSEBUTTON_LEFT
                || evt.button === XMOT.MOUSEBUTTON_RIGHT)
                    return true;

                return false;
            });

            return disp;
        },

        /**
         *  @this {XMOT.MouseExamineController}
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
            if(options.eventDispatcher)
                this._eventDispatcher = options.eventDispatcher;
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @private
         */
        _doDolly: function(posX, posY) {

            var coef = 0.2 * this._sceneRadius;
            var dy = coef * this._dollySpeed * (posY - this._lastMousePos.y) / this._canvasHeight;

            var translVec = this._rotateVecToWorldSpace(new window.XML3DVec3(0, 0, dy));
            this._transformable.translate(translVec);
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @private
         */
        _doRotate: function(posX, posY) {

            var dx = -this._rotateSpeed * (posX - this._lastMousePos.x) * 2.0 * Math.PI / this._canvasWidth;
            var dy = -this._rotateSpeed * (posY - this._lastMousePos.y) * 2.0 * Math.PI / this._canvasHeight;

            var mx = new window.XML3DRotation(new window.XML3DVec3(0, 1, 0), dx);
            var my = new window.XML3DRotation(new window.XML3DVec3(1, 0, 0), dy);
            var result = mx.multiply(my);

            this._rotateAroundPoint(result, this._examineOrigin);
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @private
         */
        _rotateAroundPoint: function(rot, point) {
            this._transformable.rotate(rot);
            var q = new XML3DRotation(this._rotateVecToWorldSpace(rot.axis), rot.angle);
            var trans = q.rotateVec3(this._transformable.getPosition().subtract(point));
            var newPos = point.add(trans);
            this._transformable.setPosition(newPos);
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @private
         */
        _rotateVecToWorldSpace: function(vec) {
            return this._transformable.getOrientation().rotateVec3(vec);
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @private
         */
        _getSceneRadius: function() {
            var length = this._targetXml3d.getBoundingBox().size().length();
            return length * 0.5;
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @private
         */
        _getExamineOriginFromScene: function() {

            var orig = new window.XML3DVec3();

            var bb = this._targetXml3d.getBoundingBox();
            if (!bb.isEmpty()) {
                orig.set(bb.center());
            }

            return orig;
        },

        // --- Callbacks ---

        /**
         *  @this {XMOT.MouseExamineController}
         *  @private
         */
        _onXML3DMouseDown: function(evt) {

            this._currentAction = this.ROTATE;
            if(evt.button === XMOT.MOUSEBUTTON_RIGHT)
                this._currentAction = this.DOLLY;

            this._lastMousePos.x = evt.pageX;
            this._lastMousePos.y = evt.pageY;
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @private
         */
        _onBodyMouseMove: function(evt) {

            switch (this._currentAction) {
            case this.DOLLY:
                this._doDolly(evt.pageX, evt.pageY);
                break;

            case this.ROTATE:
                this._doRotate(evt.pageX, evt.pageY);
                break;

            case this.NONE:
                break;

            default:
                XML3D.debug.logWarning("XMOT.MouseExamineController: unknown action, skipping input parsing.");
                break;
            }

            this._lastMousePos.x = evt.pageX;
            this._lastMousePos.y = evt.pageY;
        },

        /**
         *  @this {XMOT.MouseExamineController}
         *  @private
         */
        _onBodyMouseUp: function(evt) {
            this._currentAction = this.NONE;
        }
    });
}());