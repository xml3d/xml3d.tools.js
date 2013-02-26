
var xml3d = null;
var headLight = null;
var tracker = null;

window.addEventListener('load', initScene, false);

function initScene()
{
    // setup initial variables
    xml3d = $("xml3d")[0];
    // setup view
    //$("#my_view")[0].lookAt(new XML3DVec3(0, 0, 0));

    var ctrl = XML3D.Xml3dSceneController.getController(xml3d);
    ctrl.mode = "lookaround";
    ctrl.zoomSpeed = 1;

    // setup tracker
    tracker = new XMOT.ViewTracker(xml3d, onViewXfmChanged);
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
