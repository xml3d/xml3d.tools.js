
var xml3d = null;
var tracker = null;
var camCtrl = null;

window.addEventListener('load', initScene, false);

function initScene()
{
    xml3d = $("xml3d")[0];

	var camTransformable = XMOT.MotionFactory.createTransformable($("#g_myview")[0]);
    camCtrl = new XMOT.MouseKeyboardFlyController(camTransformable);
	camCtrl.attach();

    // setup tracker
    tracker = new XMOT.ViewTracker(xml3d, onViewXfmChanged);
    tracker.attach();
}

function onViewXfmChanged()
{
    var mat = XML3D.util.getOrCreateActiveView(xml3d).getWorldMatrix();

    var transl = new window.XML3DVec3(mat.m41, mat.m42, mat.m43);
    var rot = window.XML3DRotation.fromMatrix(mat);

    var target = $("#t_viewtrack")[0];
    target.setAttribute("translation", transl.str());
    target.setAttribute("rotation", rot.str());
}
