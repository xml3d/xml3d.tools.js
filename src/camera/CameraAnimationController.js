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
         *  @param {Object} poi
         *  @return {boolean} true if movement has actually been started
         *
         *  Attributes of poi:
         *  o id: id of the point of interest to move to
         *  o moveToTime: default: the moved-to POI's moveToTime
         */
        moveToPOI: function(poi, moveToFinishedCallback) {

            var nextPOI = this._pointOfInterests.get(poi.id)[0];

            this._currentPointOfInterestID = poi.id;
            this._movementInProgress = true;

            var internalFinishedCallback = function() {
                this._moveToFinished(moveToFinishedCallback);
            }.bind(this);

            this.target.moveTo(nextPOI.position, nextPOI.orientation, nextPOI.moveToTime, {
                queueing: false,
                callback: internalFinishedCallback
            });
        },

        /** Sequentially move to the given POIs, starting with the one at index 0 and
         *  continuing until the end of the array. If the whole action is finished
         *  invokes the optional callback.
         *
         *  @this {XMOT.CameraAnimationController}
         *  @param {Array.<{id:string,moveToTime:number}>} POIs, moveToTime is optional
         *  @param {function()=} moveToFinishedCallback
         *  @return {boolean} true if movement has actually been started
         */
        moveAlongPOIPath: function(POIs, moveToFinishedCallback) {

            if(this._pointOfInterests.size() < 1 ||
                this._movementInProgress || this.target.movementInProgress()) {
                return false;
            }

            var numPOIs = POIs.length;

            // Moving to a POI is asynchronous and will invoke a callback when the movement
            // is done. Thus, we construct a callback chain, that will trigger the movement
            // to the next POI. The last invokation of the callback will trigger the given
            // moveToFinishedCallback.
            var lastCallback = moveToFinishedCallback;
            var fn = function() {};
            var that = this;

            for(var i = numPOIs-1; i >= 0; i--) {

                (function(){
                    var opts = {};
                    opts.id = POIs[i].id;
                    if(POIs[i].moveToTime !== undefined)
                        opts.moveToTime = POIs[i].moveToTime;

                    var finishedCallback = lastCallback;

                    fn = function() {that.moveToPOI(opts, finishedCallback);}

                    lastCallback = fn;
                }());
            }

            fn();

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
