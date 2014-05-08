/*
Copyright (c) 2010-2014
              DFKI - German Research Center for Artificial Intelligence
              www.dfki.de

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
 so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

window.addEventListener("load", onLoad);

function onLoad()
{
    var $xml3d = $("#scene");
    var xml3d = $xml3d[0];
    var $defs = $(XML3D.tools.util.getOrCreateDefs($xml3d[0]));

    var ns = XML3D.tools.creation;

    // --- Light ---
    // defs section
    var s_light = ns.lightshaderPoint({
        id: "s_light", inten: "0.8 0.8 0.8"});
    var t_light = XML3D.tools.creation.element("transform", {
        id: "t_light", translation: "0 5 0"});

    $defs.append(s_light, t_light);

    // main section
    var light = XML3D.tools.creation.element("light", {
        id: "light", shader: "#s_light"
    });
    var g_light = XML3D.tools.creation.element("group", {
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
    var t_tar = XML3D.tools.creation.element("transform", {
        id: "t_target",
        translation: "0 0 -10",
        rotation: "1 1 1 0.7"
    });

    $defs.append(s_tar, t_tar);

    // main section
    var g_tar = XML3D.tools.creation.element("group", {
        id: "g_target",
        transform: "#t_target",
        shader: "#s_target"
    });
    g_tar.appendChild(ns.box(xml3d));

    $xml3d.append(g_tar);
}
