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

XML3D.shaders.register("toolsmatte", {

    vertex: [
        "attribute vec3 position;",
        "attribute vec3 color;",

        "varying vec3 fragVertexColor;",

        "uniform mat4 modelViewProjectionMatrix;",

        "void main(void) {",
        "   fragVertexColor = color;",
        "   gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);",
        "}"
    ].join("\n"),

    fragment: [
        "uniform vec3 diffuseColor;",
        "uniform bool useVertexColor;",
        "uniform float transparency;",

        "varying vec3 fragVertexColor;",

        "void main(void) {",
        "    float alpha =  max(0.0, 1.0 - transparency);",
        "    if (alpha < 0.05) discard;",
        "    vec3 color = diffuseColor;",
        "    if (useVertexColor)",
        "       color *=  fragVertexColor;",
        "    gl_FragColor = vec4(color, alpha);",
        "}"
    ].join("\n"),

    uniforms: {
        diffuseColor    : [1.0, 1.0, 1.0],
        useVertexColor  : false,
        transparency    : 0.0
    },
    attributes: {
        color: null
    }
});
