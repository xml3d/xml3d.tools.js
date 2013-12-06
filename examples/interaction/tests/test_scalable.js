
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
