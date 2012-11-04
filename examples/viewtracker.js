
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
    var target = $("#t_viewtrack")[0]; 
    
    tracker = new XMOT.ViewTracker(target);
}
