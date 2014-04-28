window.addEventListener("load", onLoad, false);

var camCtrl = null;
var camRadios = null;
var camTransformable = null;

function onLoad()
{
    camRadios = document.getElementsByName('camtype');
    $(camRadios).click(onChangeCamType);

    camTransformable = XML3D.tools.MotionFactory.createTransformable($("#g_camera")[0]);

    onChangeCamType();
}

function onChangeCamType()
{
    if (camCtrl)
    {
        camCtrl.detach();
        camCtrl = null;
    }

    var CamType = null;
    var options = {};

    switch (getCamType())
    {
    case "examine":
        CamType = XML3D.tools.ExamineController;
        options.examineOrigin = $("#shape_d1e22")[0].getBoundingBox().center();
        options.dollySpeed = 5;
        break;

    case "fly":
        options = {moveSpeed: 0.2, rotateSpeed: 2};
        CamType = XML3D.tools.MouseKeyboardFlyController;
        break;

    case "touch":
        options.behavior = {rotateSpeed: 0.2};
        CamType = XML3D.tools.TouchFlyController;
        break;

    case "customfly":
        CamType = XML3D.tools.MouseKeyboardFlyController;
        options = {
            behavior: {
                rotateSpeed: 0.5,
                moveSpeed: 0.5
            },
            controls: {
                rotationActivator: XML3D.tools.MOUSEBUTTON_RIGHT,
                left: XML3D.tools.KEY_LEFT,
                right: XML3D.tools.KEY_RIGHT,
                forward: XML3D.tools.KEY_UP,
                backward: XML3D.tools.KEY_DOWN
            }
        }
        break;

    default:
        return;
    }

    camCtrl = new CamType(camTransformable, options);
    camCtrl.attach();
}

function getCamType()
{
    for (var i = 0; i < camRadios.length; i++)
    {
        if (camRadios[i].checked)
            return camRadios[i].value;
    }

    return "none";
}


function createCustomFlyMouseEventDispatcher()
{
    var disp = new XML3D.tools.util.EventDispatcher();
    disp.registerCustomHandler("mousedown", function(evt){
        return evt.button === XML3D.tools.MOUSEBUTTON_RIGHT;
    });

    return disp;
}
