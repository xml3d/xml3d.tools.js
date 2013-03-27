window.addEventListener("load", onLoad, false);

var $xml3dMain = null;
var xml3dMain = null;

var xml3dOverlay = null; // instance of XML3DOverlay

var interactors = [];

var CtrlLeftMBMouseDownDispatcher = new XMOT.Class(XMOT.util.EventDispatcher, {

    initialize: function() {

        this.callSuper();
        this.registerCustomHandler("mousedown", this.callback("_onMouseDown"));
    },

    _onMouseDown: function(evt) {
        return evt.ctrlKey; // if ctrlKey pressed dispatch, else not
    }
});

var OnlyLeftMBMouseDownDispatcher = new XMOT.Class(XMOT.util.EventDispatcher, {

    initialize: function() {

        this.callSuper();
        this.registerCustomHandler("mousedown", this.callback("_onMouseDown"));
    },

    _onMouseDown: function(evt) {
        return !evt.ctrlKey; // if ctrlKey not pressed dispatch, else not
    }
});

function onLoad() {

    $xml3dMain = $("#xml3dMain");
    xml3dMain = $xml3dMain[0];
    $xml3dMain.click(onClickMain);

    var xml3dOverlay = new XMOT.XML3DOverlay(xml3dMain);

    var targetGroup = $("#g_mainTarget")[0];
    var targetTransformable = XMOT.ClientMotionFactory.createTransformable(targetGroup);

    setupWidget(xml3dOverlay, targetTransformable);
};

function onClickMain(evt) {

    var pos = XML3D.util.convertPageCoords(xml3dMain, evt.pageX, evt.pageY);

    var el = xml3dMain.getElementByPoint(pos.x, pos.y);

    if(el) {
        console.log("main: click on src " + $(evt.target).attr("src"));
    }
    else{
        console.log("main: click on nothing");
    }
};

function setupWidget(xml3dOverlay, targetTransformable) {

    var $defsOverlay = $(XMOT.util.getOrCreateDefs(xml3dOverlay.xml3d));

    var g_yAxis = createAxis(xml3dOverlay, "yAxis", "0.1 1 0.1", "0 1 0", "1 0 0");
    var g_xAxis = createAxis(xml3dOverlay, "xAxis", "1 0.1 0.1", "1 0 0", "0 1 0");
    var g_zAxis = createAxis(xml3dOverlay, "zAxis", "0.1 0.1 1", "0 0 1", "0 0 1");

    var rootMatrix = new XML3DMatrix();
    if(targetTransformable.object.parentNode.tagName === "group")
        rootMatrix = targetTransformable.object.parentNode.getWorldMatrix();

    $defsOverlay.append(XMOT.creation.element("transform", {
        id: "t_widgetRoot",
        rotation: rootMatrix.rotation().str(),
        translation: rootMatrix.translation().str(),
    }));

    // root
    $defsOverlay.append(XMOT.creation.element("transform", {
        id: "t_widgetContainer",
        rotation: targetTransformable.getOrientation().str(),
        translation: targetTransformable.getPosition().str(),
    }));

    var g_widgetContainer = XMOT.creation.element("group", {
        id: "g_widgetContainer",
        transform: "#t_widgetContainer",
        children: [
            g_yAxis,
            g_xAxis,
            g_zAxis
        ]
    });

    var g_widgetRoot = XMOT.creation.element("group", {
        id: "g_widgetRoot",
        transform: "#t_widgetRoot",
        children: [
            g_widgetContainer
        ]
    });

    $(xml3dOverlay.xml3d).append(g_widgetRoot);

    // 1D translations
    var onlyLeftMBMouseDownDispatcher = new OnlyLeftMBMouseDownDispatcher();

    var xAxisConstraintFn = function(currentTranslation, newTranslation) {

        newTranslation.y = currentTranslation.y;
        newTranslation.z = currentTranslation.z;
    };

    createTranslater("xAxisTranslater", targetTransformable, xAxisConstraintFn,
        g_widgetContainer, g_xAxis, undefined, onlyLeftMBMouseDownDispatcher);

    var yAxisConstraintFn = function(currentTranslation, newTranslation) {

        newTranslation.x = currentTranslation.x;
        newTranslation.z = currentTranslation.z;
    };

    createTranslater("yAxisTranslater", targetTransformable, yAxisConstraintFn,
        g_widgetContainer, g_yAxis, undefined, onlyLeftMBMouseDownDispatcher);

    var zAxisConstraintFn = function(currentTranslation, newTranslation) {

        newTranslation.x = currentTranslation.x;
        newTranslation.y = currentTranslation.y;
    };

    createTranslater("zAxisTranslater", targetTransformable, zAxisConstraintFn,
        g_widgetContainer, g_zAxis, new XML3DVec3(1,0,0), onlyLeftMBMouseDownDispatcher);

    // 2D translations
    var ctrlLeftMBMouseDownDispatcher = new CtrlLeftMBMouseDownDispatcher();

    createTranslater("xyAxisTranslater", targetTransformable, function(){},
        g_widgetContainer, g_zAxis, undefined, ctrlLeftMBMouseDownDispatcher);

    createTranslater("zyAxisTranslater", targetTransformable, function(){},
        g_widgetContainer, g_xAxis, new XML3DVec3(1,0,0), ctrlLeftMBMouseDownDispatcher);

    createTranslater("xzAxisTranslater", targetTransformable, function(){},
        g_widgetContainer, g_yAxis, new XML3DVec3(0,1,0), ctrlLeftMBMouseDownDispatcher);
};

function createAxis(xml3dOverlay, id, scale, translation, color) {

    var $defsOverlay = $(XMOT.util.getOrCreateDefs(xml3dOverlay.xml3d));

    var shaderId = "s_" + id;
    var transformId = "t_" + id;

    $defsOverlay.append(XMOT.creation.element("transform", {
        id: transformId,
        scale: scale,
        translation: translation
    }));

    $defsOverlay.append(XMOT.creation.phongShader({
        id: shaderId,
        diffCol: color,
        ambInt: "1"
    }));

    return XMOT.creation.element("group", {
        transform: "#" + transformId,
        shader: "#" + shaderId,
        children: [
            XMOT.creation.box(xml3dOverlay.xml3d)
        ]
    });
};

function createTranslater(id, targetTransformable, constraintFn, g_widgetContainer, pickGrp, planeOrient, eventDispatcher) {

    var constraint = createTranslationConstraint(targetTransformable,
        constraintFn
    );

    var transformable = XMOT.ClientMotionFactory.createTransformable(
        g_widgetContainer, constraint
    );

    var translater = new XMOT.interaction.behaviors.Translater(
        id, [pickGrp], transformable, planeOrient, eventDispatcher
    );

    interactors.push(translater);
};

function createTranslationConstraint(targetTransformable, constrainTranslationFunction) {

    return {
        constrainRotation: function(newRotation, opts){
            return true;
        },
        constrainScaling: function(newScale, opts){
            return true;
        },

        constrainTranslation: function(newTranslation, opts) {
            if(!opts.transformable)
                throw new Error("Constraint: no transformable given.");

            var currentTranslation = opts.transformable.getPosition();

            constrainTranslationFunction(currentTranslation, newTranslation);
            targetTransformable.setPosition(newTranslation);

            return true;
        }
    };
};
