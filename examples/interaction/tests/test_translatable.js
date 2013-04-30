var sensorsOn = true;
var sensor1 = null;
var sensor2 = null;
var cameraCtrl = null;

var dragCounter = null; // thing that puts dots in the div as drag-feedback

function initScene()
{
    cameraCtrl = new XMOT.MouseExamineController($("#controller_view")[0].parentNode);

    var grp1ConstrBox = new XML3DBox(
        new XML3DVec3(-Number.MAX_VALUE, 1.5, -Number.MAX_VALUE),
        new XML3DVec3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE)
    );

    var bns = XMOT.interaction.behaviors;
    var motFac = XMOT.ClientMotionFactory;

    // group1
    var target1 = $("#group1")[0];
    var tarXfm1 = motFac.createTransformable(target1, new XMOT.BoxedTranslationConstraint(grp1ConstrBox));

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
    var tarXfm2 = motFac.createTransformable(target2, new XMOT.BoxedTranslationConstraint(grp2ConstrBox));

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
Counter = new XMOT.Class({

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

    var xfm1 = XMOT.util.transform($("#group1")[0]);
    var xfm2 = XMOT.util.transform($("#group2")[0]);

    $("#transGrp1").html(xfm1.translation.str());
    $("#transGrp2").html(xfm2.translation.str());
}
