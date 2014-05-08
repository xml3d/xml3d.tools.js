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
(function(){

    "use strict";

    XML3D.tools.namespace("XML3D.tools.xml3doverlay");

    /** A GroupMirror mirrors a given group in an own overlay.
     *  It creates the overlay and sets up a MirroredWidgetTarget.
     */
    XML3D.tools.xml3doverlay.GroupMirror = new XML3D.tools.Class(
        XML3D.tools.util.Attachable, {

        /**
         *  @this {XML3D.tools.xml3doverlay.GroupMirror}
         *  @param {string} id
         *  @param {XML3D.tools.Transformable} target
         *  @param {XML3D.tools.XML3DOverlay=} xml3dOverlay
         *
         *  The overlay is optional. If it is not given, one will be created
         *  with the xml3d element of the given target node.
         */
        initialize: function(id, target, xml3dOverlay)
        {
            this._realTarget = target;

            // overlay
            var xml3dTarget = XML3D.tools.util.getXml3dRoot(target.object);
            this._isSelfCreatedOverlay = (xml3dOverlay == undefined);
            if(!this._isSelfCreatedOverlay)
            {
                this._xml3dOverlay = xml3dOverlay;
            }
            else
            {
                this._xml3dOverlay = new XML3D.tools.xml3doverlay.XML3DOverlay(xml3dTarget);
                this._xml3dOverlay.attach();
            }

            // mirror the target node
            this._mirroredTarget = new XML3D.tools.xml3doverlay.MirroredWidgetTarget(
                id, this._xml3dOverlay, target);
        },

        onAttach: function()
        {
            if(this._isSelfCreatedOverlay)
                this._xml3dOverlay.attach();
            this._mirroredTarget.attach();
        },

        onDetach: function()
        {
            this._mirroredTarget.detach();
            if(this._isSelfCreatedOverlay)
                this._xml3dOverlay.detach();
        },

        /**
         *  @this {XML3D.tools.xml3doverlay.GroupMirror}
         *  @return {XML3D.tools.XML3DOverlay}
         */
        overlay: function()
        {
            return this._xml3dOverlay;
        },

        /**
         *  @this {XML3D.tools.xml3doverlay.GroupMirror}
         *  @return {XML3D.tools.Transformable} the target node that is mirrored
         */
        target: function()
        {
            return this._realTarget;
        },

        /** Returns a transformable for the mirrored target node with
         *  the given constraint.
         *
         *  @this {XML3D.tools.xml3doverlay.GroupMirror}
         *  @param {function(XML3DVec3,Object):boolean=} constraint
         *  @return {XML3D.tools.Transformable}
         */
        mirroredTarget: function(constraint)
        {
            return XML3D.tools.MotionFactory.createTransformable(
                this._mirroredTarget.getNode(), constraint);
        }
    });
}());
