window.addEventListener("load", onLoad, false);

var camCtrl = null;
var camRadios = null;
var camTransformable = null;

function onLoad(){

    camRadios = document.getElementsByName('camtype');
    $(camRadios).click(onChangeCamType);

	camTransformable = XMOT.ClientMotionFactory.createTransformable($("#g_camera")[0]);

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
		CamType = XMOT.MouseExamineController;
		options.examineOrigin = $("#shape_d1e22")[0].getBoundingBox().center();
		break;

	case "hemisphere":
		CamType = XMOT.MouseHemisphereController;
		break;

	case "fly":
		CamType = XMOT.MouseKeyboardFlyController;
		break;
	}

	if(!CamType)
		return;

	camCtrl = new CamType(camTransformable);
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