(function() {

    "use strict";

    /** This controller takes a camera target and provides animation using
     *  points of interest. POIs can be added and removed. One can navigate
     *  to next, previous or specific POIs.
     *
     *  @constructor
     */
    XMOT.CameraAnimationController = new XMOT.Class({

        /**
         *  @this {XMOT.CameraAnimationController}
         *  @param {Element|Transformable} targetViewGroup
         *  @param {Object=} options
         *
         *  Options:
         *      o moveToTime: time in milliseconds used for camera pose animation, default: 3000
         */
        initialize: function(targetViewGroup, options) {

            if(!options) {
                options = {};
            }
            if(!options.moveToTime) {
                options.moveToTime = 3000;
            }

            this.target = XMOT.util.getOrCreateTransformable(targetViewGroup);

            /** @private */
            this._idGenerator = new XMOT.util.IDGenerator();
            /** @private */
            this._pointOfInterests = new XMOT.util.Map();
            /** @private */
            this._moveToTime = options.moveToTime;

            /** @private
             *  @type {string}
             */
            this._currentPointOfInterestID = null;

            /** @private */
            this._movementInProgress = false;
        },

        /**
         *  @this {XMOT.CameraAnimationController}
         *  @return {boolean}
         */
        movementInProgress: function() {
            return this._movementInProgress;
        },

        /**
         *  @this {XMOT.CameraAnimationController}
         *  @param {window.XML3DVec3} position
         *  @param {window.XML3DRotation} orientation
         *  @param {number=} moveToTime. Default: class instance's moveToTime
         *  @return {string} id of the newly added point of interest
         */
        addPOI: function(position, orientation, moveToTime) {

            var id = this._idGenerator.newID();
            if(moveToTime === undefined)
                moveToTime = this._moveToTime;

            var poi = {
                id: id,
                position: position,
                orientation: orientation,
                moveToTime: moveToTime
            };
            this._pointOfInterests.add(id, poi);

            if(this._currentPointOfInterestID == null) {
                this._currentPointOfInterestID = id;
            }

            return id;
        },

        /**
         *  @this {XMOT.CameraAnimationController}
         *  @param {string} id of the point of interest to remove
         */
        removePOI: function(id) {
            this._pointOfInterests.remove(id);
        },

        /**
         *  @this {XMOT.CameraAnimationController}
         */
        clearPOIs: function() {
            this.stopMovementToPOI();

            this._pointOfInterests.clear();
            this._currentPointOfInterestID = null;
            this._idGenerator.reset();
        },

        /**
         *  @this {XMOT.CameraAnimationController}
         *  @param {function()=} moveToFinishedCallback
         */
        moveToNextPOI: function(moveToFinishedCallback) {

            var nextPOI = this._pointOfInterests.getNext(this._currentPointOfInterestID)[0].id;
            this.moveToPOI(nextPOI, moveToFinishedCallback);
        },

        /**
         *  @this {XMOT.CameraAnimationController}
         *  @param {function()=} moveToFinishedCallback
         */
        moveToPreviousPOI: function(moveToFinishedCallback) {

            var previousPOI = this._pointOfInterests.getPrevious(this._currentPointOfInterestID)[0].id;
            this.moveToPOI(previousPOI, moveToFinishedCallback);
        },

        /**
         *  @this {XMOT.CameraAnimationController}
         *  @param {string} id of the point of interest to move to
         *  @param {Object=} options
         *  @return {boolean} true if movement has actually been started
         *
         *  available options:
         *  o moveToFinishedCallback: invoked when the animation is finished
         *  o moveToTime: default: the moved-to POI's moveToTime
         */
        moveToPOI: function(id, options) {

            if(this._pointOfInterests.size() < 1 ||
                this._movementInProgress || this.target.movementInProgress()) {
                return false;
            }

            var nextPOI = this._pointOfInterests.get(id)[0];

            if(!options)
                options = {};
            if(!options.moveToFinishedCallback)
                options.moveToFinishedCallback = function() {};
            if(!options.moveToTime)
                options.moveToTime = nextPOI.moveToTime;

            this._currentPointOfInterestID = id;
            this._movementInProgress = true;

            var internalFinishedCallback = function() {
                this._moveToFinished(options.moveToFinishedCallback);
            }.bind(this);

            this.target.moveTo(nextPOI.position, nextPOI.orientation, options.moveToTime, {
                queueing: false,
                callback: internalFinishedCallback
            });

            return true;
        },

        /**
         *  @this {XMOT.CameraAnimationController}
         */
        stopMovementToPOI: function() {

            this.target.stop();
            this._moveToFinished();
        },

        /**
         *  @this {XMOT.CameraAnimationController}
         *  @private
         *  @param {function()=} moveToFinishedCallback
         */
        _moveToFinished: function(moveToFinishedCallback) {
            this._movementInProgress = false;
            if(moveToFinishedCallback !== undefined)
                moveToFinishedCallback();
        }
    });
}());
