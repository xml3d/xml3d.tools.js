window.addEventListener("load", onLoad, false);

var gizmo = null;
var gizmo1 = null;
var cameraCtrl = null;
var targetMirror = null;

var gizmoRadios = null;

function onLoad() {

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
        break;

    case "rotate":
        createGizmosRotate();
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

function getRotationSpeed()
{
    var val = $("#i_rotationSpeed").val();
    if(!isNaN(val) || val <= 0)
        return val;
    else
    {
        alert("Enter a valid number greater than zero.");
        return 1;
    }
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
    });
    gizmo.attach();
};

function createGizmosRotate()
{
    gizmo = new XML3D.tools.interaction.widgets.RotateGizmo("myGizmo", {
        target: targetTransformable,
        rotationSpeed: getRotationSpeed(),
        geometry: {
            scale: new XML3DVec3(2, 2, 2),
            bandWidth: 1.1
        }
    });
    gizmo.attach();
};
