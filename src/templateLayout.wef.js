/*!
 * TemplateLayout Wef plugin
 * Copyright (c) 2011 Pablo Escalada
 * MIT Licensed
 */

//requires: cssParser
var parser = wef.fn.cssParser; //TODO: loader
//exports: templateLayout


(function () {
    var templateLayout = {
        name:"templateLayout",
        version:"0.0.1",
        description:"W3C CSS Template Layout Module",
        authors:["Pablo Escalada <uo1398@uniovies>"],
        licenses:["MIT"], //TODO: Licenses
        constants:{
            DISPLAY:"display",
            POSITION:"position"
        },

        init:function () {
            document.addEventListener(parser.events.PROPERTY_FOUND, function (e) {
                console.log("listener........"+e.data.selectorText, e.data.declaration);
                lastEvent = e;
                if(isSupportedProperty(e.data.declaration)) {
                    store(e.data.selectorText, e.data.declaration);
                }
            }, false);
            return templateLayout;
        },

        transform:function (cssFile) {

            function readFile(file) {
                //TODO: refactor wef.ajax
                function ajaxReadFile() {
                    var request = new XMLHttpRequest();
                    request.open("get", file, false);
                    request.send("");
                    return request.responseText;
                }

                try {
                    return ajaxReadFile(file);
                } catch (e) {
                    //FIXME: chrome workaround
                    console.error(e);
                    throw "OperationNotSupportedException";
                }
            }

            parser.parse(readFile(cssFile));
        },

        //testing purposes
        getLastEvent:function () {
            return lastEvent;
        },
        getBuffer: function() {
            return buffer;
        }
    };

    var lastEvent = null;
    var buffer = {};

    function store(selector, declaration) {
        buffer[selector] = declaration;
    }

    function isSupportedProperty(declaration) {
        console.log(" is----- ");
        templateLayout.constants.some(function(property, i, array) {
            console.log(" is-- ", declaration.property, " - ", property);
            return declaration.property == property;
        });
    }

    function Template(selectorText, model, situated) {
        this.selectorText = selectorText;
        this.model = model;
        this.situated = situated;
    }

    Template.prototype = {
        model:"",
        selectorText:"",
        situated:""
    };

    wef.plugins.register("templateLayout", templateLayout);
})();