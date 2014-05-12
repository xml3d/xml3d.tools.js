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
window.addEventListener("load", onLoad, false);

var cameraCtrl = null;
var xml3d = null;
var widget = null;

function onLoad()
{
    xml3d = $("xml3d")[0];

    generateSurface();

    cameraCtrl = new XML3D.tools.MouseKeyboardFlyController($("#g_camera")[0], {
        rotateSpeed: 5,
        controls: {
            rotationActivator: XML3D.tools.MOUSEBUTTON_RIGHT
        }
    });
    cameraCtrl.attach();

    var target = $("#g_cube")[0];
    widget = new XML3D.tools.interaction.behaviors.AlongSurfaceTranslater("myWidget", [target]);
    widget.attach();
}

function generateSurface()
{
    var cns = XML3D.tools.creation;
    var defs = XML3D.tools.util.getOrCreateDefs(xml3d);
    defs.appendChild(cns.element("shader", {
        id: "s_bottom",
        script: "urn:xml3d:shader:phong",
        children: [
            cns.dataSrc("float3", {
                name: "diffuseColor",
                val: "0.8 0.8 0.8"
            }),
            cns.dataSrc("float", {
                name: "ambientIntensity",
                val: "1"
            })
        ]
    }));

    defs.appendChild(cns.element("transform", {
        id: "t_bottom",
        rotation: "1 0 0 -1.47"
    }));

    var rootGrp = cns.element("group", {
        transform: "#t_bottom",
        shader: "#s_bottom"
    });

    for(var x = -50; x <= 50; x += 4)
    {
        for(var y = -50; y <= 50; y += 4)
        {
            var transformId = "t_" + x + "_" + y;
            defs.appendChild(cns.element("transform", {
                id: transformId,
                translation: x + " " + y + " 0",
                scale: "2 2 2"
            }));
            rootGrp.appendChild(cns.element("group", {
                transform: "#" + transformId,
                children: [
                    cns.rectangle(xml3d)
                ]
            }));
        }
    }

    xml3d.appendChild(rootGrp);
}
