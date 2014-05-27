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
var muh = 0;
var transformable = null;

function initTransformable() {
    var cube = document.getElementById("cube");
    var factory = XML3D.tools.MotionFactory;
    transformable = factory.createTransformable(cube);
}

function rotateCube() {
    document.getElementById("notification").innerHTML = "Rotating the Cube ...";
    if (muh % 2)
        transformable.setOrientation(new XML3DRotation(new XML3DVec3(0.0, 1.0, 0.0), 0.5));
    else
        transformable.setOrientation(new XML3DRotation(new XML3DVec3(0.0, 1.0, 0.0), 0.25));
    muh++;
    document.getElementById("notification").innerHTML = "Rotated the Cube ...";
}

function moveCube() {
    document.getElementById("notification").innerHTML = "Moving the Cube ...";
    if (muh % 2)
        transformable.setPosition(new XML3DVec3(1.0, 0.0, 1.0));
    else
        transformable.setPosition(new XML3DVec3(2.0, 0.0, 2.0));
    muh++;
    document.getElementById("notification").innerHTML = "Moved the Cube ...";
}

function translateCube() {
    document.getElementById("notification").innerHTML = "Translating the Cube ...";
    if (muh % 2)
        transformable.translate(new XML3DVec3(1.0, 0.0, 1.0));
    else
        transformable.translate(new XML3DVec3(-2.0, 0.0, -2.0));
    muh++;
    document.getElementById("notification").innerHTML = "Translated the Cube ...";
}

function moveCubeTo() {
    document.getElementById("notification").innerHTML = "Moving the Cube To ...";
    transformable.moveTo(new XML3DVec3(1.0, 0.0, 1.0), new XML3DRotation(new XML3DVec3(0.0, 1.0, 0.0), 0.5), 1000);
    transformable.moveTo(undefined, new XML3DRotation(new XML3DVec3(0.0, 1.0, 0.0), Math.PI), 1500);
    transformable.moveTo(new XML3DVec3(1.0, 0.0, 4.0), undefined, 2000);
    transformable.moveTo(new XML3DVec3(4.0, 0.0, 4.0), undefined, 2500);
    transformable.moveTo(new XML3DVec3(4.0, 0.0, 1.0), undefined, 3000);
    transformable.moveTo(new XML3DVec3(1.0, 0.0, 1.0), new XML3DRotation(new XML3DVec3(0.0, 1.0, 0.0), 0.5), 3500);
    document.getElementById("notification").innerHTML = "Ehm... Cube should have moved";
}

function stop() {
    transformable.stop();
}
