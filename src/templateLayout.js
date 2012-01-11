/*!
 * CSS Template Layout
 * Copyright (c) 2011 Pablo Escalada
 * MIT Licensed
 */
(function (global) {
    var log = wef.logger("templateLayout"),
        templateLayout,
        buffer = {},
        tom,
        parser,
        compiler,
        generator;

    templateLayout = function (templateSource) {
        log.info("create templateLayout...");
        return new templateLayout.prototype.init(arguments);
    };

    templateLayout.prototype = {
        constructor:templateLayout,
        version:"0.0.1",
        templateSources:[],
        constants:{
            DISPLAY:"display",
            POSITION:"position"},
        OperationNotSupportedException:Error,
        InvalidArgumentException:Error,

        //templateLayout(), templateLayout(""), templateLayout("", "", ...)
        init:function (templateSources) {
            var args, firstSource;
            log.debug("sources:", templateSources);

            log.debug("init subsystems...");
            parser = wef.cssParser();
            compiler = defaultCompiler();
            generator = htmlGenerator();
            log.debug("subsystems... [OK]");

            args = Array.prototype.slice.call(templateSources);
            firstSource = args[0];

            //templateLayout()
            if (!firstSource) {
                //TODO: load style & inline css
                log.warn("no external template loaded!!!");

                this.templateSources[0] = {
                    type:"inherited",
                    sourceText:""
                };
                log.info("templateLayout... [OK]");
                return this;
            }

            //templateLayout("aString") and templateLayout("aString", "anotherString", ...)
            if (args.length >= 1 && args.every(isString)) {
                this.templateSources = args.map(getContent);
                log.info("templateLayout... [OK]");
                return this;
            }

            log.error("Invalid argument");
            throw new this.InvalidArgumentException("Invalid argument");
        },
        transform:function () {
            log.debug("transform...");
            var options = parseTransformOptions(arguments);

            if (options.parse) {
                log.info("Step 1: parse");
                log.group();
                parser.whenStart(parserStarts);
                parser.whenProperty(propertyFound);
                parser.whenStop(parserDone);

                //TODO: FIXME multiple sources
                parser.parse(this.templateSources[0].sourceText);

                //TODO: remove callbacks???
                //document.removeEventListener(parser.events.PARSER_START, parserStarts, false);
                //document.removeEventListener(parser.events.PROPERTY_FOUND, propertyFound, false);
                //document.removeEventListener(parser.events.PARSER_DONE, parserDone, false);
                log.groupEnd();
                log.info("Step 1: parse... [OK]");
            }
            if (options.compile) {
                log.info("Step 2: compile");
                log.group();
                tom = compiler.compile(buffer);
                // log.info("TOM: ", tom);
                log.groupEnd();
                log.info("Step 2: compile... [OK]");
            }
            if (options.generate) {
                log.info("Step 3: generate");
                log.group();
                generator.patchDOM(tom);
                log.groupEnd();
                log.info("Step 1: generate... [OK]");
            }

            log.info("transform... [OK]");
            return this;
        },
        //only for testing purposes
        getBuffer:function () {
            return buffer;
        },
        getTOM:function () {
            return tom;
        }
    };

    templateLayout.fn = templateLayout.prototype;

    templateLayout.fn.init.prototype = templateLayout.fn;


    function isString(element) {
        return typeof element == "string";
    }

    function getSourceType(templateSource) {
        var rxHttp = /^http[s]?:\/\/.*\.css$/i, rxFile = /^file:\/\/.*\.css$/i, rxPath = /^(?!\s*.*(http[s]?|file))(\.){0,2}(\/.*)*.*\.css$/i;
        if (rxHttp.exec(templateSource)) {
            return "http";
        }
        if (rxPath.exec(templateSource) || rxFile.exec(templateSource)) {
            return "file";
        }
        return "css";
    }

    function getContent(templateSource) {
        var type = getSourceType(templateSource);
        if (type == "http" || type == "file") {
            return {
                type:type,
                sourceText:readFile(templateSource)
            };
        }
        if (type == "css") {
            return {
                type:type,
                sourceText:templateSource
            };
        } else {
            throw new this.OperationNotSupportedException("unknown sourceType");
        }
    }

    function defaultCompiler() {
        var that = {
            compile:compile,
            UnexpectedValueException:Error
        };

        function template(preProcessTemplate) {
            function gridSlot(slotText) {
                log.info("creating new slot...");

                var that = {
                    slotText:slotText
                };

                log.info("slot: ", that);
                return that;
            }

            function gridRow(rowText) {
                log.info("creating new row...");

                var that = {
                    rowText:rowText,
                    slotIdentifier:[],
                    length:rowText.length
                };

                (function init() {
                    that.slotIdentifier = Array.prototype.map.call(rowText, function (slot) {
                        return gridSlot(slot.charAt(0));
                    });
                })();

                log.info("row: ", that);
                return that;
            }

            function grid(display) {
                log.info("creating new grid...");

                var slots = {}, that = {
                    rows:[],
                    slots:slots,
                    //getTemplate
                    setTemplate:setTemplate
                };


                (function init() {
                    if (display.grid !== null) {
                        that.rows = display.grid.map(function (row) {
                            return gridRow(row);
                        });
                    }
                })();

                function hasSlot(slotIdentifier) {
                    log.debug("hasSlot ? ", slotIdentifier);
                    return that.rows.some(function (row) {
                        var regExp = new RegExp(slotIdentifier);
                        return regExp.exec(row.rowText);
                    });
                }

                function setTemplate(aTemplate) {
                    var slot, tmp;
                    if (hasSlot(aTemplate.position.position)) {
                        log.debug("insert here");
                        tmp = slots[aTemplate.position.position] || [];
                        tmp.push(aTemplate);
                        slots[aTemplate.position.position] = tmp;
                        log.debug("at ", slots[aTemplate.position.position]);
                        return true;
                    }

                    //forEach non leaf template in slots
                    for (slot in slots) {
                        if (slots[slot].some(function (currentTemplate) {
                            return !currentTemplate.isLeaf() && currentTemplate.insert(currentTemplate);
                        })) {
                            return true;
                        }
                    }

                    log.debug("parent template not found");
                    return false;
                }

                log.info("grid: ", that);
                return that;
            }

            var that = {
                parentTemplate:null,
                selectorText:preProcessTemplate.selectorText,
                selector:null,
                display:preProcessTemplate.display,
                position:preProcessTemplate.position,
                grid:null,
                isRoot:isRoot,
                isLeaf:isLeaf,
                insert:insert
            };

            (function init() {
                log.debug("creating template...");
                that.grid = grid(preProcessTemplate.display);
            })();

            function isLeaf() {
                return that.display.grid === null;
            }

            function isRoot() {
                return that.position.position === null;
            }

            function insert(aTemplate) {
                log.debug("trying to insert into ", that);
                return that.grid.setTemplate(aTemplate);
            }

            log.info("new template:  ", that);
            return that;
        }

        var rootTemplate = function () {
            var that = {
                insert:insert,
                rows:[]
            };

            function insert(preProcessTemplate) {
                log.warn("inserting ", preProcessTemplate.selectorText);
                var aTemplate = template(preProcessTemplate);

                if (aTemplate.isRoot()) {
                    log.debug("inserting at root", aTemplate);
                    that.rows.push(aTemplate);
                    return true;
                } else {
                    log.debug("searching parent: ", aTemplate.position.position);
                    //insert in children
                    return that.rows.some(function (element) {
                        return element.insert(aTemplate);
                    });
                }
            }

            return that;
        }();

        (function init() {
            log.info("new compiler created");
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
            log.info("compiling display...");
            log.debug("display source: ", displayValue);
            var displayMetadata = {
                displayType:null,
                grid:null
            }, displayTypeRegExp = /^\s*(inline|block|list-item|inline-block|table|inline-table|table-row-group|table-header-group|table-footer-group|table-row|table-column-group|table-column|table-cell|table-caption|none)?/ig, stringRegExp = /\s*"([a-zA-Z0-9.@ ])+"/ig;
            if (displayValue !== undefined) {
                //TODO: check invalid values
                displayMetadata.displayType = displayValue.match(displayTypeRegExp);
                displayMetadata.grid = displayValue.match(stringRegExp).map(function (element) {
                    return element.replace(/"/g, "").replace(/\s*/, "");
                });
            }
            log.info("display result: ", displayMetadata);
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
            log.info("compiling position...");
            log.debug("position source: ", positionValue);
            var positionMetadata = {
                position:null
            };
            var matched;
            var positionRegExp = /^\s*([a-zA-Z0-9]+|same)\s*/i;
            if (positionValue !== undefined) {
                matched = positionValue.match(positionRegExp);
                if (matched === null) {
                    log.error("Error: unexpected value at ", positionValue);
                    throw new that.UnexpectedValueException("Error: unexpected value at ", positionValue);
                }
                positionMetadata.position = matched[1];
            }
            log.info("position result: ", positionMetadata);
            return positionMetadata;
        }

        function parseProperties(rule) {
            var preProcessTemplate = {};
            log.info("compiling properties...");
            log.debug("properties source: ", rule);

            preProcessTemplate.selectorText = rule.selectorText;

            //log.debug("* ", templateLayout.fn.constants.DISPLAY, rule.declaration[templateLayout.fn.constants.DISPLAY]);
            preProcessTemplate.display = parseDisplay(rule.declaration[templateLayout.fn.constants.DISPLAY]);

            //log.debug("* ", templateLayout.fn.constants.POSITION, rule.declaration[templateLayout.fn.constants.POSITION]);
            preProcessTemplate.position = parsePosition(rule.declaration[templateLayout.fn.constants.POSITION]);

            log.info("properties result: ", preProcessTemplate);
            return preProcessTemplate;
        }

        function compile(buffer) {
            log.info("compiling...");
            log.debug("source: ", buffer);
            var selectorText, preProcessTemplate, inserted;

            for (selectorText in buffer) {
                log.debug("next element: ", selectorText);
                preProcessTemplate = parseProperties(buffer[selectorText]);
                log.debug("result: ", preProcessTemplate);

                inserted = rootTemplate.insert(preProcessTemplate);
                log.warn("insertion: ", inserted);
            }
            log.debug("compiling ... OK");
            return rootTemplate;
        }

        return that;
    }

    function htmlGenerator() {
        var that = {
            patchDOM:patchDOM
        };

        function patchDOM(tom) {
            log.info("patching ........");
            log.debug("source: ", tom);

            tom.rows.forEach(generateRootTemplate);
        }

        function generateRootTemplate(template) {
            //here is document
            //if template.isLeaf() creates DOM and append to parentDOM
            //else traverse TOM

            function generateLeaf(template, parentHtmlNode) {
                log.warn("leaf   ", template.selectorText, parentHtmlNode.localName);
                var childElement = document.querySelector(template.selectorText);
                childElement.style.display = "table-cell";
                //childElement.parentNode.removeChild(childElement);
                parentHtmlNode.appendChild(childElement);
            }

            function generateTemplate(template, parentHtmlNode) {

                if (template.isLeaf()) {
                    generateLeaf(template, parentHtmlNode);
                } else {
                    log.warn("no leaf   ", template.selectorText, parentHtmlNode.localName);
                    var rootElement = document.querySelector(template.selectorText);
                    rootElement.style.display = "table";
                    parentHtmlNode.appendChild(rootElement);

                    template.grid.rows.forEach(function (row) {
                        log.warn("row ", row.rowText);
                        var rowDiv = document.createElement("div");
                        rowDiv.className = "templateLayoutDiv";
                        rowDiv.style.display = "table-row";
                        rootElement.appendChild(rowDiv);

                        row.slotIdentifier.forEach(function (slotId) {
                            log.warn("slot ", slotId.slotText);
                            //each slot can have multiple elements
                            template.grid.slots[slotId.slotText].forEach(function (templateInSlot) {
                                log.warn("slotELEMENT ", templateInSlot.selectorText);
                                generateTemplate(templateInSlot, rowDiv);
                            });
                        });
                        //rootElement.appendChild(rowDiv);
                    });
                    //rootElement.parentNode.removeChild(rootElement);
                    //parentHtmlNode.appendChild(rootElement);
                }
                log.debug("template generated: ", template);
            }

            var rootElement = document.querySelector(template.selectorText);
            generateTemplate(template, rootElement.parentElement);
            //document.body.appendChild(rootElement);
        }

        return that;
    }

    function parseTransformOptions(args) {
        var options = {parse:true, compile:true, generate:true};
        if (args.length === 0) {
            return options;
        }
        if (args[0].action == "none") {
            options.parse = options.compile = options.generate = false;
        }
        if (args[0].action == "parse") {
            options.compile = options.generate = false;
        }
        if (args[0].action == "compile") {
            options.generate = false;
        }
        return options;
    }

    function parserStarts(o) {
        log.info("start parsing at", new Date(o.time).toLocaleTimeString());
        buffer = {};
    }

    function propertyFound(property) {
        log.info("templateLayout listens: property found");
        if (isSupportedProperty(property)) {
            store(property);
        }
    }

    function parserDone(o) {
        log.info("parsing done at", new Date(o.time).toLocaleTimeString());
    }

    function readFile(url) {
        //TODO: FIXME
        function ajaxReadFile(url) {
            var request = new XMLHttpRequest();
            request.open("get", url, false);
            request.send("");
            log.info("request status: ", request.statusText);
            return request.responseText;
        }

        try {
            log.info("reading file...");
            var templateText = ajaxReadFile(url);
            log.info("template loaded OK");
            return templateText;
        } catch (e) {
            log.error("Operation not supported", e);
            throw new that.OperationNotSupportedException(e);
        }
    }

    function store(rule) {
        if (!buffer[rule.selectorText]) {
            buffer[rule.selectorText] = {
                selectorText:rule.selectorText,
                declaration:{}
            };
        }
        buffer[rule.selectorText].declaration[rule.declaration.property] = rule.declaration.valueText;
        log.info("property stored: ", rule.declaration.property);
    }

    function isSupportedProperty(rule) {
        for (var iterator in templateLayout.fn.constants) {
            if (templateLayout.fn.constants[iterator] == rule.declaration.property) {
                log.info("supported property found: ", rule.declaration.property);
                return true;
            }
        }
        return false;
    }

    global.templateLayout = templateLayout;
})(window);