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

    cameraCtrl = new XMOT.ExamineController("g_camera");
    $("#xml3dMain").mousedown(onXML3DMouseDown);
    $(document.body).mousemove(onBodyMouseMove);
    $(document.body).mouseup(onBodyMouseUp);
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
        mirror: targetMirror
    });
    gizmo1.attach();
};

function createGizmosTranslateRotate()
{
    gizmo = new XMOT.interaction.widgets.TranslateRotateGizmo("myGizmo", {
        target: targetTransformable
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
        target: targetTransformable
    });
    gizmo.attach();
};

var mouseDown = false;

function onXML3DMouseDown(evt) {

    if(evt.button !== XMOT.MOUSEBUTTON_LEFT && evt.button !== XMOT.MOUSEBUTTON_RIGHT)
        return;

    var action = XMOT.ExamineController.ROTATE;
    if(evt.button === XMOT.MOUSEBUTTON_RIGHT)
        action = XMOT.ExamineController.DOLLY;

    mouseDown = true;
    cameraCtrl.start({x: evt.pageX, y: evt.pageY}, action);
};

function onBodyMouseMove(evt) {
    if(!mouseDown)
        return;

    cameraCtrl.doAction({x: evt.pageX, y: evt.pageY});
};

function onBodyMouseUp(evt) {
    cameraCtrl.stop({x: evt.pageX, y: evt.pageY});
};
