var xml3d = null;

var ringmenu = null; 

//--- Startup ---
window.addEventListener('load', onLoad, false);

function onLoad()
{
    xml3d = $("xml3d")[0];

    // setup scene ctrl
    if(XML3D.Xml3dSceneController)
    {
        var ctrl = XML3D.Xml3dSceneController.getController(xml3d);
        ctrl.mode = "lookaround";
        ctrl.zoomSpeed = 1;
    }

    createTestObjects();

    // look at menu origin
    var origin = $("#container")[0].getBoundingBox().center();
    XML3D.util.getOrCreateActiveView(xml3d).lookAt(origin);

    // create ring menu
    var target = $("#container")[0]; 
    
    ringmenu = new XMOT.interaction.widgets.RingMenu("myRingmenu", target, 5);
}

function createTestObjects()
{
    var objList = new Array();
    var numObjs = 10;

    var col = 0;
    var colStep = 1 / numObjs;
    for(var i = 0; i < numObjs; i++)
    {
        var colStr = Math.random() + " "
                   + Math.random() + " "
                   + Math.random();
        col += colStep;

        var sh = XMOT.creation.phongShader({
            id:"s_myObjects_" + i, diffCol:colStr});
        XMOT.util.getOrCreateDefs(xml3d).appendChild(sh);

        var mesh = XMOT.creation.element("mesh", {
            id: "m_myObjects_" + i, src: "#d_item"});

        var grp = XMOT.creation.element("group", {shader:"#" + sh.id});
        grp.appendChild(mesh);

        objList[i] = grp;
    }

    $("#container").append(objList);
}
