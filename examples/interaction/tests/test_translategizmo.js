window.addEventListener("load", onLoad, false);

var xml3dOverlay = null; // instance of XML3DOverlay

var interactors = [];

var gizmo = null;

function onLoad() {

    var targetGroup = $("#g_mainTarget")[0];
    var targetTransformable = XMOT.ClientMotionFactory.createTransformable(targetGroup);

    gizmo = new XMOT.interaction.widgets.TranslateGizmo("myGizmo", targetTransformable);
    gizmo.attach();
};
