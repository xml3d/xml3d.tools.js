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
var movObjects = {}, factory = XML3D.tools.MotionFactory;
var constraint = new XML3D.tools.SimpleConstraint(true, true, true);
var id = 0;

function startPositionAnimation() {
    var aobj = movObjects.cube;
    if (!aobj) {
        aobj = movObjects.cube = createAnimatable();
    }
    id = aobj.startAnimation("a1", {duration: 10000, loop: 3, easing: TWEEN.Easing.Sinusoidal.In});
};

function startOrientationAnimation() {
    var aobj = movObjects.cube;
    if (!aobj) {
        aobj = movObjects.cube = createAnimatable();
    }
    id = aobj.startAnimation("a2");
};

function startTwoAnimations() {
    var aobj = movObjects.cube;
    if (!aobj) {
        aobj = movObjects.cube = createAnimatable();
    }
    aobj.startAnimation("a2", {delay: 2500})
    id = aobj.startAnimation("a1", {duration: 5000, loop: 3});
};

function combinedAnimation() {
    var aobj = movObjects.cube;
    if (!aobj) {
        aobj = movObjects.cube = createAnimatable();
    }
    id = aobj.startAnimation("combined", {loop: 2});
};

function scaleAnimation() {
    var aobj = movObjects.cube;
    if (!aobj) {
        aobj = movObjects.cube = createAnimatable();
    }
    id = aobj.startAnimation("a3", {loop: 2});
};

function threeTypes() {
    var aobj = movObjects.cube;
    if (!aobj) {
        aobj = movObjects.cube = createAnimatable();
    }
    id = aobj.startAnimation("a4", {loop: 2});
};

function endless() {
    var aobj = movObjects.cube;
    if (!aobj) {
        aobj = movObjects.cube = createAnimatable();
    }
    id = aobj.startAnimation("a4", {loop: 2E+12345});
    //loop is larger than max float and therefore maps to "infinity", which really means infinte number of iterations
};

function stopAnimations() {
    var aobj;
    if (!(aobj = movObjects.cube))
        return;
    aobj.stopAnimation(id);
};

function createAnimatable() {
    var c = factory.createAnimatable(document.getElementById("shape_d1e22"), constraint);
    var a1 = factory.createKeyframeAnimation("a1", document.getElementById("animation01"), {duration: 2000, loop: 1});
    var a2 = factory.createKeyframeAnimation("a2", document.getElementById("animation02"));
    var a3 = factory.createKeyframeAnimation("a3", document.getElementById("animation03"));
    var a4 = factory.createKeyframeAnimation("a4", document.getElementById("animation04"), {duration: 10000});
    c.addAnimation(a1);
    c.addAnimation(a2, {duration: 5000, loop: 2});
    c.addAnimation(a3, {duration: 10000});
    c.addAnimation(a4);
    var combined = new XML3D.tools.CombinedAnimation("combined");
    combined.addAnimation(a1, {duration: 1500});
    combined.addAnimation(a2, {delay: 2500, duration: 2000, callback: function () {
        console.log("Example debug info.");
    }});
    combined.addAnimation(a1, {duration: 2000, loop: 3, delay: 5000, callback: function () {
        console.log("Done");
    }});
    c.addAnimation(combined);
    return c;
};
