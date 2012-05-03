/** @namespace **/
var XMOT = XMOT || {};

/** @define {string} */
XMOT.version = '%VERSION%';

(function() {

    /**
     * A MotionFactory.
     * @interface
     */
    function MotionFactory() {};

    /**
     * A Moveable.
     * @interface
     */
    function Moveable() {};
    Moveable.prototype.draw = function() {};

}());
