var sensor = null;
var xml3d = null;
var target = null;
var cameraCtrl = null;

var trackballActive = false;

function initScene()
{
    cameraCtrl = new XMOT.MouseExamineController($("#controller_view")[0].parentNode);
    cameraCtrl.attach();

    xml3d = document.getElementById("MyXml3d");

    target = $("#group1")[0];
    target.appendChild(XMOT.creation.box(xml3d));

    toggleTrackBall();
}

function attachSensor()
{
    var tarXfm = XMOT.ClientMotionFactory.createTransformable(target);
    sensor = new XMOT.interaction.behaviors.Rotater(
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

function toggleTrackBall()
{
    if(trackballActive)
    {
        detachSensor();

        document.getElementById("toggletrackball").value = "Activate Trackball";
        trackballActive = false;
    }
    else
    {
        attachSensor();

        document.getElementById("toggletrackball").value = "Deactivate Trackball";
        trackballActive = true;
    }
}

function changeRestriction(axis)
{
    if(XMOT.util.isDefined(axis))
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
    var xfm = XMOT.util.transform($("#group1")[0]);
    $("#rotation").html($(xfm).attr("rotation"));
}
