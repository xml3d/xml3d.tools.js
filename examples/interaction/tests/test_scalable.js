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

window.addEventListener("load", onLoad);

var sensor = null;
var sensorActive = true;
var cameraCtrl = null;

function onLoad()
{
    cameraCtrl = new XML3D.tools.MouseExamineController($("#controller_view")[0].parentNode);
    cameraCtrl.attach();

    if(sensorActive)
        attachSensor();
}

function attachSensor()
{
    var target = $("#g_target")[0];
    var tarXfm = XML3D.tools.MotionFactory.createTransformable(target);

    sensor = new XML3D.tools.interaction.behaviors.Scaler("myScaler",
            [target], tarXfm, true);

    sensor.addListener("translchanged", onTranslChanged);

    $("#togglesensor").val("Deactivate Sensor");
}

function detachSensor()
{
    sensor.detach();
    sensor = null;

    $("#togglesensor").val("Activate Sensor");
}

function onTranslChanged()
{
    var xfm = XML3D.tools.util.transform($("#g_target")[0]);

    $("#scale").text(xfm.scale.str());
}

function toggleSensor()
{
    if (sensorActive)
        detachSensor();
    else
        attachSensor();

    sensorActive = !sensorActive;
}
