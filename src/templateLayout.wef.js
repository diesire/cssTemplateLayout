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
                console.log("templateLayout listens: start parsing");
                lastEvent = e;
                buffer = {};
            }, false);

            document.addEventListener(parser.events.PROPERTY_FOUND, function (e) {
                console.log("templateLayout listens: property found");
                lastEvent = e;
                if (isSupportedProperty(e.data)) {
                    store(e.data);
                }
            }, false);

            document.addEventListener(parser.events.PARSER_DONE, function (e) {
                console.log("templateLayout listens: parsing done");
                lastEvent = e;
                //TODO: validate and transform
                compile();
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
                    console.log("request status: ", request.statusText);
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

    function store(rule) {
        if (!buffer[rule.selectorText]) {
            buffer[rule.selectorText] = {selectorText:rule.selectorText, declaration:{}};
        }
        buffer[rule.selectorText].declaration[rule.declaration.property] = rule.declaration.valueText;
    }

    function isSupportedProperty(rule) {
        for (var iterator in templateLayout.constants) {
            if (templateLayout.constants[iterator] == rule.declaration.property) return true;
        }
        return false;
    }

    function compile() {
        //<display-type>? && [ [ <string> [ / <row-height> ]? ]+ ] <col-width>*
        //regex for <display-type>     /\s*inline|block|list-item|inline-block|table|inline-table|table-row-group|table-header-group|table-footer-group|table-row|table-column-group|table-column|table-cell|table-caption|none/i
        //regex for <string>    /\s*\"[a-zA-Z0-9.@ ]+\"\s*/


        function parseDisplay(displayValue) {
            //var displayTypeRegExp = /\s*inline|block|list-item|inline-block|table|inline-table|table-row-group|table-header-group|table-footer-group|table-row|table-column-group|table-column|table-cell|table-caption|none/i;
            //var stringRegExp = /\s*\"[a-zA-Z0-9.@ ]+\"\s*/;

            console.log("displayyyyyyyyyyyyy");
            try {
                var separatorPattern = "\\s*";
                var displayTypePattern = "^\\s*(inline|block|list-item|inline-block|table|inline-table|table-row-group|table-header-group|table-footer-group|table-row|table-column-group|table-column|table-cell|table-caption|none)?";
                var stringPattern = "\\s*(\"[a-zA-Z0-9.@ ]+\"\\s*)+\\s*";
                var pattern = displayTypePattern + stringPattern
                var regExp = new RegExp(pattern, "i");
                //console.log(regExp.toString());
                var result = displayValue.match(regExp);
                console.log("*********", result);
            } catch (e) {
                console.error(e);
            }

        }

        function parseProperties(rule) {
            //TODO:
            if (rule.declaration[templateLayout.constants.DISPLAY] != undefined) {
                parseDisplay(rule.declaration[templateLayout.constants.DISPLAY]);
            }
        }

        for (var selectorText in buffer) {
            var metadata = parseProperties(buffer[selectorText]);
            //var tmp = new Template(metadata);
            //TODO: insert
        }
    }

    function Template(rule) {
        this.selectorText = rule.selectorText;
        this.declaration = rule.declaration;
    }

    Template.prototype = {
        selectorText:"",
        declaration:{}
    };

    wef.plugins.register("templateLayout", templateLayout);
})();