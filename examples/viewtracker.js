
var xml3d = null;
var tracker = null;
var camCtrl = null;

window.addEventListener('load', initScene, false);

function initScene()
{
    xml3d = $("xml3d")[0];

    var camTransformable = XML3D.tools.MotionFactory.createTransformable($("#g_myview")[0]);
    camCtrl = new XML3D.tools.MouseKeyboardFlyController(camTransformable);
    camCtrl.attach();

    // setup tracker
    tracker = new XML3D.tools.ViewTracker(xml3d, onViewXfmChanged);
    tracker.attach();
}

function onViewXfmChanged()
{
    var mat = XML3D.util.getOrCreateActiveView(xml3d).getWorldMatrix();

    var target = $("#t_viewtrack")[0];
    target.translation.set(mat.translation());
    target.rotation.set(mat.rotation());
}
