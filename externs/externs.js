/**
 * @externs
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
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @constructor
 */
function XML3DVec3(x,y,z){};

/**
 * @constructor
 */
function XML3DRotation(){};

/**
 * @param {XML3DVec3} vec
 * @param {number} s
 */
XML3DRotation.setQuaternion = function(vec, s){};

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

/**
 * @constructor
 */
function Gamepad(){
	
    this.leftStickX = 0.0;
    this.leftStickY = 0.0;
    this.rightStickX = 0.0;
    this.rightStickY = 0.0;
    this.faceButton0 = 0.0;
    this.faceButton1 = 0.0;
    this.faceButton2 = 0.0;
    this.faceButton3 = 0.0;
    this.leftShoulder0 = 0.0;
    this.rightShoulder0 = 0.0;
    this.leftShoulder1 = 0.0;
    this.rightShoulder1 = 0.0;
    this.select = 0.0;
    this.start = 0.0;
    this.leftStickButton = 0.0;
    this.rightStickButton = 0.0;
    this.dpadUp = 0.0;
    this.dpadDown = 0.0;
    this.dpadLeft = 0.0;
    this.dpadRight = 0.0;
    this.deadZoneLeftStick = 0.25;
    this.deadZoneRightStick = 0.25;
    this.deadZoneShoulder0 = 0.0;
    this.deadZoneShoulder1 = 0.0;
    //this.images = Gamepad.ImageDataUrls_Unknown;
    this.name = "Unknown";
	
}

Gamepad.getStates = function(){};

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