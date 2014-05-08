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
var trackball = null;
var xml3d = null;

function initScene()
{
    xml3d = document.getElementById("MyXml3d");

    trackball = new XML3D.tools.interaction.behaviors.TrackBall(1024, 768);
}

var dragging = false;

var trackballActive = false;

function toggleTrackBall()
{
    if(trackballActive)
    {
        $(xml3d).unbind("mouseup", onRootMouseUp);
        $(xml3d).unbind("mousemove", onRootMouseMove);

        $("#g_target").unbind("mousedown", onTargetMouseDown);

        $("#toggletrackball").val("Activate Trackball");
        trackballActive = false;
    }
    else
    {
        $(xml3d).mouseup(onRootMouseUp);
        $(xml3d).mousemove(onRootMouseMove);

        $("#g_target").mousedown(onTargetMouseDown);

        $("#toggletrackball").val("Deactivate Trackball");
        trackballActive = true;
    }
}

function resetRotation()
{
    trackball.resetRotationOffset();

    $("#t_target").attr("rotation", "0 0 1 0");
    $("#rotation").html("0 0 1 0");
}

function onRootMouseUp(evt)
{
    if(evt.button == XML3D.tools.MOUSEBUTTON_LEFT)
    {
        dragging = false;
        trackball.dragEnd();
        $("#dragstatus").html("false");
    }
}

function onTargetMouseDown(evt)
{
    if(evt.button == XML3D.tools.MOUSEBUTTON_LEFT)
    {
        dragging = true;
        trackball.dragStart(evt.pageX, evt.pageY);

        $("#dragstatus").html("true");
    }
}

function onRootMouseMove(evt)
{
    if(dragging)
    {
        var rot = trackball.drag(evt.pageX, evt.pageY);
        var rotStr = rot.axis.x + " " + rot.axis.y + " " + rot.axis.z
                    + " " + rot.angle;

        $("#t_target").attr("rotation", rotStr);
        $("#rotation").html(rotStr);
    }
}
