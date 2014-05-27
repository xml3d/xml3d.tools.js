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
window.addEventListener("load", onLoad, false);

var camCtrl = null;
var camRadios = null;
var camTransformable = null;

function onLoad()
{
    camRadios = document.getElementsByName('camtype');
    $(camRadios).click(onChangeCamType);

    camTransformable = XML3D.tools.MotionFactory.createTransformable($("#g_camera")[0]);

    onChangeCamType();
}

function onChangeCamType()
{
    if (camCtrl)
    {
        camCtrl.detach();
        camCtrl = null;
    }

    var CamType = null;
    var options = {};

    switch (getCamType())
    {
    case "examine":
        CamType = XML3D.tools.ExamineController;
        options.examineOrigin = $("#shape_d1e22")[0].getBoundingBox().center();
        options.dollySpeed = 5;
        break;

    case "fly":
        options = {
            moveSpeed: 0.2,
            rotateSpeed: 2
        };
        CamType = XML3D.tools.MouseKeyboardFlyController;
        break;

    case "touch":
        options.behavior = {rotateSpeed: 0.2};
        CamType = XML3D.tools.TouchFlyController;
        break;

    case "customfly":
        CamType = XML3D.tools.MouseKeyboardFlyController;
        options = {
            rotateSpeed: 0.5,
            moveSpeed: 0.5,
            fastMovementMultiplier: 10,
            controls: {
                rotationActivator: XML3D.tools.MOUSEBUTTON_RIGHT,
                fastMovementActivator: XML3D.tools.KEY_F,
                left: XML3D.tools.KEY_LEFT,
                right: XML3D.tools.KEY_RIGHT,
                forward: XML3D.tools.KEY_UP,
                backward: XML3D.tools.KEY_DOWN
            }
        }
        break;

    default:
        return;
    }

    camCtrl = new CamType(camTransformable, options);
    camCtrl.attach();
}

function getCamType()
{
    for (var i = 0; i < camRadios.length; i++)
    {
        if (camRadios[i].checked)
            return camRadios[i].value;
    }

    return "none";
}

