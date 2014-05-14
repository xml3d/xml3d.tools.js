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
var CONFIG_INDEXPAGE = "index.xhtml";
var CONFIG_PAGETITLE = "xml3d.tools.js - Interaction";

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
        name: "Gizmos",
        href: "tests/test_gizmos.xhtml",
        info: "Widgets for performing constrained rotation and translation."
    },
    {
        cat: "complexwidgets",
        name: "AlongSurfaceTranslateGizmo",
        href: "tests/test_alongsurfacetranslategizmo.xhtml",
        info: "A gizmo for translating a node along the surface it is placed on."
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
        name: "Back to Main",
        href: "../index.xhtml",
        info: "Back to the main page of the xml3d.tools.js examples."
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
