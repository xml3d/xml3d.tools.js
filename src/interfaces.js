/** @namespace **/
var XMOT = XMOT || {};

/** @define {string} */
XMOT.version = '%VERSION%';

(function() {

    /**
     * A MotionFactory.
     * @interface
     */
    var MotionFactory = function() {
    };
    var m = MotionFactory.prototype;

    //functions
    m.createMoveable = function(){};

    /**
     * A Moveable.
     * @interface
     */
    var Moveable = function() {
    };
    var p = Moveable.prototype;

    //functions
    p.setPosition = function(){};
    p.setOrientation = function(){};
    p.translate = function(){};
    p.rotate = function(){};

    //export to namespace
    XMOT.MotionFactory = MotionFactory;
    XMOT.Moveable = Moveable;
}());
