window.addEventListener("load", onLoad, false);

var gizmo = null;
var camCtrl = null;

function onLoad() {

    var targetGroup = $("#g_mainTarget")[0];
    var targetTransformable = XMOT.ClientMotionFactory.createTransformable(targetGroup);

    gizmo = new XMOT.interaction.widgets.RotateGizmo("myGizmo", {target:targetTransformable});
    gizmo.attach();

    var initialRotation = new XML3DRotation(new XML3DVec3(0, 0, 0), 0);
    cameraCtrl = new XMOT.ExamineController("g_camera");

    $("#xml3dMain").mousedown(onXML3DMouseDown);
    $(document.body).mousemove(onBodyMouseMove);
    $(document.body).mouseup(onBodyMouseUp);

    $("#b_detach").click(onClickDetachButton);
};

var mouseDown = false;

function onXML3DMouseDown(evt) {

    mouseDown = true;
    cameraCtrl.start({x: evt.pageX, y: evt.pageY}, XMOT.ExamineController.ROTATE);
};

function onBodyMouseMove(evt) {
    if(!mouseDown)
        return;

    cameraCtrl.doAction({x: evt.pageX, y: evt.pageY});
};

function onBodyMouseUp(evt) {
    cameraCtrl.stop({x: evt.pageX, y: evt.pageY});
};

var isAttached = true;

function onClickDetachButton() {
    isAttached = !isAttached;

    if(isAttached)
    {
        gizmo.attach();
        $("#b_detach").val("Detach");
    }
    else
    {
        gizmo.detach();
        $("#b_detach").val("Attach");
    }
}
