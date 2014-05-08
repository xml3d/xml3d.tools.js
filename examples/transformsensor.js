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
    var defs = XML3D.tools.util.getOrCreateDefs(xml3d);
    var $defs = $(defs);

    var cns = XML3D.tools.creation;

    // shaders
    $defs.append(cns.phongShader({
        id: normalShaderId,
        diffuseColor: "0 0 0.6"
    }));
    $defs.append(cns.phongShader({
        id: highlightShaderId,
        diffuseColor: "0 0 1"
    }));
    $defs.append(cns.phongShader({
        id: normalProxyShaderId,
        diffuseColor: "1 0 0"
    }));
    $defs.append(cns.phongShader({
        id: highProxyShaderId,
        diffuseColor: "0 1 0"
    }));

    // target box
    var tarXfm = XML3D.tools.creation.element("transform", {
        id: "t_target", translation: "0 2.5 0"});
    $defs.append(tarXfm);

    tarBox = cns.box(xml3d);

    tarGrp = XML3D.tools.creation.element("group", {
        transform: "#" + $(tarXfm).attr("id"),
        shader: "#" + normalProxyShaderId
    });
    $(tarGrp)
        .append(tarBox)
    ;

    $xml3d.append(tarGrp);

    // interactor box
    intBox = cns.box(xml3d);
    var intXfm = XML3D.tools.creation.element("transform", {
        id: "t_interactor", translation: "0 -2.5 0"});
    $defs.append(intXfm);

    intGrp = XML3D.tools.creation.element("group", {
        transform: "#" + $(intXfm).attr("id"),
        shader: "#" + normalShaderId
    });
    $(intGrp)
        .append(intBox)
    ;

    $xml3d.append(intGrp);

    var intGrpXfm = XML3D.tools.MotionFactory.createTransformable(intGrp);

    // attach Translater to interactorbox
    intSensor = new XML3D.tools.interaction.behaviors.Translater("myTranslater",
            [intGrp], intGrpXfm);

    // initialize transformsensor
    XML3D.tools.util.fireWhenMeshesLoaded(tarGrp, setupXfmSensor);
}

function setupXfmSensor()
{
    var bbox = XML3D.tools.util.getWorldBBox(tarGrp);

    // setup change observer
    xfmSensor = new XML3D.tools.TransformSensor("myxfmsensor", [intGrp], bbox);

    var proxy = tarGrp;
    xfmSensor.addListener("start", function(tarNode) {
        $(proxy).attr("shader", "#" + highProxyShaderId);
    });

    xfmSensor.addListener("end", function(tarNode) {
        $(proxy).attr("shader", "#" + normalProxyShaderId);
    });
}
