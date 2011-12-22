/*!
 * CSS Template Layout
 * Copyright (c) 2011 Pablo Escalada
 * MIT Licensed
 */

//requires: cssParser
//exports: templateLayout

(function () {
    var lastEvent, buffer, parser;
    var that = {
        constants:{
            DISPLAY:"display",
            POSITION:"position"
        },

        setTemplate:function (cssFile) {

            function readFile(url) {
                //TODO: refactor
                function ajaxReadFile() {
                    var request = new XMLHttpRequest();
                    request.open("get", url, false);
                    request.send("");
                    wef.log.info("request status: ", request.statusText);
                    return request.responseText;
                }

                try {
                    return ajaxReadFile(url);
                } catch (e) {
                    //FIXME: chrome workaround
                    wef.log.info(e);
                    throw "OperationNotSupportedException";
                }
            }

            wef.fn.cssParser.parse(readFile(cssFile));
        },

        //only for testing purposes
        getLastEvent:function () {
            return lastEvent;
        },

        getBuffer:function () {
            return buffer;
        }
    };

    function init() {
        lastEvent = null;
        buffer = {};
        parser = wef.fn.cssParser;

        document.addEventListener(parser.events.PARSER_START, function (e) {
            wef.log.debug(this.toString());
            wef.log.info("templateLayout listens: start parsing");
            lastEvent = e;
            buffer = {};
        }, false);

        document.addEventListener(parser.events.PROPERTY_FOUND, function (e) {
            wef.log.info("templateLayout listens: property found");
            lastEvent = e;
            if (isSupportedProperty(e.data)) {
                store(e.data);
            }
        }, false);

        document.addEventListener(parser.events.PARSER_DONE, function (e) {
            wef.log.info("templateLayout listens: parsing done");
            lastEvent = e;
            //TODO: validate and transform
            compile();
        }, false);
    };
    init();

    function store(rule) {
        if (!buffer[rule.selectorText]) {
            buffer[rule.selectorText] = {selectorText:rule.selectorText, declaration:{}};
        }
        buffer[rule.selectorText].declaration[rule.declaration.property] = rule.declaration.valueText;
    }

    function isSupportedProperty(rule) {
        for (var iterator in that.constants) {
            if (that.constants[iterator] == rule.declaration.property) return true;
        }
        return false;
    }

    function compile() {
        //Grammar: <display-type>? && [ [ <string> [ / <row-height> ]? ]+ ] <col-width>*

        function parseDisplay(displayValue) {
            var metadata = {};
            var displayTypeRegExp = /^\s*(inline|block|list-item|inline-block|table|inline-table|table-row-group|table-header-group|table-footer-group|table-row|table-column-group|table-column|table-cell|table-caption|none)?/ig;
            var stringRegExp = /\s*"([a-zA-Z0-9.@ ])+"/ig;
            metadata.displayType = displayValue.match(displayTypeRegExp);
            metadata.grid = displayValue.match(stringRegExp);
            wef.log.info("+++++", displayValue, " ::: ", metadata);
        }

        function parseProperties(rule) {
            //TODO:
            if (rule.declaration[that.constants.DISPLAY] != undefined) {
                parseDisplay(rule.declaration[that.constants.DISPLAY]);
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

    templateLayout = that;
})();