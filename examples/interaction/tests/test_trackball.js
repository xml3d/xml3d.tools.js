var trackball = null;
var xml3d = null;

function initScene()
{
    xml3d = document.getElementById("MyXml3d");

    trackball = new XMOT.interaction.behaviors.TrackBall(300, 200);
}

var dragging = false;

var trackballActive = false;

function toggleTrackBall()
{
    if(trackballActive)
    {
        $(xml3d).unbind("mouseup", onRootMouseUp);
        $(xml3d).unbind("mousemove", onRootMouseMove);

        $("#g_target").unbind("mousedown", onTargetMouseDown);

        $("#toggletrackball").val("Activate Trackball");
        trackballActive = false;
    }
    else
    {
        $(xml3d).mouseup(onRootMouseUp);
        $(xml3d).mousemove(onRootMouseMove);

        $("#g_target").mousedown(onTargetMouseDown);

        $("#toggletrackball").val("Deactivate Trackball");
        trackballActive = true;
    }
}

function resetRotation()
{
    trackball.resetRotationOffset();

    $("#t_target").attr("rotation", "0 0 1 0");
    $("#rotation").html("0 0 1 0");
}

function onRootMouseUp(evt)
{
    if(evt.button == 0)
    {
        dragging = false;
        trackball.dragEnd();
        $("#dragstatus").html("false");
    }
}

function onTargetMouseDown(evt)
{
    if(evt.button == 0)
    {
        dragging = true;
        trackball.dragStart(evt.pageX, evt.pageY);

        $("#dragstatus").html("true");
    }
}

function onRootMouseMove(evt)
{
    if(dragging)
    {
        var rot = trackball.drag(evt.pageX, evt.pageY);
        var rotStr = rot.axis.x + " " + rot.axis.y + " " + rot.axis.z
                    + " " + rot.angle;

        $("#t_target").attr("rotation", rotStr);
        $("#rotation").html(rotStr);
    }
}
