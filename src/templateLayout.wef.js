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
            lastEvent = null;

            document.addEventListener(parser.events.PARSER_START, function (e) {
                lastEvent = e;
                buffer = {};
            }, false);

            document.addEventListener(parser.events.PROPERTY_FOUND, function (e) {
                lastEvent = e;
                if (isSupportedProperty(e.data)) {
                    store(e.data.selectorText, e.data.declaration);
                }
            }, false);

            document.addEventListener(parser.events.PARSER_DONE, function (e) {
                lastEvent = e;
                //TODO: validate and transform
            }, false);
            return templateLayout;
        },

        setTemplate:function (cssFile) {

            function readFile(url) {
                //TODO: refactor
                function ajaxReadFile() {
                    var request = new XMLHttpRequest();
                    request.open("get", url, false);
                    request.send("");
                    return request.responseText;
                }

                try {
                    return ajaxReadFile(url);
                } catch (e) {
                    //FIXME: chrome workaround
                    console.error(e);
                    throw "OperationNotSupportedException";
                }
            }

            parser.parse(readFile(cssFile));
        },

        //only for testing purposes
        getLastEvent:function () {
            return lastEvent;
        },

        getBuffer:function () {
            return buffer;
        }
    };

    var lastEvent = null;
    var buffer = {};

    function store(selectorText, declaration) {
        if (!buffer[selectorText]) {
            buffer[selectorText] = {};
        }
        buffer[selectorText][declaration.property] = declaration.valueText;
    }

    function isSupportedProperty(rule) {
        for (var property in templateLayout.constants) {
            if (templateLayout.constants[property] == rule.declaration.property) return true;
        }
        return false;
    }

    function Template(selectorText, display, position) {
        this.selectorText = selectorText;
        this.model = display;
        this.situated = position;
    }

    Template.prototype = {
        model:"",
        selectorText:"",
        situated:""
    };

    wef.plugins.register("templateLayout", templateLayout);
})();