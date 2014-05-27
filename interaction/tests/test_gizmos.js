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

var gizmo = null;
var gizmo1 = null;
var cameraCtrl = null;
var targetMirror = null;

var gizmoRadios = null;

function onLoad() {

    XML3D.options.setValue("renderer-faceculling", "back");

    var targetGroup = $("#g_mainTarget")[0];
    targetTransformable = XML3D.tools.MotionFactory.createTransformable(targetGroup);

    gizmoRadios = document.getElementsByName('gizmotype');
    $(gizmoRadios).click(onChangeGizmoType);

    cameraCtrl = new XML3D.tools.MouseKeyboardFlyController($("#v_camera")[0].parentNode, {
        rotateSpeed: 5
    });
    cameraCtrl.attach();

    XML3D.tools.util.fireWhenMeshesLoaded(targetGroup, onChangeGizmoType);
};

function onChangeGizmoType()
{
    detachGizmos();

    switch(getGizmoType())
    {
    case "translate":
        createGizmosTranslate();
        $("#translate-description").show();
        $("#rotate-description").hide();
        break;

    case "rotate":
        createGizmosRotate();
        $("#rotate-description").show();
        $("#translate-description").hide();
        break;

    default:
        $("#rotate-description").hide();
        $("#translate-description").hide();
        break;
    }
};

function getGizmoType()
{
    for (var i = 0; i < gizmoRadios.length; i++)
    {
        if (gizmoRadios[i].checked)
        {
            return gizmoRadios[i].value;
        }
    }

    return "none";
};

function detachGizmos()
{
    if(gizmo)
    {
        gizmo.detach();
        gizmo = null;
    }
    if(gizmo1)
    {
        gizmo1.detach();
        gizmo = null;
    }
    if(targetMirror)
    {
        targetMirror.detach();
        targetMirror = null;
    }
};

function createGizmosTranslate()
{
    gizmo = new XML3D.tools.interaction.widgets.TranslateGizmo("myGizmo", {
        target: targetTransformable
        // uncomment the line below to test disabling of specific component
        //, disabledComponents: ["xyplane", "yzplane", "xzplane"]
    });
    gizmo.attach();
};

function createGizmosRotate()
{
    gizmo = new XML3D.tools.interaction.widgets.RotateGizmo("myGizmo", {
        target: targetTransformable,
        geometry: {
            scale: new XML3DVec3(2, 2, 2),
            bandWidth: 1.1
        }
    });
    gizmo.attach();
};
