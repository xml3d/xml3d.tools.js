var sensor = null;
var xml3d = null;
var g_sphere = null;

var active = false; 

function initScene()
{
    xml3d = document.getElementById("MyXml3d");

    $("#group1").append(XMOT.creation.box(xml3d));

    toggle();
}

function attachSensor()
{
    var xfm = XMOT.ClientMotionFactory.createTransformable($("#group1")[0]); 
    sensor = new XMOT.interaction.widgets.TranslateBox("mybox", xfm); 
    sensor.attach();
}

function detachSensor()
{
    sensor.detach(); 
    sensor = null; 
}

function toggle()
{
    if(active)
    {
        detachSensor();

        document.getElementById("toggle").value = "Attach";
        active = false;
    }
    else
    {
        attachSensor();

        document.getElementById("toggle").value = "Detach";
        active = true;
    }
}
