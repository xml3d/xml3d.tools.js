var xml3d = null;
var tracker = null;

function onLoad()
{
    // setup xml3d and inspector
    xml3d = $("#MyXml3d")[0];

    // setup xfm change observation
    var target = $("#group2")[0];
    tracker = new XML3D.tools.TransformTracker(target, onXfmChange);
    tracker.attach();
}

var activeXfmGrp2 = true; // true: trans2, false: trans1

function toggleXfmValueOfGrp2()
{
    var grp2 = $("#group2");

    activeXfmGrp2 = !activeXfmGrp2;

    if(activeXfmGrp2)
        grp2.attr("transform", "#trans2");
    else
        grp2.attr("transform", "#trans1");
}

var xfmAttrPresent = false;

function toggleXfmAttrOfGrpAll()
{
    var grp = $("#group_all");
    var stat = $("#xfmgrpall_present");

    if(xfmAttrPresent)
        grp.removeAttr("transform");
    else
        grp.attr("transform", "#trans3");

    xfmAttrPresent = !xfmAttrPresent;
}

function onXfmChange(targetNode, evt)
{
    $("#xfmchanged").text("transform changed of target: " + targetNode.id);

    var resetMsg = function() {
        $("#xfmchanged").text("none");
    };

    setTimeout(resetMsg, 1000);
}
