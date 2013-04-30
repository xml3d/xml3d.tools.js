var xml3d = null;
var xfmBoxOn = true;
var xfmBox = null;
var cameraCtrl = null;

window.addEventListener("load", onLoad);

function onLoad()
{
    // setup view
    $("#defaultView")[0].lookAt(new XML3DVec3(0, 0, 0));

    xml3d = $("xml3d")[0];

    cameraCtrl = new XMOT.MouseExamineController($("#defaultView")[0].parentNode, {
        examineOrigin: new XML3DVec3(0,0,-10)
    });
    cameraCtrl.attach();

    // xfm box creation
    var target = $("#g_target")[0];
    var tarXfm = XMOT.ClientMotionFactory.createTransformable(target);

    xfmBox = new XMOT.interaction.widgets.RotatorBox("myRotatorBox", tarXfm, 5);
    xfmBox.attach();
}

function toggleRotatorBox()
{
    if(xfmBoxOn)
    {
        xfmBox.detach();
        $("#b_togglebox").val("Attach RotatorBox");
    }
    else
    {
        xfmBox.attach();
        $("#b_togglebox").val("Detach RotatorBoxBox");
    }

    xfmBoxOn = !xfmBoxOn;
}
