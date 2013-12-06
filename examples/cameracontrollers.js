window.addEventListener("load", onLoad, false);

var camCtrl = null;
var camRadios = null;
var camTransformable = null;

function onLoad(){

    camRadios = document.getElementsByName('camtype');
    $(camRadios).click(onChangeCamType);

    camTransformable = XMOT.MotionFactory.createTransformable($("#g_camera")[0]);

    onChangeCamType();
};

function onChangeCamType() {

    if(camCtrl) {
        camCtrl.detach();
        camCtrl = null;
    }

    var CamType = null;
    var options = {};

    switch(getCamType())
    {
    case "examine":
        CamType = XMOT.ExamineController;
        options.examineOrigin = $("#shape_d1e22")[0].getBoundingBox().center();
        options.dollySpeed = 5;
        break;

    case "fly":
        options = {moveSpeed: 0.2, rotateSpeed: 2};
        CamType = XMOT.MouseKeyboardFlyController;
        break;

    case "touch":
        options.behavior = {rotateSpeed: 0.2};
        CamType = XMOT.TouchFlyController;
        break;
    }

    if(!CamType)
        return;

    camCtrl = new CamType(camTransformable, options);
    camCtrl.attach();
};

function getCamType()
{
    for (var i = 0; i < camRadios.length; i++)
    {
        if (camRadios[i].checked)
        {
            return camRadios[i].value;
        }
    }

    return "none";
};
