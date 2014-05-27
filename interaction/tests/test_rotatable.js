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
var sensor = null;
var xml3d = null;
var target = null;
var cameraCtrl = null;

var trackballActive = false;

function initScene()
{
    cameraCtrl = new XML3D.tools.MouseExamineController($("#controller_view")[0].parentNode);
    cameraCtrl.attach();

    xml3d = document.getElementById("MyXml3d");

    target = $("#group1")[0];
    target.appendChild(XML3D.tools.creation.box(xml3d));

    toggleActivation();
}

function attachSensor()
{
    var tarXfm = XML3D.tools.MotionFactory.createTransformable(target);
    sensor = new XML3D.tools.interaction.behaviors.Rotater(
        "myRotater", [target],
        tarXfm
    );

    sensor.addListener("dragstart", onDragStart);
    sensor.addListener("dragend", onDragEnd);
    sensor.addListener("translchanged", onTranslChanged);
}

function detachSensor()
{
    sensor.detach();
    sensor = null;
}

function toggleActivation()
{
    if(trackballActive)
    {
        detachSensor();

        document.getElementById("toggleactivation").value = "Activate Rotatable";
        trackballActive = false;
    }
    else
    {
        attachSensor();

        document.getElementById("toggleactivation").value = "Deactivate Rotatable";
        trackballActive = true;
    }
}

function changeRestriction(axis)
{
    if(XML3D.tools.util.isDefined(axis))
        sensor.axisRestriction(axis);
    else
        sensor.clearAxisRestriction();
}

function resetRotation()
{
    sensor.resetRotation();
    onTranslChanged();
}

function onDragStart()
{
    $("#dragstatus").html("true");
}

function onDragEnd()
{
    $("#dragstatus").html("false");
}

function onTranslChanged()
{
    var xfm = XML3D.tools.util.transform($("#group1")[0]);
    $("#rotation").html(xfm.rotation.str());
}
