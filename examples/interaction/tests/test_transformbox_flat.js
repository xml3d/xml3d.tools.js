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
    cameraCtrl = new XMOT.MouseKeyboardFlyController($("#defaultView")[0].parentNode);
    cameraCtrl.attach();

    // xfm box creation
    var target = $("#g_target")[0];
    var tarXfm = XMOT.ClientMotionFactory.createTransformable(target);

    xfmBox = new XMOT.interaction.widgets.TransformBox("myXfmBox", tarXfm);
    xfmBox.attach();

    xfmBoxOn = true;
    $("#b_togglebox").val("Detach Widget");
}

function toggleTransformBox()
{
    if(xfmBoxOn)
    {
        xfmBoxOn = false;
        xfmBox.detach();
        $("#b_togglebox").val("Attach Widget");
    }
    else
    {
        xfmBoxOn = true;
        xfmBox.attach();
        $("#b_togglebox").val("Detach Widget");
    }
}
