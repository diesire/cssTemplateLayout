/*!
 * CSS Template Layout
 * Copyright (c) 2011 Pablo Escalada
 * MIT Licensed
 */
(function () {
    var lastEvent, buffer, parser, compiler;
    var that = {
        constants:{
            DISPLAY:"display",
            POSITION:"position"
        },
        OperationNotSupportedException: Error,

        setTemplate:function (cssFile) {
            wef.log.info("loading template...");

            function readFile(url) {
                //TODO: FIXME
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
                    wef.log.error(e);
                    throw new that.OperationNotSupportedException(e);
                }
            }

            wef.fn.cssParser.parse(readFile(cssFile));
            wef.log.info("template loaded OK");
        },

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

    function defaultCompiler() {
        var that = {
            compile: compile,
            UnexpectedValueException: Error
        };

        function template(preProcessTemplate) {
            function gridSlot(slotText) {
                wef.log.info("creating new slot...");

                var that = {
                    slotText: slotText
                };

                wef.log.info("slot: ", that);
                return that;
            }

            function gridRow(rowText) {
                wef.log.info("creating new row...");

                var that = {
                    rowText: rowText,
                    slotIdentifier: [],
                    length: rowText.length
                };

                (function init() {
                    that.slotIdentifier = Array.prototype.map.call(rowText, function(slot) {
                        return gridSlot(slot.charAt(0));
                    });
                })();

                wef.log.info("row: ", that);
                return that;
            }

            function grid(display) {
                wef.log.info("creating new grid...");

                var slots = {};
                var that = {
                    rows: [],
                    slots: slots,
                    //getTemplate
                    setTemplate: setTemplate
                };


                (function init() {
                    if (display.grid != null) {
                        that.rows = display.grid.map(function(row) {
                            return gridRow(row);
                        });
                    }
                })();

                function hasSlot(slotIdentifier) {
                    wef.log.debug("hasSlot ? ", slotIdentifier);
                    return that.rows.some(function(row) {
                        var regExp = new RegExp(slotIdentifier);
                        return regExp.exec(row.rowText);
                    })
                }

                function setTemplate(aTemplate) {
                    if (hasSlot(aTemplate.position.position)) {
                        wef.log.debug("insert here");
                        var tmp = slots[aTemplate.position.position] || new Array();
                        tmp.push(aTemplate);
                        slots[aTemplate.position.position] = tmp;
                        wef.log.debug("at ", slots[aTemplate.position.position]);
                        return true;
                    }

                    //forEach non leaf template in slots
                    for (var slot in slots) {
                        if (slots[slot].some(function (currentTemplate) {
                            return !currentTemplate.isLeaf() && currentTemplate.insert(currentTemplate);
                        })) {
                            return true;
                        }
                    }

                    wef.log.debug("parent template not found");
                    return false;
                }

                wef.log.info("grid: ", that);
                return that;
            }

            var that = {
                parentTemplate: null,
                selectorText: preProcessTemplate.selectorText,
                selector: null,
                display: preProcessTemplate.display,
                position: preProcessTemplate.position,
                grid: null,
                isRoot: isRoot,
                isLeaf: isLeaf,
                insert:insert
            };

            (function init() {
                wef.log.debug("creating template...");
                that.grid = grid(preProcessTemplate.display);
            })();

            function isLeaf() {
                return that.display.grid == null;
            }

            function isRoot() {
                return that.position.position == null;
            }

            function insert(aTemplate) {
                wef.log.debug("trying to insert into ", that);
                return that.grid.setTemplate(aTemplate);
            }

            wef.log.info("new template:  ", that);
            return that;
        }

        var rootTemplate = function() {
            var that = {
                insert: insert,
                rows: []
            };

            function insert(preProcessTemplate) {
                wef.log.warn("inserting ", preProcessTemplate.selectorText);
                var aTemplate = template(preProcessTemplate);

                if (aTemplate.isRoot()) {
                    wef.log.debug("inserting at root", aTemplate);
                    that.rows.push(aTemplate);
                    return true;
                } else {
                    wef.log.debug("searching parent: ", aTemplate.position.position);
                    //insert in children
                    return that.rows.some(function(element, index, array) {
                        return element.insert(aTemplate);
                    });
                }
            }

            return that;
        }();

        (function init() {
            wef.log.info("new compiler created");
        })();

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
                //TODO: check invalid values
                displayMetadata.displayType = displayValue.match(displayTypeRegExp);
                displayMetadata.grid = displayValue.match(stringRegExp).map(function(element) {
                    return element.replace(/"/g, "").replace(/\s*/, "");
                });
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
            var matched;
            var positionRegExp = /^\s*([a-zA-Z0-9]+|same)\s*/i;
            if (positionValue != undefined) {
                matched = positionValue.match(positionRegExp);
                if (matched == null) {
                    wef.log.error("Error: unexpected value at ", positionValue);
                    throw new that.UnexpectedValueException("Error: unexpected value at ", positionValue);
                }
                positionMetadata.position = matched[1];
            }
            wef.log.info("position result: ", positionMetadata);
            return positionMetadata;
        }

        function parseProperties(rule) {
            var preProcessTemplate = {};
            wef.log.info("compiling properties...");
            wef.log.debug("properties source: ", rule);

            preProcessTemplate.selectorText = rule.selectorText;

            //wef.log.debug("* ", templateLayout.constants.DISPLAY, rule.declaration[templateLayout.constants.DISPLAY]);
            preProcessTemplate.display = parseDisplay(rule.declaration[templateLayout.constants.DISPLAY]);

            //wef.log.debug("* ", templateLayout.constants.POSITION, rule.declaration[templateLayout.constants.POSITION]);
            preProcessTemplate.position = parsePosition(rule.declaration[templateLayout.constants.POSITION]);

            wef.log.info("properties result: ", preProcessTemplate);
            return preProcessTemplate;
        }

        function compile(buffer) {
            wef.log.info("compiling...");
            wef.log.debug("source: ", buffer);

            for (var selectorText in buffer) {
                wef.log.debug("next element: ", selectorText);
                var preProcessTemplate = parseProperties(buffer[selectorText]);
                wef.log.debug("result: ", preProcessTemplate);

                var inserted = rootTemplate.insert(preProcessTemplate);
                wef.log.warn("insertion: ", inserted);
            }
            wef.log.debug("compiling ... OK");
            return rootTemplate;
        }

        return that;
    }

    function htmlGenerator() {
        var that = {
            patchDOM:patchDOM
        };

        function patchDOM(tom) {
            var tom = tom;
            wef.log.info("patching ........");
            wef.log.debug("source: ", tom);

            tom.rows.forEach(generateTemplate);

        }

        function generateTemplate(template) {
            var currentElement = document.querySelector(template.selectorText);
            var childElement;
            var generated = {};
            console.log(template.grid.rows);
            template.grid.rows.forEach(function(row) {
                console.log(row.rowText);
                row.slotIdentifier.forEach(function(slotId) {
                    console.log("id", slotId);
                    generated[slotId.slotText] = document.createElement("div");
                    //set div style & options

                    //child -> new div

                    template.grid.slots[slotId.slotText].forEach(function (childTemplate) {
                        console.log("child", childTemplate);
                        childElement = document.querySelector(childTemplate.selectorText)
                        console.log("child", childElement);
                        generated[slotId.slotText].appendChild(childElement.parentNode.removeChild(childElement));
                        console.log("child", generated[slotId.slotText]);

                        //new div -> current
                        currentElement.appendChild(generated[slotId.slotText]);

                    });

                });
            });
        }

        return that;
    }

    (function init() {
        wef.log.info("creating templateLayout...");
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
            transform();
        }, false);

        wef.log.info("templateLayout OK");
    })();


    function transform() {
        compiler = defaultCompiler();
        wef.log.debug("transforming template ...");
        var tom = compiler.compile(buffer);
        // wef.log.info("TOM: ", tom);

        var generator = htmlGenerator();
        generator.patchDOM(tom);

        wef.log.debug("template transformed OK");
    }

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

    window.templateLayout = that;
})();