var CONFIG_INDEXPAGE = "index.xhtml";
var CONFIG_PAGETITLE = "XML3D Motion - Interaction";

var CATEGORY_LIST = {
    unknown : { name : "???" },
    complexwidgets: { name: "Complex Widgets" },
    simplewidgets: { name: "Simple Widgets" },
    behaviors: { name: "Behaviors" },
    misc : { name: "Misc" }
};

var EXAMPLE_LIST = [
    // --- Complex Widgets ---
    {
        cat: "complexwidgets",
        name: "TranslateRotateGizmo",
        href: "tests/test_translaterotategizmo.xhtml",
        info: "A widget for performing constrained rotation and translation."
    },
    {
        cat: "complexwidgets",
        name: "RingMenu",
        href: "tests/test_ringmenu.xhtml",
        info: "A widget for selecting objects placed on a ring."
    },
    {
        cat: "complexwidgets",
        name: "TransformBox",
        href: "tests/test_transformbox.xhtml",
        info: "A widget to perform translation, rotation and scaling."
    },
    {
        cat: "complexwidgets",
        name: "RotatorBox",
        href: "tests/test_rotatorbox.xhtml",
        info: "A widget for performing constrained rotation and translation."
    },

    // --- Simple Widgets ---
    {
        cat: "simplewidgets",
        name: "TranslateGizmo",
        href: "tests/test_translategizmo.xhtml",
        info: "A widget for performing constrained translation."
    },
    {
        cat: "simplewidgets",
        name: "RotateGizmo",
        href: "tests/test_rotategizmo.xhtml",
        info: "A widget for performing constrained rotation."
    },
    {
        cat: "simplewidgets",
        name: "TranslateBox",
        href: "tests/test_translatebox.xhtml",
        info: "A widget for translating objects using an interactive cube."
    },
    {
        cat: "simplewidgets",
        name: "UniformScaler",
        href: "tests/test_uniformscaler.xhtml",
        info: "A widget for uniform scaling of objects by dragging small cubes at the corners of the object."
    },
    {
        cat: "simplewidgets",
        name: "SingleAxisRotator",
        href: "tests/test_axisrotator.xhtml",
        info: "A widget for rotating an object around a single axis. It places interactive bars along the axis."
    },

    // --- Behaviors ---
    {
        cat: "behaviors",
        name: "Translatable",
        href: "tests/test_translatable.xhtml",
        info: "A behavior for translating a node inside a plane."
    },
    {
        cat: "behaviors",
        name: "Rotatable",
        href: "tests/test_rotatable.xhtml",
        info: "A behavior for rotating a node."
    },
    {
        cat: "behaviors",
        name: "Scalable",
        href: "tests/test_scalable.xhtml",
        info: "A behavior for rotating a node."
    },

    // --- Miscellaneous ---
    {
        cat: "misc",
        name: "TrackBall",
        href: "tests/test_trackball.xhtml",
        info: "A test for the class underlying the .rotatable() plugin."
    },
    {
        cat: "misc",
        name: "TransformBox for Flat Surfaces",
        href: "tests/test_transformbox_flat.xhtml",
        info: "The TransformBox attached to a plane."
    },
    {
        cat: "misc",
        name: "Back to Motion Library",
        href: "../index.xhtml",
        info: "Back to the main page of the Motion Library examples."
    },
];

var CURRENT = null;
var CURRENT_CAT = null;

function initPage(){

    var url = window.location.href;
    for(var i in EXAMPLE_LIST){
        if(url.indexOf(EXAMPLE_LIST[i].href) != -1){
            CURRENT = EXAMPLE_LIST[i];
        }
    }
    if(CURRENT)
        CURRENT_CAT = CATEGORY_LIST[CURRENT.cat] || CATEGORY_LIST.unknown;

    window.LINK_PREFIX = "";
    if(CURRENT){
        var idx = 0
        while( (idx = CURRENT.href.indexOf("/", idx)) != -1){
            idx++; window.LINK_PREFIX += "../";
        }
    }

    if(window.PAGE_INDEX){
        buildIndex();
    }


    buildNavigation();

    var header = $('<div id="header" ><h1>'
                 + '<a href="'+ LINK_PREFIX + CONFIG_INDEXPAGE
                 + '" >' + CONFIG_PAGETITLE + '</a></h1><h2></h2><h3></h3></div>'
    );
    $(document.body).prepend(header);
    var footer = $('<div id="footer" ></div>')
    $(document.body).append(footer);

    if(CURRENT_CAT)
        header.find("h2").text( CURRENT_CAT.name);
    else
        header.find("h2").hide();
    if(CURRENT)
        header.find("h3").text( CURRENT.name);
    else
        header.find("h3").hide();

}

function buildIndex(){
    var content = $("#content");
    var container = $('<div id="start" ></div>');
    var list = buildTestList();
    container.append(list);
    content.append(container);
}

function buildNavigation(){
    var navi = $('<div id="navigation" ></div>');
    navi.append($("<h4>Navigation</h4>"));

    function adjustNavi(){
        navi.height($(document.body).hasClass("navi_hidden") ? 43 : $(window).height() - 8);
    }

    navi.find("h4").click(function(){
        $(document.body).toggleClass("navi_hidden");
        adjustNavi();
    });
    $(window).bind('resize', adjustNavi);
    adjustNavi();

    var inner = $('<div class="inner"></div>');
    navi.append(inner);
    var naviList = buildTestList();
    inner.append(naviList);

    naviList.prepend($('<li><a href="' + LINK_PREFIX + CONFIG_INDEXPAGE + '">Index</a></li>'));

    $(document.body).prepend(navi);
}

function buildTestList(){
    var naviList = $('<ul class="main" ></ul>');

    for(var i in CATEGORY_LIST)
        CATEGORY_LIST[i].examples = [];

    for(var i in EXAMPLE_LIST){
        (CATEGORY_LIST[EXAMPLE_LIST[i].cat] || CATEGORY_LIST.unknown).examples.push(EXAMPLE_LIST[i]);
    }

    for(var catId in CATEGORY_LIST){
        var cat = CATEGORY_LIST[catId];
        if(cat.examples.length == 0)
            continue;
        var header = $('<li><h5>' + cat.name + '</h5></li>');
        var list = $('<ul class="sub" ></ul>');
        for(var i in cat.examples){
            var entry = cat.examples[i];
            list.append($('<li><a href="' + LINK_PREFIX + entry.href + '">' + entry.name + '</a><span class="info">' +
                ( entry.info || "" ) + '</span></li>'))

        }
        header.append(list);
        naviList.append(header);
    }

    return naviList;
}





$(function(){
    initPage();
});
