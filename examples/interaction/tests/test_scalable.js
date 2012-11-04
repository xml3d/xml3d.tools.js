
window.addEventListener("load", onLoad);

var sensor = null; 
var sensorActive = true;

function onLoad()
{
    if(sensorActive)
        attachSensor();

    if (XML3D.Xml3dSceneController)
        XML3D.Xml3dSceneController.detachAllControllers();
}

function attachSensor()
{
    var target = $("#g_target")[0];
    var tarMov = (new XMOT.ClientMotionFactory).createMoveable(target);
    
    sensor = new XMOT.interaction.behaviors.Scaler("myScaler", 
            [target], tarMov, true); 
    
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
    var xfm = XMOT.util.transform($("#g_target")[0]);

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
