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
