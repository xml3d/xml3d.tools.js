
var sensors = null;
var xml3d = null;

var active = false; 

function initScene()
{
    xml3d = document.getElementById("MyXml3d");

    $("#group1").append(XMOT.creation.box(xml3d));
    $("#group2").append(XMOT.creation.box(xml3d));
    $("#group3").append(XMOT.creation.box(xml3d));

    sensors = new Array(); 
    
    toggle();
}

function attachSensor()
{
    var fac = new XMOT.ClientMotionFactory(); 
    var xfm1 = fac.createTransformable($("#group1")[0]);
    var xfm2 = fac.createTransformable($("#group2")[0]);
    var xfm3 = fac.createTransformable($("#group3")[0]); 
    
    sensors[0] = new XMOT.interaction.widgets.SingleAxisRotator(
        "myxrot", xfm1, "x"
    );
    sensors[1] = new XMOT.interaction.widgets.SingleAxisRotator(
        "myyrot", xfm2, "y"
    );
    sensors[2] = new XMOT.interaction.widgets.SingleAxisRotator(
        "myzrot", xfm3, "z"
    );
}

function detachSensor()
{
    sensors[0].detach();
    sensors[1].detach(); 
    sensors[2].detach(); 
    sensors = new Array(); 
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
