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

var xml3d = null;
var tracker = null;
var camCtrl = null;

window.addEventListener('load', initScene, false);

function initScene()
{
    xml3d = $("xml3d")[0];

    var camTransformable = XML3D.tools.MotionFactory.createTransformable($("#g_myview")[0]);
    camCtrl = new XML3D.tools.MouseKeyboardFlyController(camTransformable);
    camCtrl.attach();

    // setup tracker
    tracker = new XML3D.tools.ViewTracker(xml3d, onViewXfmChanged);
    tracker.attach();
}

function onViewXfmChanged()
{
    var mat = XML3D.util.getOrCreateActiveView(xml3d).getWorldMatrix();

    var target = $("#t_viewtrack")[0];
    target.translation.set(mat.translation());
    target.rotation.set(mat.rotation());
}
