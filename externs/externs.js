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

var XML3D = {};

XML3D.URIResolver = {};

XML3D.xml3dNS = {};

XML3D._native = {};

/**
 * @param {Object} transform
 * @param {Object} ownerDoc
 */
XML3D.URIResolver.resolve = function(transform, ownerDoc){};

/**
 * @param {number|void} x
 * @param {number|void} y
 * @param {number|void} z
 * @constructor
 */
function XML3DVec3(x,y,z){};

XML3DVec3._data = {};

/**
 * @constructor
 */
function XML3DRotation(){};

XML3DRotation._setQuaternion = function(q){};

/**
 * @param {XML3DVec3} vec
 * @param {number} s
 */
XML3DRotation.setQuaternion = function(vec, s){};

/**
 * @constructor
 */
function XML3DRay() {};

/**
 * @constructor
 */
function quat4(){};

/**
 * @param {Array.<number>} quat quaternion
 * @return {Array.<number>} normalized quaternion
 */
quat4.normalize = function(quat){};

/**
 * @param {Array.<number>|quat4} quat
 * @param {Array.<number>|vec3} vec
 * @param {Array.<number>|vec3} result
 * @return {Array.<number>|vec3} result
 */
quat4.multiplyVec3 = function(quat, vec, result){};

quat4.setFromBasis = function(a, b,c, d){};

/**
 * @constructor
 */
function vec3(){};

/**
 * @return {vec3} created vec3
 */
vec3.create = function(){};

/**
 * @param {vec3} vec
 * @return {vec3} normalized vec3
 */
vec3.normalize = function(vec){};

/**
 * @param {vec3} vec
 * @param {number} s scalar
 * @return {vec3} scaled vec3
 */
vec3.scale = function(vec, s){};

function console(){};

console.log = function(string){};

navigator.webkitGetGamepads = function(){};

navigator.webkitGamepads = [];

window.requestAnimFrame = function(f, u){};
