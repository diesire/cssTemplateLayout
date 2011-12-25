/*!
 * CSS Template Layout
 * Copyright (c) 2011 Pablo Escalada
 * MIT Licensed
 */
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
                    wef.log.error(e);
                    throw "OperationNotSupportedException";
                }
            }

            wef.fn.cssParser.parse(readFile(cssFile));
        insertTemplate:function (templateSource) {
            wef.log.info("adding template...");
            wef.fn.cssParser.parse(templateSource);
            wef.log.info("template added OK");
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
        wef.log.info("property stored: ", rule.declaration.property);
    }

    function isSupportedProperty(rule) {
        for (var iterator in that.constants) {
            if (that.constants[iterator] == rule.declaration.property) {
                wef.log.info("supported property found: ", rule.declaration.property);
                return true;
            }
        }
        return false;
    }

    function compile() {
        wef.log.info("compiling...");
        function parseDisplay(displayValue) {
            /**
             * Name:    ‘display’
             * New value:    <display-type>? && [ [ <string> [ / <row-height> ]? ]+ ] <col-width>*
             * Percentages:    N/A
             * Computed value:    specified value
             *
             * The <display-type> is one of the following keywords. An omitted keyword is equivalent to ‘block’.
             * <display-type> = inline | block | list-item | inline-block | table | inline-table
             * | table-row-group | table-header-group | table-footer-group | table-row
             * | table-column-group | table-column | table-cell | table-caption | none
             *
             * Each <string> consist of one or more at signs (“@”), letters (or digits, see <letter> below),
             * periods (“.”) and spaces
             *
             * Each <row-height> sets the height of the preceding row. The default is ‘auto’.
             * The values can be as follows:
             * <length> An explicit height for that row. Negative values make the template illegal. If the length is
             * expressed in ‘gr’ units, these refer to the inherited grid, not the grid defined by the template itself.
             * auto The row's height is determined by its contents.
             * * (asterisk) All rows with an asterisk will be of equal height.
             *
             * Each <col-width> can be one of the following:
             * <length> An explicit width for that column. Negative values make the template illegal.
             * * (asterisk.) All columns with a ‘*’ have the same width. See the algorithm below.
             * max-content, min-content, minmax(p,q), fit-content
             */
            wef.log.info("compiling display...");
            wef.log.debug("display source: ", displayValue);
            var displayMetadata = {
                displayType: null,
                grid: null
            };
            var displayTypeRegExp = /^\s*(inline|block|list-item|inline-block|table|inline-table|table-row-group|table-header-group|table-footer-group|table-row|table-column-group|table-column|table-cell|table-caption|none)?/ig;
            var stringRegExp = /\s*"([a-zA-Z0-9.@ ])+"/ig;
            if (displayValue != undefined) {
                displayMetadata.displayType = displayValue.match(displayTypeRegExp);
                displayMetadata.grid = displayValue.match(stringRegExp);
            }
            wef.log.info("display result: ", displayMetadata);
            return displayMetadata;
        }

        function parsePosition(positionValue) {
            /**
             * Name:    position
             * New value:    <letter> | same
             * Percentages:    N/A
             * Computed value:    ‘<letter>’ or ‘static’; see text
             *
             * <letter> must be a single letter or digit, with category Lu, Ll, Lt or Nd in Unicode [UNICODE]),
             * or a “@” symbol
             */
            wef.log.info("compiling position...");
            wef.log.debug("position source: ", positionValue);
            var positionMetadata = {
                position: null
            };
            var positionRegExp = /^\s*([a-zA-Z0-9]+|same)\s*/i;
            if (positionValue != undefined) {
                positionMetadata.position = positionValue.match(positionRegExp)[1];
            }
            wef.log.info("position result: ", positionMetadata);
            return positionMetadata;
        }

        function parseProperties(rule) {
            var metadata = {};
            wef.log.info("compiling properties...");
            wef.log.debug("properties source: ", rule);

            wef.log.debug("* ", that.constants.DISPLAY, rule.declaration[that.constants.DISPLAY]);
            metadata.display = parseDisplay(rule.declaration[that.constants.DISPLAY]);
            ////}
            wef.log.debug("* ", that.constants.POSITION, rule.declaration[that.constants.POSITION]);
            metadata.position = parsePosition(rule.declaration[that.constants.POSITION]);

            wef.log.info("properties result: ", metadata);
            return metadata;
        }

        wef.log.debug("source: ", buffer);

        for (var selectorText in buffer) {
            wef.log.debug("next element: ", selectorText);
            var metadata = parseProperties(buffer[selectorText]);
            //var tmp = new Template(metadata);
            wef.log.debug("result: ", metadata);
            //TODO: insert
        }
        wef.log.debug("compiling ... done");
    }

    window.templateLayout = that;
})();