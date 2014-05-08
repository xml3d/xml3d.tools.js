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
var sensorsOn = true;
var sensor1 = null;
var sensor2 = null;
var cameraCtrl = null;

var dragCounter = null; // thing that puts dots in the div as drag-feedback

function initScene()
{
    cameraCtrl = new XML3D.tools.MouseExamineController($("#controller_view")[0].parentNode);
    cameraCtrl.attach();

    var grp1ConstrBox = new XML3DBox(
        new XML3DVec3(-Number.MAX_VALUE, 1.5, -Number.MAX_VALUE),
        new XML3DVec3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE)
    );

    var bns = XML3D.tools.interaction.behaviors;
    var motFac = XML3D.tools.MotionFactory;

    // group1
    var target1 = $("#group1")[0];
    var tarXfm1 = motFac.createTransformable(target1, new XML3D.tools.BoxedTranslationConstraint(grp1ConstrBox));

    sensor1 = new bns.Translater("transl1", [target1], tarXfm1);
    sensor1.addListener("dragstart", onDragStart);
    sensor1.addListener("drag", onDrag);
    sensor1.addListener("dragend", onDragEnd);
    sensor1.addListener("translchanged", onTranslChanged);

    // group2
    var grp2ConstrBox = new XML3DBox(
        new XML3DVec3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE),
        new XML3DVec3(Number.MAX_VALUE, -1.5, Number.MAX_VALUE)
    );

    var target2 = $("#group2")[0];
    var tarXfm2 = motFac.createTransformable(target2, new XML3D.tools.BoxedTranslationConstraint(grp2ConstrBox));

    sensor2 = new bns.Translater("transl2", [target2], tarXfm2);
    sensor2.addListener("dragstart", onDragStart);
    sensor2.addListener("drag", onDrag);
    sensor2.addListener("dragend", onDragEnd);
    sensor2.addListener("translchanged", onTranslChanged);

    dragCounter = new Counter($("#dragop")[0]);
    transCounter = new Counter($("#transl")[0]);
}

function toggleSensors()
{
    if(sensorsOn)
    {
        sensor1.detach();
        sensor2.detach();
        sensorsOn = false;
        $("#b_toggleSensors").val("Attach Sensors");
    }
    else
    {
        sensor1.attach();
        sensor2.attach();
        $("#b_toggleSensors").val("Detach Sensors");
        sensorsOn = true;
    }
}

// ============================================================================
// Event Handlers
// ============================================================================
Counter = new XML3D.tools.Class({

    initialize: function(_targetDiv)
    {
        this.counter = 0;
        this.targetDiv = _targetDiv;
    },

    tick: function()
    {
        this.counter++;
        if(this.counter > 60)
            this.counter = 1;

        var dots = "";
        for(var i = 0; i < this.counter; i++)
            dots += ".";

        $(this.targetDiv).html(dots);
    }
});

function onDragStart(sensor, e)
{
  var pickId = "";
  if(sensor.pickGroups[0].id)
      pickId = sensor.pickGroups[0].id;

  $("#dragstatus").html("drag: on (" + sensor.ID + " on " + pickId + ")");
}

function onDrag(sensor, e)
{
    // update drag status, i.e. dots

    dragCounter.tick();

    $("#mousepos").html("(" + e.pageX + ", " + e.pageY + ")");
}

function onDragEnd(sensor, e)
{
  $("#dragstatus").html("drag: off");
}

function onTranslChanged(sensor, e)
{
    $("#trans").html(sensor.translation.str());

    var xfm1 = XML3D.tools.util.transform($("#group1")[0]);
    var xfm2 = XML3D.tools.util.transform($("#group2")[0]);

    $("#transGrp1").html(xfm1.translation.str());
    $("#transGrp2").html(xfm2.translation.str());
}
