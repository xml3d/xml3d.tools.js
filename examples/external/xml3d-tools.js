/**
Copyright (c) 2010-2012
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

@version: DEVELOPMENT SNAPSHOT (14.02.2013 15:07:33 CET)
**/
//Check, if basics have already been defined
var XML3D = XML3D || {};

//Create global symbol XML3D.animation
if (!XML3D.animation)
    XML3D.animation = {};
else if (typeof XML3D.animation != "object")
    throw new Error("XML3D.animation already exists and is not an object");

// This is quirk required  to run animation manager initalization only after full
// document is loaded and all X3D interpolation elements are accesible.

// Browsers  based  on  Gecko 1.9.2 (e.g. Firefox 3.5) will only execute function
// that is set to timeout in 0 milliseconds exactly after document will be loaded
// or  as  soon  as  possible  if  document is already loaded, thus we can safely
// initalize animation manager. Such browsers can  be checked by testing value of
// document.readyState, which must be undefined.

// Other browsers may execute function  even  before loading  of  the webpage  is
// finished, but they define document.readyState,  which allows us to detech such
// state  and  register event handler, which  will  run  the  initalization after
// document is fully loaded.

setTimeout(function() {
    function initAnimationManager() {
        XML3D.debug.logInfo("Initializing Animation Manager.");
        XML3D.animation.animationManager = new XML3D.animation.XML3DAnimationManager();
        XML3D.animation.animationManager.init();
    };

    if (document.readyState == "complete" || // All major browsers except Gecko 1.9.2 or earlier.
        document.readyState == undefined) // Gecko 1.9.2 or earlier version. Document is guaranteed to be loaded when running this code.
        initAnimationManager();
    else
        window.addEventListener('load', initAnimationManager, false);
}, 0);

XML3D.startAnimation = function(aniID, transID, transAttr, duration, loop)
{
    return XML3D.animation.animationManager.startAnimation(aniID, transID, transAttr, duration, loop);
};

XML3D.stopAnimation = function(handle)
{
    XML3D.animation.animationManager.stopAnimation(handle);
};

XML3D.stopAllAnimations = function()
{
    XML3D.animation.animationManager.stopAllAnimations();
};

XML3D.isAnimationRunning = function(aniId, transId, transAttr)
{
    return XML3D.animation.animationManager.isAnimationRunning(aniId, transId, transAttr);
};

