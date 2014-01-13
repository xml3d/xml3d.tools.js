var CONFIG_INDEXPAGE = "index.xhtml";
var CONFIG_PAGETITLE = "XML3D Motion";

var CATEGORY_LIST = {
    unknown : { name : "???" },
    misc : { name: "Misc" },
    utils : { name: "Utilities" }
};

var EXAMPLE_LIST = [

    // --- Miscellaneous ---
    {
        cat: "misc",
        name: "Animatable",
        href: "animatable.xhtml",
        info: "Tests the XML3D.tools.Animatable"
    },
    {
        cat: "misc",
        name: "Transformable",
        href: "simple.xhtml",
        info: "Tests the XML3D.tools.Transformable"
    },
    {
        cat: "misc",
        name: "Camera Controllers",
        href: "cameracontrollers.xhtml",
        info: "Tests the camera controllers"
    },
    {
        cat: "misc",
        name: "GamePad",
        href: "gamepad.xhtml",
        info: "Tests the XML3D.tools.GamepadEventProvider"
    },
    {
        cat: "misc",
        name: "Interaction Components",
        href: "interaction/index.xhtml",
        info: "Various tests for the interaction components"
    },

    // --- Utilities ---
    {
        cat: "utils",
        name: "TransformTracker",
        href: "transformtracker.xhtml",
        info: "Interactively test the observation of transformation changes."
    },
    {
        cat: "utils",
        name: "ViewTracker",
        href: "viewtracker.xhtml",
        info: "Tests the view-tracking by placing a rectangle in the \"HUD\" of the user."
    },
    {
        cat: "utils",
        name: "Element Factory",
        href: "elementfactory.xhtml",
        info: "Constructs a lid cube using the XML3D.tools.creation facility."
    },
    {
        cat: "utils",
        name: "TransformSensor",
        href: "transformsensor.xhtml",
        info: "Application of the TransformSensor utility."
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
