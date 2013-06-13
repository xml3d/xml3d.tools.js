
window.addEventListener("load", onLoad);

function onLoad()
{
    var $xml3d = $("#scene");
    var xml3d = $xml3d[0];
    var $defs = $(XMOT.util.getOrCreateDefs($xml3d[0]));

    var ns = XMOT.creation;

    // --- Light ---
    // defs section
    var s_light = ns.lightshaderPoint({
        id: "s_light", inten: "0.8 0.8 0.8"});
    var t_light = XMOT.creation.element("transform", {
        id: "t_light", translation: "0 5 0"});

    $defs.append(s_light, t_light);

    // main section
    var light = XMOT.creation.element("light", {
        id: "light", shader: "#s_light"
    });
    var g_light = XMOT.creation.element("group", {
        id: "g_light", transform: "#t_light"
    });
    g_light.appendChild(light);

    $xml3d.append(g_light);

    // --- Cube ---
    // defs section
    var s_tar = ns.phongShader({
        id:"s_target", diffuseColor: "0.9 0 0",
        specularColor: "0 0 0", shininess: "0"
    });
    var t_tar = XMOT.creation.element("transform", {
        id: "t_target",
        translation: "0 0 -10",
        rotation: "1 1 1 0.7"
    });

    $defs.append(s_tar, t_tar);

    // main section
    var g_tar = XMOT.creation.element("group", {
        id: "g_target",
        transform: "#t_target",
        shader: "#s_target"
    });
    g_tar.appendChild(ns.box(xml3d));

    $xml3d.append(g_tar);
}
