window.addEventListener("load", onLoad, false);

var gizmo = null;
var gizmo1 = null;
var camCtrl = null;
var targetMirror = null;

var gizmoRadios = null;

function onLoad() {

    var targetGroup = $("#g_mainTarget")[0];
    targetTransformable = XMOT.ClientMotionFactory.createTransformable(targetGroup);

    gizmoRadios = document.getElementsByName('gizmotype');
    $(gizmoRadios).click(onChangeGizmoType);
    onChangeGizmoType();

    var viewXfmable = XMOT.ClientMotionFactory.createTransformable($("#v_camera")[0].parentNode);
    cameraCtrl = new XMOT.MouseHemisphereController(viewXfmable, {
        examineOrigin: new XML3DVec3(0,0,-10)
    });
    cameraCtrl.attach();

};

function onChangeGizmoType()
{
    detachGizmos();

    switch(getGizmoType())
    {
    case "combined":
        createGizmosCombined();
        break;

    case "translaterotate":
        createGizmosTranslateRotate();
        break;

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

function createGizmosCombined()
{
    targetMirror = new XMOT.xml3doverlay.GroupMirror("myGroupMirror",
        targetTransformable);

    gizmo = new XMOT.interaction.widgets.TranslateGizmo("myGizmo", {
        mirror: targetMirror
    });
    gizmo.attach();

    gizmo1 = new XMOT.interaction.widgets.RotateGizmo("myGizmo2", {
        mirror: targetMirror,
        rotationSpeed: getRotationSpeed()
    });
    gizmo1.attach();
};

function createGizmosTranslateRotate()
{
    gizmo = new XMOT.interaction.widgets.TranslateRotateGizmo("myGizmo", {
        target: targetTransformable,
        rotationSpeed: getRotationSpeed()
    });
    gizmo.attach();
};

function createGizmosTranslate()
{
    gizmo = new XMOT.interaction.widgets.TranslateGizmo("myGizmo", {
        target: targetTransformable
    });
    gizmo.attach();
};

function createGizmosRotate()
{
    gizmo = new XMOT.interaction.widgets.RotateGizmo("myGizmo", {
        target: targetTransformable,
        rotationSpeed: getRotationSpeed()
    });
    gizmo.attach();
};
