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
XML3D.tools.namespace("XML3D.tools.util");

/**
 *  A plane with an origin and a normal. The special thing here is that the normal can be set
 *  by a normal directly, a group (whose orientation serves for the calculation) or by nothing
 *  in which case a plane parallel to the user's view is constructed.
 */
XML3D.tools.util.Plane = new XML3D.tools.Class({

    /**
     *  @this {XML3D.tools.util.Plane}
     */
    initialize: function(xml3d)
    {
        if(!XML3D.tools.util.isDefined(xml3d))
            throw new Error("XML3D.tools.util.Plane: no xml3d element given.");

        /** This vector will be used when computing the normal based on some orientations.
         *  There we need an "original" vector from which to rotate.
         *  @private
         */
        this._defaultNormal = new window.XML3DVec3(0,0,1);

        this._xml3d = xml3d;

        this._origin = new window.XML3DVec3();
        this._validNormal = new window.XML3DVec3();
        this._isNormalValid = false;

        this._userNormal = null;
        this._userOrientationGrp = null;
        /** If a group is used a tracker is used to update the group's transform on the fly.
         *  @private
         */
        this._userOrientationGrpTracker = null;
    },

    /** Set or retrieve the origin
     *
     *  @this {XML3D.tools.util.Plane}
     *  @param {window.XML3DVec3=} newOrigin
     *  @return {window.XML3DVec3} the origin
     */
    origin: function(newOrigin)
    {
        if(XML3D.tools.util.isDefined(newOrigin))
            this._origin.set(newOrigin);

        return new window.XML3DVec3(this._origin);
    },

    /** Set or retrieve the normal of the plane. The new normal
     *  can be a vector or a group. To instruct the plane to use
     *  the user's view use setOrientation() below.
     *
     *  @this {XML3D.tools.util.Plane}
     *  @param {window.XML3DVec3|!Object=} newNormal
     *  @return {window.XML3DVec3} the current normal
     */
    normal: function(newNormal)
    {
        if(XML3D.tools.util.isDefined(newNormal))
            this.setOrientation(newNormal);
        else if(!this._isNormalValid)
            this._updateOrientation();

        return this._validNormal;
    },

    /** Set a new orientation of the plane. The argument is optional.
     *  If none is given everything's reset and a plane perpendicular to the
     *  user's viewing direction is taken.
     *
     *  @this {XML3D.tools.util.Plane}
     *  @param {window.XML3DVec3|!Object=} newOrientation
     */
    setOrientation: function(newOrientation)
    {
        this._isNormalValid = false;

        // default: view-dependent, no user settings
        this._clearUserDefinitions();

        if(XML3D.tools.util.isDefined(newOrientation))
        {
            // use user-defined normal
            if(newOrientation.constructor === window.XML3DVec3)
            {
                this._userNormal = new window.XML3DVec3(newOrientation);
            }
            else // use user-defined group
            {
                this._userOrientationGrp = newOrientation;
                this._xfmTracker = new XML3D.tools.TransformTracker(newOrientation,
                        this.callback("_invalidateNormal"));
                this._xfmTracker.attach();
            }
        }
        else // user user-view
        {
            this._xfmTracker = new XML3D.tools.ViewTracker(this._xml3d,
                this.callback("_invalidateNormal"));
            this._xfmTracker.attach();
        }

        this._updateOrientation();
    },

    /**
     *  @this {XML3D.tools.util.Plane}
     */
    str: function()
    {
        return "[o: " + this.origin().str() + ", n: " + this.normal().str() + "]";
    },

    /**
     *  @private
     *  @this {XML3D.tools.util.Plane}
     */
    _clearUserDefinitions: function()
    {
        this._userNormal = null;
        this._userOrientationGrp = null;
        if(this._userOrientationGrpTracker)
            this._userOrientationGrpTracker.detach();
    },

    /**
     *  @private
     *  @this {XML3D.tools.util.Plane}
     */
    _updateOrientation: function()
    {
        // user set normal
        if(XML3D.tools.util.isDefined(this._userNormal))
        {
            this._validNormal.set(this._userNormal);
        }
        else
        {
            var orientMatrix = null;

            // user set group
            if(XML3D.tools.util.isDefined(this._userOrientationGrp))
            {
                orientMatrix = this._userOrientationGrp.getWorldMatrix();
            }
            else // take view as basis
            {
                var va = XML3D.util.getOrCreateActiveView(this._xml3d);
                orientMatrix = va.getWorldMatrix();
            }

            this._validNormal.set(orientMatrix.multiplyDir(this._defaultNormal));
        }

        this._validNormal.set(this._validNormal.normalize());
        this._isNormalValid = true;
    },

    /**
     *  @private
     *  @this {XML3D.tools.util.Plane}
     */
    _invalidateNormal: function()
    {
        this._isNormalValid = false;
    }
});
