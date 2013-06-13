var xml3d = null;

var intSensor = null;
var xfmSensor = null; // the XML3D.TransformSensor

var intBox = null; // the interactor mesh element
var intGrp = null;

var tarBox = null;
var tarGrp = null;

var normalShaderId = "s_normal";
var highlightShaderId = "s_highlight";

var normalProxyShaderId = "s_proxy_normal";
var highProxyShaderId = "s_proxy_high";

function initScene()
{
    xml3d = $("xml3d")[0];

    var $xml3d = $(xml3d);

    // setup defs element
    var defs = XMOT.util.getOrCreateDefs(xml3d);
    var $defs = $(defs);

    var cns = XMOT.creation;

    // shaders
    $defs.append(cns.phongShader({
        id: normalShaderId,
        diffuseColor: "0 0 0.6",
        transparency: "0.3"
    }));
    $defs.append(cns.phongShader({
        id: highlightShaderId,
        diffuseColor: "0 0 1",
        transparency: "0.3"
    }));
    $defs.append(cns.phongShader({
        id: normalProxyShaderId,
        diffuseColor: "0.8 0 0",
        transparency: "0.3"
    }));
    $defs.append(cns.phongShader({
        id: highProxyShaderId,
        diffuseColor: "0 0.8 0",
        transparency: "0.3"
    }));

    // target box
    var tarXfm = XMOT.creation.element("transform", {
        id: "t_target", translation: "0 2.5 0"});
    $defs.append(tarXfm);

    tarBox = cns.box(xml3d);

    tarGrp = XMOT.creation.element("group", {
        transform: "#" + $(tarXfm).attr("id"),
        shader: "#" + normalProxyShaderId
    });
    $(tarGrp)
        .append(tarBox)
    ;

    $xml3d.append(tarGrp);

    // interactor box
    intBox = cns.box(xml3d);
    var intXfm = XMOT.creation.element("transform", {
        id: "t_interactor", translation: "0 -2.5 0"});
    $defs.append(intXfm);

    intGrp = XMOT.creation.element("group", {
        transform: "#" + $(intXfm).attr("id"),
        shader: "#" + normalShaderId
    });
    $(intGrp)
        .append(intBox)
    ;

    $xml3d.append(intGrp);

    var intGrpXfm = XMOT.ClientMotionFactory.createTransformable(intGrp);

    // attach Translater to interactorbox
    intSensor = new XMOT.interaction.behaviors.Translater("myTranslater",
            [intGrp], intGrpXfm);

    // initialize transformsensor
    XMOT.util.fireWhenMeshesLoaded(tarGrp, setupXfmSensor);
}

function setupXfmSensor()
{
    var bbox = XMOT.util.getWorldBBox(tarGrp);

    // setup change observer
    xfmSensor = new XMOT.TransformSensor("myxfmsensor", [intGrp], bbox);

    var proxy = tarGrp;
    xfmSensor.addListener("start", function(tarNode) {
        $(proxy).attr("shader", "#" + highProxyShaderId);
    });

    xfmSensor.addListener("end", function(tarNode) {
        $(proxy).attr("shader", "#" + normalProxyShaderId);
    });
}