/** @constructor */
XML3D.animation.XML3DAnimationManager = function() {
    this.interpolators = {};
    var xml3d = document.evaluate('//xml3d:xml3d', document, function() {
        return XML3D.xml3dNS;
    }, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    if (xml3d && xml3d.update)
        this.updateElement = xml3d;
};

XML3D.animation.XML3DAnimationManager.prototype.init = function() {

    this.updateInterpolators();

    var a = this;

    window.addEventListener("DOMNodeInserted",
        function(evt) { a.onNodeInserted(evt); }, false);
    window.addEventListener("DOMNodeRemoved",
        function(evt) { a.onNodeRemoved(evt); }, false);

    window.setInterval(function() { a.progress(); }, 30);
};

XML3D.animation.XML3DAnimationManager.prototype.addInterpolator = function(pol) {

    var cons = null;
    if(pol.localName === 'OrientationInterpolator')
        cons = XML3D.animation.X3DOrientationInterpolation;
    else if(pol.localName === 'PositionInterpolator')
        cons = XML3D.animation.X3DPositionInterpolation;
    else
        return; // don't support others

    if (pol.hasAttribute('id'))
    {
        if (this.interpolators[pol.getAttribute('id')] == undefined)
        {
            this.interpolators[pol.getAttribute('id')] = new cons(pol);
            var a = this;
            pol.addEventListener("DOMAttrModified",
                    function(evt) { a.onAttrModified(evt); });
        }
    }
};

XML3D.animation.XML3DAnimationManager.prototype.onNodeInserted = function(evt) {

    if(evt.target.namespaceURI !== XML3D.x3dNS)
        return;

    this.addInterpolator(evt.target);
};

XML3D.animation.XML3DAnimationManager.prototype.onNodeRemoved = function(evt) {

    var t = evt.target;
    if(t.namespaceURI !== XML3D.x3dNS)
        return;

    if(t.localName !== 'OrientationInterpolator'
    && t.localName !== 'PositionInterpolator')
        return;

    if(t.hasAttribute('id'))
    {
        if(this.interpolators[t.getAttribute('id')])
        {
            this.interpolators[t.getAttribute('id')] = undefined;
        }
    }
};

XML3D.animation.XML3DAnimationManager.prototype.onAttrModified = function(evt) {

    var t = evt.target;

    // note: no checks, we will always have a valid interpolator

    this.interpolators[t.getAttribute('id')].isInit = false;
};


XML3D.animation.XML3DAnimationManager.prototype.updateInterpolators = function() {
    var ois = document.getElementsByTagNameNS(XML3D.x3dNS, 'OrientationInterpolator');
    for(var i = 0; i < ois.length; i++)
    {
        this.addInterpolator(ois[i]);
    }

    ois = document.getElementsByTagNameNS(XML3D.x3dNS, 'PositionInterpolator');
    for(var i = 0; i < ois.length; i++)
    {
        this.addInterpolator(ois[i]);
    }
};

XML3D.animation.XML3DAnimationManager.prototype.startAnimation = function(aniID, transID, transAttr, duration, loop) {

    if (duration === undefined)
        duration = 3000;

    if (loop === undefined)
        loop = false;

    if(this.interpolators[aniID] === undefined)
    {
        XML3D.debug.logWarning("Unknown Interpolator: " + aniID);
        return;
    }
    var interpolator = this.interpolators[aniID];
    if (!interpolator.isValid())
    {
        XML3D.debug.logWarning("Could not initialize Interpolator: " + aniID);
        return;
    }
    var trans = document.getElementById(transID);
    if (!trans)
    {
        XML3D.debug.logWarning("Could not find animation target: " + transID);
        return;
    }

    var field = trans.getAttributeNode(transAttr);
    if (!field)
    {
        field = document.createAttribute(transAttr);
        field.nodeValue = "";
        trans.setAttributeNode(field);
    }

    if(interpolator.animations[field] !== undefined) {
        if (interpolator.animations[field].running)
        {
            XML3D.debug.logWarning("Animation already running");
        }
        else
        {
            // We start from the beginning when animation is restarted
            interpolator.animations[field].duration = duration;
            interpolator.animations[field].loop = loop;
            interpolator.animations[field].startTime = (new Date()).getTime();
            interpolator.animations[field].running = true;
        }
        return interpolator.animations[field];
    }

    interpolator.animations[field] = {};
    interpolator.animations[field].field = field;
    interpolator.animations[field].node = trans;
    interpolator.animations[field].attribute = transAttr;
    interpolator.animations[field].duration = duration;
    interpolator.animations[field].loop = loop;
    interpolator.animations[field].startTime = (new Date()).getTime();
    interpolator.animations[field].running = true;

    return interpolator.animations[field];
};

XML3D.animation.XML3DAnimationManager.prototype.stopAnimation = function(handle)
{
    if (handle === undefined || handle == null
            || handle.running === undefined)
    {
        XML3D.debug.logError("XML3DAnimationManager::stopAnimation: Not a vaild animation handle");
        return;
    }
    handle.running = false;
};

XML3D.animation.XML3DAnimationManager.prototype.stopAllAnimations = function()
{
    for (var i in this.interpolators)
    {
        for(var j in this.interpolators[i].animations)
            this.interpolators[i].animations[j].running = false;
    }
};

XML3D.animation.XML3DAnimationManager.prototype.progress = function()
{
    var time = (new Date()).getTime();
    for (var i in this.interpolators)
    {
        this.interpolators[i].progressAll(time);
    }
    if(this.updateElement)
        this.updateElement.update();
};



XML3D.animation.XML3DAnimationManager.prototype.isAnimationRunning = function(aniId, transId, transAttr)
{
    var interpolator = this.interpolators[aniId];
    if(!interpolator)
        return false;

    var trans = document.getElementById(transId);
    if(!trans)
        return false;

    var field = trans.getAttributeNode(transAttr);
    if(!field)
        return false;

    if(interpolator.animations[field] === undefined)
        return false;

    if(!interpolator.animations[field].running)
        return false;

    return true;
};


XML3D.x3dNS = 'http://www.web3d.org/specifications/x3d-namespace';
XML3D.xml3dNS = XML3D.xml3dNS || 'http://www.xml3d.org/2009/xml3d';

/**
 * Class to use X3D OrientationInterpolator nodes in Xml3d
 * 
 * @constructor
 *
 * @param inode
 *            node id of OrientationInterpolator element in X3D namespace
 * @param tnode
 *            node id of transform element in Xml3D namespace
 * @param tfield
 *            target field of interpolation, must be 'rotation' or
 *            'scaleOrientation'
 */
XML3D.animation.X3DInterpolation = function(inode) {
    this.inode = inode;
    this.animations = {};
    this.isInit = false;
    this.valid = false;
};

XML3D.animation.X3DInterpolation.prototype.isValid = function() {
    if (!this.isInit)
        this.initialize();
    return this.valid;
};

XML3D.animation.X3DInterpolation.prototype.progressAll = function(time) {


    for(var i in this.animations)
    {
        if (this.animations[i].running)
            this.progress(this.animations[i], time);
    }
};


XML3D.animation.X3DInterpolation.prototype.progress = function(anim, time) {
    var key = ((time - anim.startTime) % anim.duration ) / (anim.duration * 1.0);
    if(!anim.loop && (time - anim.startTime > anim.duration) )
    {
        key = 1.0;
        anim.running = false;
    }
    if (anim.node[anim.attribute] instanceof window.XML3DRotation)
        anim.node[anim.attribute].set(this.getValue( key ));
    else if (anim.node[anim.attribute] instanceof window.XML3DVec3)
        anim.node[anim.attribute].set(this.getValue( key ));
    else
        anim.node[anim.attribute] = this.getValue( key );
};

XML3D.animation.X3DInterpolation.prototype.initialize = function() {};


XML3D.animation.X3DInterpolation.prototype.interpolate = function(t,
        interp) {
    if (t <= this.key[0])
        return this.keyValue[0];
    if (t >= this.key[this.key.length - 1])
        return this.keyValue[this.key.length - 1];
    for ( var i = 0; i < this.key.length - 1; ++i)
        if (this.key[i] < t && t <= this.key[i + 1]) {
            return interp(this.keyValue[i], this.keyValue[i + 1],
                    (t - this.key[i]) / (this.key[i + 1] - this.key[i]));
        }
};

// --------------
// Orientation
// --------------
XML3D.animation.X3DOrientationInterpolation = function(factory, node) {
    XML3D.animation.X3DInterpolation.call(this, factory, node);
};
XML3D.animation.X3DOrientationInterpolation.prototype = new XML3D.animation.X3DInterpolation();
XML3D.animation.X3DOrientationInterpolation.prototype.constructor = XML3D.animation.X3DOrientationInterpolation;

XML3D.animation.X3DOrientationInterpolation.prototype.getValue = function(t) {
    var value = this.interpolate(t, function(a, b, t) {
        return a.interpolate(b, t);
    });
    return value;
};

XML3D.animation.X3DOrientationInterpolation.prototype.initialize = function() {
    this.isInit = true;
    this.valid = false;

    this.keyValue = XML3D.animation.RotationArray.parse(this.inode.getAttribute('keyValue'));
    var keyStr =  this.inode.getAttribute('key').replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    this.key = Array.map(keyStr.split(/[\s+,]/), function(n) {
        return +n;
    });
    if (this.keyValue.length != this.key.length)
    {
        XML3D.debug.logWarning("Key size and Value size differ. Keys: " + this.key.length + " Values: " + this.keyValue.length);
        return;
    }
    this.valid = true;
};

// --------------
// Position
// --------------
XML3D.animation.X3DPositionInterpolation = function(factory, node) {
    XML3D.animation.X3DInterpolation.call(this, factory, node);
};
XML3D.animation.X3DPositionInterpolation.prototype = new XML3D.animation.X3DInterpolation();
XML3D.animation.X3DPositionInterpolation.prototype.constructor = XML3D.animation.X3DPositionInterpolation;

XML3D.animation.X3DPositionInterpolation.prototype.getValue = function(t) {
    var value = this.interpolate(t, function(a, b, t) {
        return a.scale(1.0 - t).add(b.scale(t));
    });
    return value;
};

XML3D.animation.X3DPositionInterpolation.prototype.initialize = function() {
    this.isInit = true;
    this.valid = false;

    this.keyValue = XML3D.animation.Vec3Array.parse(this.inode.getAttribute('keyValue'));
    var keyStr =  this.inode.getAttribute('key').replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    this.key = Array.map(keyStr.split(/[\s+,]/), function(n) {
        return +n;
    });
    if (this.keyValue.length != this.key.length)
    {
        XML3D.debug.logWarning("Key size and Value size differ. Keys: " + this.key.length + " Values: " + this.keyValue.length);
        return;
    }
    this.valid = true;
};

XML3D.animation.Vec3Array = function(vec3Array) {
    if (arguments.length == 0) {
    } else {
        vec3Array.map(function(v) {
            this.push(v);
        }, this);
    }
};
XML3D.animation.Vec3Array.prototype = new Array;
XML3D.animation.Vec3Array.parse = function(str) {
    var mc = str.match(/([+-]?\d*\.?\d*\s*){3},?\s*/g);
    var vecs = [];
    for ( var i = 0; i < mc.length; ++i) {
        var c = /^([+-]?\d*\.*\d*)\s*,?\s*([+-]?\d*\.*\d*)\s*,?\s*([+-]?\d*\.*\d*),?\s*$/
                .exec(mc[i]);
        if (c[0])
        {
            var vec = new window.XML3DVec3(+c[1],+c[2],+c[3]);
            vecs.push(vec);
        }
    }
    return new XML3D.animation.Vec3Array(vecs);
};

XML3D.animation.RotationArray = function(rotArray) {
    if (arguments.length == 0) {
    } else {
        rotArray.map(function(v) {
            this.push(v);
        }, this);
    }
};
XML3D.animation.RotationArray.prototype = new Array;
XML3D.animation.RotationArray.parse = function(str) {
    var mc = str.match(/([+-]?\d*\.?\d*\s*){4},?\s*/g);
    var vecs = [];
    for ( var i = 0; i < mc.length; ++i) {
        for ( var i = 0; i < mc.length; ++i) {
            var c = /^([+-]?\d*\.*\d*)\s*,?\s*([+-]?\d*\.*\d*)\s*,?\s*([+-]?\d*\.*\d*),?\s*([+-]?\d*\.*\d*),?\s*$/
                    .exec(mc[i]);
            if (c && c[0])
            {
                var axis = new window.XML3DVec3(+c[1], +c[2], +c[3]);
                //XML3D.debug.logWarning("Axis: " + axis);
                //XML3D.debug.logWarning("Angle: " + +c[4]);
                var rot = new window.XML3DRotation(axis, +c[4]);
                //XML3D.debug.logWarning("Axis: " + rot.axis);
                //XML3D.debug.logWarning("Angle: " + rot.angle);
                vecs.push(rot);
            }
        }
//        if (mc[i]) {
//            var r = new XML3DRotation();
//            XML3D.debug.logWarning(mc[i]);
//            r.setAxisAngleValue(mc[i]);
//            vecs.push(r);
//        }
    }
    var os ="";
    for(var i = 0; i < vecs.length; i++) {
        var q = vecs[i]._data;
        os += q[3] + " " + q[0] + " " + q[1] + " " + q[2] + " ";
    }

    return new XML3D.animation.RotationArray(vecs);
};


if (!window.XML3DRotation.prototype.slerp) {

    XML3D.Quaternion = function(axis, angle) {
        this.x = axis.x * s;
        this.y = axis.y * s;
        this.z = axis.z * s;
        this.w = c;
    };

    XML3D.Quaternion.prototype.__defineGetter__("axis", function() {
        var s = Math.sqrt(1 - this.w * this.w);
        if (s < 0.001) {
            return new window.XML3DVec3(0, 0, 1);
        }
        return new window.XML3DVec3(this.x / s, this.y / s, this.z / s);
    });

    XML3D.Quaternion.prototype.__defineGetter__("angle", function() {
        var angle = 2 * Math.acos(this.w);
        var s = Math.sqrt(1 - this.w * this.w);
        if (s < 0.001) {
            return 0.0;
        }
        return angle;
    });

    XML3D.Quaternion.prototype.slerp = function(that, t) {
        var cosom = this.x * that.x + this.y * that.y + this.z * that.z + this.w * that.w;
        var rot1;
        if (cosom < 0.0) {
            cosom = -cosom;
            rot1 = that.negate();
        } else {
            rot1 = new window.XML3DRotation(that.x, that.y, that.z,
                    that.w);
        }
        var scalerot0, scalerot1;
        if ((1.0 - cosom) > 0.00001) {
            var omega = Math.acos(cosom);
            var sinom = Math.sin(omega);
            scalerot0 = Math.sin((1.0 - t) * omega) / sinom;
            scalerot1 = Math.sin(t * omega) / sinom;
        } else {
            scalerot0 = 1.0 - t;
            scalerot1 = t;
        }
        return this.multScalar(scalerot0).add(rot1.multScalar(scalerot1));
    };

    window.XML3DRotation.prototype.slerp = function(that, t) {
        var q1 = new XML3D.Quaternion(this.axis, this.angle);
        var q2 = new XML3D.Quaternion(that.axis, that.angle);
        var q3 = q1.slerp(q2, t);
        return new window.XML3DRotation(q3.axis, q3.angle);
    };
}

/*************************************************************************/
/*                                                                       */
/*  xml3d_scene_controller.js                                            */
/*  Navigation method for XML3D                                             */
/*                                                                       */
/*  Copyright (C) 2010                                                   */
/*  DFKI - German Research Center for Artificial Intelligence            */
/*                                                                       */
/*  xml3d.js is free software; you can redistribute it and/or modify     */
/*  under the terms of the GNU General Public License as                 */
/*  published by the Free Software Foundation; either version 2 of       */
/*  the License, or (at your option) any later version.                  */
/*                                                                       */
/*  xml3d.js is distributed in the hope that it will be useful, but      */
/*  WITHOUT ANY WARRANTY; without even the implied warranty of           */
/*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.                 */
/*  See the GNU General Public License                                   */
/*  (http://www.fsf.org/licensing/licenses/gpl.html) for more details.   */
/*                                                                       */
/*************************************************************************/

//Check, if basics have already been defined
if(!XML3D)
    XML3D = {};
if(!XML3D.util)
    XML3D.util = {};

XML3D.util.Timer = function() {
    this.start();
};

XML3D.util.Timer.prototype.restart = function() {
    var prevTime = this.time;
    this.start();
    return this.time - prevTime;
};

XML3D.util.Timer.prototype.start = function() {
    this.time = new Date().getTime();
};


XML3D.Camera = function(view) {
    this.view = view;
};

XML3D.Camera.prototype.__defineGetter__("orientation", function() {
    return this.view.orientation;
});
XML3D.Camera.prototype.__defineGetter__("position", function() {
    return this.view.position;
});
XML3D.Camera.prototype.__defineSetter__("orientation", function(orientation) {
    /*xml3d.debug.logError("Orientation: " + orientation);*/
    //xml3d.copyRotation(this.view.orientation, orientation);
    var ax = orientation.axis;
    var str = ax.x + " " + ax.y + " " + ax.z + " " + orientation.angle;
    this.view.setAttribute("orientation", str);
});
XML3D.Camera.prototype.__defineSetter__("position", function(position) {
    //xml3d.copyVector(this.view.position, position);
    var str = position.x + " " + position.y + " " + position.z;
    this.view.setAttribute("position", str);
});
XML3D.Camera.prototype.__defineGetter__("direction", function() {
    return this.view.getDirection();
});
XML3D.Camera.prototype.__defineGetter__("upVector", function() {
    return this.view.getUpVector();
});
XML3D.Camera.prototype.__defineGetter__("fieldOfView", function() {
    return this.view.fieldOfView;
});

XML3D.Camera.prototype.rotateAroundPoint = function(q0, p0) {
    //xml3d.debug.logError("Orientation: " + this.orientation.multiply(q0).normalize());
    var tmp = this.orientation.multiply(q0);
    tmp.normalize();
    this.orientation = tmp;
    var trans = new window.XML3DRotation(this.inverseTransformOf(q0.axis), q0.angle).rotateVec3(this.position.subtract(p0));
    this.position = p0.add(trans);
};

XML3D.Camera.prototype.lookAround = function(rotSide, rotUp, upVector) {
    //xml3d.debug.logError("Orientation: " + this.orientation.multiply(q0).normalize());
    var check = rotUp.multiply(this.orientation);
    var tmp;
    if( Math.abs(upVector.dot(check.rotateVec3(new window.XML3DVec3(0,0,-1)))) > 0.95 )
        tmp = rotSide;
    else
        tmp = rotSide.multiply(rotUp);
    tmp.normalize();
    tmp = tmp.multiply(this.orientation);
    tmp.normalize();
    this.orientation = tmp;
};

XML3D.Camera.prototype.rotate = function(q0) {
    this.orientation = this.orientation.multiply(q0).normalize();
};

XML3D.Camera.prototype.translate = function(t0) {
    this.position = this.position.add(t0);
};

XML3D.Camera.prototype.inverseTransformOf = function(vec) {
    return this.orientation.rotateVec3(vec);
};

XML3D.Xml3dSceneController = function(xml3dElement) {
    this.webgl = typeof(xml3dElement.style) !== 'object';

    this.xml3d = xml3dElement;
    this.canvas = this.webgl ?  xml3dElement.canvas : xml3dElement;

    var view = this.getView();
    if (!view)
    {
        XML3D.debug.logWarning("No view found, rendering disabled!");
        if (xml3dElement.update)
            xml3dElement.update(); // TODO: Test
    }
    if (!this.xml3d || !view)
    {
        XML3D.debug.logError("Could not initialize Camera Controller.");
        return;
    }

    this.camera = new XML3D.Camera(view);
    this.timer = new XML3D.util.Timer();
    this.prevPos = {x: -1, y: -1};

    this.mode = "examine";
    this.revolveAroundPoint = new window.XML3DVec3(0, 0, 0);
    this.rotateSpeed = 1;
    this.zoomSpeed = 20;
    this.spinningSensitivity = 0.3;
    this.isSpinning = false;

    this.upVector = this.camera.upVector;

    this.moveSpeedElement = document.getElementById("moveSpeed");
    this.useKeys = document.getElementById("useKeys");

    var navigations = xml3dElement.getElementsByTagName("navigation");

    if(navigations.length > 0)
    {
        var config = navigations[0];
        this.mode = config.getAttribute("mode");

        if(this.mode == "none")
            return;

        if(this.mode != "walk" && this.mode != "examine" )
            this.mode = "examine";

        if(config.getAttribute("resolveAround")){
            XML3D.debug.logWarning("resolveAround is obsolete. Use 'revolveAround' instead!");
            this.revolveAroundPoint.setVec3Value(config.getAttribute("resolveAround"));
        }
        if(config.getAttribute("revolveAround")){
            this.revolveAroundPoint.setVec3Value(config.getAttribute("revolveAround"));
        }
        if(config.getAttribute("speed"))
        {
            this.zoomSpeed *= config.getAttribute("speed");
        }
    }

    this.attach();
};

XML3D.Xml3dSceneController.prototype.setCamera = function(newCamera) {
    this.camera = new XML3D.Camera(newCamera);
    this.upVector = this.camera.upVector;
};

XML3D.Xml3dSceneController.prototype.setRevolvePoint = function(vec) {
    this.revolveAroundPoint = vec;
};

XML3D.Xml3dSceneController.prototype.attach = function() {
    var self = this;
    this._evt_mousedown = function(e) {self.mousePressEvent(e);};
    this._evt_mouseup = function(e) {self.mouseReleaseEvent(e);};
    this._evt_mousemove = function(e) {self.mouseMoveEvent(e);};
    this._evt_contextmenu = function(e) {self.stopEvent(e);};
    this._evt_keydown = function(e) {self.keyHandling(e);};

    this.canvas.addEventListener("mousedown", this._evt_mousedown, false);
    document.addEventListener("mouseup", this._evt_mouseup, false);
    document.addEventListener("mousemove",this._evt_mousemove, false);
    this.canvas.addEventListener("contextmenu", this._evt_contextmenu, false);
    if (this.useKeys)
        document.addEventListener("keydown", this._evt_keydown, false);
};

XML3D.Xml3dSceneController.prototype.detach = function() {
    this.canvas.removeEventListener("mousedown", this._evt_mousedown, false);
    document.removeEventListener("mouseup", this._evt_mouseup, false);
    document.removeEventListener("mousemove",this._evt_mousemove, false);
    this.canvas.removeEventListener("contextmenu", this._evt_contextmenu, false);
    if (this.useKeys)
        document.removeEventListener("keydown", this._evt_keydown, false);
};

XML3D.Xml3dSceneController.prototype.__defineGetter__("width", function() { return this.canvas.width;});
XML3D.Xml3dSceneController.prototype.__defineGetter__("height", function() { return this.canvas.height;});

XML3D.Xml3dSceneController.prototype.getView = function() {
    //var activeView = null;
    var activeView = this.xml3d.activeView; //? this.xml3d.activeView : this.xml3d.getAttribute("activeView");
    XML3D.debug.logInfo("Active View: " + activeView);

    if (typeof activeView=="string")
    {
        if (activeView.indexOf('#') == 0)
            activeView = activeView.replace('#', '');
        XML3D.debug.logInfo("Trying to resolve view '" + activeView +"'");
        activeView = document.getElementById(activeView);
    }

    // if activeView is not defined or the reference is not valid
    // use the first view element
    if (!activeView)
    {
        XML3D.debug.logWarning("No view referenced. Trying to use first view.");
        activeView = document.evaluate('xml3d:view[1]', this.xml3d, function() {
            return XML3D.xml3dNS;
        }, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }

    if(false)
    {
        // no view present at all
        // create new one and append it to defs element
        XML3D.debug.logWarning("No view defined. Trying to create view.");

        // create it
        activeView = document.createElementNS(XML3D.xml3dNS, "view");

        var id = "created_xml3d.Xml3dSceneController.view_";
        id += "" + Math.random();
        activeView.setAttribute("id", id);

        // append it to defs
        var defsEl =  document.evaluate('xml3d:defs[1]', this.xml3d, function() {
            return XML3D.xml3dNS;
        }, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        if(!defsEl)
        {
            defsEl = document.createElementNS(XML3D.xml3dNS, "defs");
            this.xml3d.appendChild(defsEl);
        }

        defsEl.appendChild(activeView);
    }

    return activeView;
};

XML3D.Xml3dSceneController.prototype.stopEvent = function(ev) {
    if (ev.preventDefault)
        ev.preventDefault();
    if (ev.stopPropagation)
        ev.stopPropagation();
    ev.returnValue = false;
};

XML3D.Xml3dSceneController.prototype.update = function() {
    if (this.animation || this.needUpdate) {
        this.needUpdate = false;
        if (this.xml3d.update)
            this.xml3d.update();
    }
};

XML3D.Xml3dSceneController.prototype.NO_MOUSE_ACTION = 0;
XML3D.Xml3dSceneController.prototype.TRANSLATE = 1;
XML3D.Xml3dSceneController.prototype.DOLLY = 2;
XML3D.Xml3dSceneController.prototype.ROTATE = 3;
XML3D.Xml3dSceneController.prototype.LOOKAROUND = 4;

XML3D.Xml3dSceneController.prototype.mousePressEvent = function(event) {

    var ev = event || window.event;

    var button = (ev.which || ev.button);
    switch (button) {
        case 1:
            if(this.mode == "examine")
                this.action = this.ROTATE;
            else
                this.action = this.LOOKAROUND;
            break;
        case 2:
            this.action = this.TRANSLATE;
            break;
        case 3:
            this.action = this.DOLLY;
            break;
        default:
            this.action = this.NO_MOUSE_ACTION;
    }

    this.prevPos.x = ev.pageX;
    this.prevPos.y = ev.pageY;

    this.stopEvent(event);
    return false;
};

XML3D.Xml3dSceneController.prototype.mouseReleaseEvent = function(event) {
    this.stopEvent(event);

    //if (this.action == this.ROTATE && this.mouseSpeed > this.spinningSensitivity)
    //    this.startSpinning();

    this.action = this.NO_MOUSE_ACTION;
    return false;
};

XML3D.Xml3dSceneController.prototype.startSpinning = new function() {
    this.isSpinning = true;
    // TODO
};

XML3D.Xml3dSceneController.prototype.computeMouseSpeed = function(event) {
    var dx = (event.pageX - this.prevPos.x);
    var dy = (event.pageY - this.prevPos.y);
    var dist = Math.sqrt(+dx*dx + dy*+dy);
    this.delay = this.timer.restart();
    if (this.delay == 0)
        this.mouseSpeed = dist;
      else
        this.mouseSpeed = dist/this.delay;
    XML3D.debug.logWarning("Mouse speed: " + this.mouseSpeed);
};

XML3D.Xml3dSceneController.prototype.mouseMoveEvent = function(event, camera) {

    var ev = event || window.event;
    if (!this.action)
        return;
    switch(this.action) {
        case(this.TRANSLATE):
            var f = 2.0* Math.tan(this.camera.fieldOfView/2.0) / this.height;
            var dx = f*(ev.pageX - this.prevPos.x);
            var dy = f*(ev.pageY - this.prevPos.y);
			var trans = new window.XML3DVec3(-dx, dy, 0.0);
            this.camera.translate(this.camera.inverseTransformOf(trans));
            break;
        case(this.DOLLY):
            var dy = this.zoomSpeed * (ev.pageY - this.prevPos.y) / this.height;
            this.camera.translate(this.camera.inverseTransformOf(new window.XML3DVec3(0, 0, dy)));
            break;
        case(this.ROTATE):

            var dx = -this.rotateSpeed * (ev.pageX - this.prevPos.x) * 2.0 * Math.PI / this.width;
            var dy = -this.rotateSpeed * (ev.pageY - this.prevPos.y) * 2.0 * Math.PI / this.height;

            var mx = new window.XML3DRotation(new window.XML3DVec3(0,1,0), dx);
            var my = new window.XML3DRotation(new window.XML3DVec3(1,0,0), dy);
            //this.computeMouseSpeed(ev);
            this.camera.rotateAroundPoint(mx.multiply(my), this.revolveAroundPoint);
            break;
        case(this.LOOKAROUND):
            var dx = -this.rotateSpeed * (ev.pageX - this.prevPos.x) * 2.0 * Math.PI / this.width;
            var dy = this.rotateSpeed * (ev.pageY - this.prevPos.y) * 2.0 * Math.PI / this.height;
            var cross = this.upVector.cross(this.camera.direction);

            var mx = new window.XML3DRotation( this.upVector , dx);
            var my = new window.XML3DRotation( cross , dy);

            this.camera.lookAround(mx, my, this.upVector);
            break;
    }

    if (this.action != this.NO_MOUSE_ACTION)
    {
        this.needUpdate = true;
        this.prevPos.x = ev.pageX;
        this.prevPos.y = ev.pageY;
        event.returnValue = false;

        this.update();
    }
    this.stopEvent(event);
    return false;
};



// -----------------------------------------------------
// key movement
// -----------------------------------------------------

XML3D.Xml3dSceneController.prototype.keyHandling = function(e) {
    var KeyID = e.keyCode;
    if (KeyID == 0) {
        switch (e.which) {
        case 119:
            KeyID = 87;
            break; // w
        case 100:
            KeyID = 68;
            break; // d
        case 97:
            KeyID = 65;
            break; // a
        case 115:
            KeyID = 83;
            break; // s
        }
    }

    var xml3d = this.xml3d;
    // alert(xml3d);
    var camera = this.camera;
    var dir = camera.direction;
    if (xml3d) {
        switch (KeyID) {
        case 38: // up
        case 87: // w
            camera.position = camera.position.add(dir.scale(this.zoomSpeed));
            break;
        case 39: // right
        case 68: // d
            var np = camera.position;
            np.x -= dir.z * this.zoomSpeed;
            np.z += dir.x * this.zoomSpeed;
            camera.position = np;
            break;
        case 37: // left
        case 65: // a
            var np = camera.position;
            np.x += dir.z * this.zoomSpeed;
            np.z -= dir.x * this.zoomSpeed;
            camera.position = np;
            break;
        case 40: // down
        case 83: // s
            camera.position = camera.position.subtract(dir.scale(this.zoomSpeed));
            break;

        default:
            return;
        }
        this.needUpdate = true;
    }
    this.stopEvent(e);
};

//-----------------------------------------------------
//attach/detach of all controllers
//-----------------------------------------------------
XML3D.Xml3dSceneController.attachAllControllers = function() {

    XML3D.debug.logInfo("Attaching all active controllers to xml3d elements.");

    var xml3dList = Array.prototype.slice.call( document.getElementsByTagNameNS(XML3D.xml3dNS, 'xml3d') );
    for(var node in xml3dList) {
        XML3D.Xml3dSceneController.controllers[node].attach();
    }
};

XML3D.Xml3dSceneController.detachAllControllers = function() {

    XML3D.debug.logInfo("Detaching all active controllers from xml3d elements.");

    var xml3dList = Array.prototype.slice.call( document.getElementsByTagNameNS(XML3D.xml3dNS, 'xml3d') );
    for(var node in xml3dList) {
        XML3D.Xml3dSceneController.controllers[node].detach();
    }
};

XML3D.Xml3dSceneController.getController = function(xml3d) {

    var xml3dList = Array.prototype.slice.call( document.getElementsByTagNameNS(XML3D.xml3dNS, 'xml3d') );
    for(var node in xml3dList) {

        var ctrl = XML3D.Xml3dSceneController.controllers[node];
        if(xml3d == ctrl.xml3d)
            return ctrl;
    }

    return null;
};

//-----------------------------------------------------
//loading/unloading
//-----------------------------------------------------

(function() {

    var onload = function() {

        var xml3dList = Array.prototype.slice.call( document.getElementsByTagNameNS(XML3D.xml3dNS, 'xml3d') );

        XML3D.Xml3dSceneController.controllers = new Array();
        for(var i in xml3dList) {
            XML3D.debug.logInfo("Attaching Controller to xml3d element.");
            XML3D.Xml3dSceneController.controllers[i] = new XML3D.Xml3dSceneController(xml3dList[i]);
        };
    };
    var onunload = function() {
        for(var i in XML3D.Xml3dSceneController.controllers)
        {
            XML3D.Xml3dSceneController.controllers[i].detach();
        }
    };

    window.addEventListener('load', onload, false);
    window.addEventListener('unload', onunload, false);
    window.addEventListener('reload', onunload, false);

})();

/***********************************************************************/
if(!XML3D) 
    XML3D = {};

XML3D.SceneInspector = function(xml3d) {
    var self = this;
    this.xml3d = xml3d;
    if(!this.xml3d)
        return;

    this.inspect = function(event){
        var button = (event.which || event.button);
        if(button == 2){
            var pt = XML3D.util.convertPageCoords(this.xml3d, event.pageX, event.pageY);
            var node = this.xml3d.getElementByPoint(pt.x, pt.y);
            var path = "";
            while(node && node != xml3d){
                path += " >> " + node + " (ID: " + node.id + ")";
                node = node.parentNode;
            }
            XML3D.debug.logInfo("Mouse: " + pt.x + " " + pt.y + " => " + path);
        }
    };

    this.xml3d.addEventListener("mouseup",
    function(event){ self.inspect(event); }, false);
};
