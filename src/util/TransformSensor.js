/*
Copyright (c) 2010-2014
              DFKI - German Research Center for Artificial Intelligence
              www.dfki.de

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
 so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/** A simple TransformSensor, similar to X3D's TransformSensor.
 *
 * You give it a bounding box and target node. The sensor tracks transformation changes
 * in the target node and notifies the listeners as soon as the bounding box
 * of the target node intersects with the given bounding box.
 *
 * The registered listeners for "start" and "end" have a single argument:
 * the associated transform sensor. Any additional information can be obtained from
 * that sensor.
 *
 * @extends XML3D.tools.util.Observable
 */
XML3D.tools.TransformSensor = new XML3D.tools.Class(
    XML3D.tools.util.Observable, {

	listenerTypes: [
        "start", "end" // args (this)
    ],

    /** Initializes the sensor with the given values and attaches the sensor to
     *  the target groups.
     *
     *  @this {XML3D.tools.TransformSensor}
     *
     *  @param {string} _id a unique identifier for this sensor
     *  @param {Array.<Object>} _tarGrps the groups of which to track transformation changes
     *  @param {XML3DBox} _bbox the bounding box to intersect the target groups with
     */
    initialize: function(_id, _tarGrps, _bbox)
    {
    	this.callSuper();

        this.ID = _id;
        this.xml3d = XML3D.tools.util.getXml3dRoot(_tarGrps[0]);
        this.targetGrps = _tarGrps;
        this.bbox = _bbox;

        /** all the target elements that currently intersect with this sensor's
         * bounding box.
         *
         * The type is: grp -> boolean. I.e. it is a set.
         */
        this.currentIntersectGrps = [];

        this._isAttached = false;
        this.attach();
    },

    /** @this {XML3D.tools.TransformSensor} */
    attach: function()
    {
        if(!this._isAttached)
        {
            this._observers = [];

            var grps = this.targetGrps;
            for(var i in grps)
            {
                var tar = grps[i];
                this._observers[tar] = new XML3D.tools.TransformTracker(tar);
                this._observers[tar].xfmChanged = this.callback("_xfmChanged");
                this._observers[tar].attach();
            }

            this._isAttached = true;
        }
    },

    /** @this {XML3D.tools.TransformSensor} */
    detach: function()
    {
        if(this._isAttached)
        {
            var obs = this._observers;
            for(var i in obs)
            {
                var o = obs[i];

                o.xfmChanged = function() {};
                o.detach();
            }

            this._observers = [];

            this._isAttached = false;
        }
    },

    /** Callback of internally used XML3D.tools.TransformTracker
     *
     *  @this {XML3D.tools.TransformSensor}
     *  @private
     *
     *  @param {!Object} tarNode
     */
    _xfmChanged: function(tarNode)
    {
        var tarBBox = XML3D.tools.util.getWorldBBox(tarNode);

        var isInt = this.bbox.intersects(tarBBox);
        var alreadyInt = this.currentIntersectGrps[tarNode];

        if(isInt && !alreadyInt) // new intersection (no intersection before)
        {
            this.currentIntersectGrps[tarNode] = true;
            this.notifyListeners("start", this);
        }
        else if(!isInt && alreadyInt) // intersection gone (and intersection before)
        {
            this.currentIntersectGrps[tarNode] = false;
            this.notifyListeners("end", this);
        }
    }
});
