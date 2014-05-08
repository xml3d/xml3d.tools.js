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
