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
        parser;

    /**
     * Create the prototype main class
     *
     * @param {string|strings[]}[templateSource] template source.
     * Supports 0..* strings containing valid CSS text or URL.
     * </p>
     * Empty constructor searches parent HTML file for STYLE tags and uses its
     * CSS content as template source.
     * </p>
     * String params are analyzed and loaded in this way:
     * <ul>
     *     <li>"htttp[s]://..." entries are loaded as files and content extracted</li>
     *     <li>"file://..." entries are loaded as files and content extracted</li>
     *     <li>Unmatched entries are loaded as CSS text</li>
     * </ul>
     * Multiple strings are first analyzed and then concatenated
     *
     * @class TemplateLayout is a  CSS Template Layout prototype that implements
     * some basic features defined in W3C working draft "Template Layout Module".
     * Features:
     * <ul>
     *     <li>basic template definition: letters, . (dot) and @</li>
     *     <li>column width in pixels and %</li>
     *     <li>row height imn pixels and %</li>
     * </ul>
     */
    templateLayout = function (templateSource) {
        log.info("create templateLayout...");
        return new templateLayout.prototype.init(arguments);
    };


    templateLayout.prototype = {
        constructor:templateLayout,
        /**
         * Version number
         */
        version:"0.0.1",
        /**
         * Template sources store
         */
        templateSources:[],
        /**
         * Constant object that stores CSS properties names used as triggers
         * </p>
         * Currently used:
         * <ul>
         *     <li>constants.DISPLAY = "display"</li>
         *     <li>constants.POSITION = "position"</li>
         * </ul>
         */
        constants:{
            DISPLAY:"display",
            POSITION:"position"
        },
        /**
         * Template compiler
         */
        compiler:null,
        /**
         * Template output generator
         */
        generator:null,

        /**
         * @ignore
         * see templateLayout constructor
         */
        init:function (templateSources) {
            var args, firstSource, internalSources = [];
            log.debug("sources:", templateSources);

            log.debug("init subsystems...");
            parser = wef.cssParser();
            log.debug("subsystems... [OK]");

            args = Array.prototype.slice.call(templateSources);
            firstSource = args[0];

            //templateLayout()
            if (!firstSource) {
                log.info("no external template loaded!!!");
                Array.prototype.forEach.call(document.styleSheets, function (sheet) {
                    if (sheet.href !== null) {
                        //load external CSS
                        log.info("load external CSS", sheet.href);
                        internalSources.push(sheet.href);
                    }
                    else {
                        var text = sheet.ownerNode.innerHTML;
                        log.info("load style tag", text);
                        internalSources.push(text);
                    }
                });

                this.templateSources = internalSources.map(getContent);
                log.info("templateLayout... [OK]");
                return this;
            }

            //templateLayout("aString") and templateLayout("aString", "anotherString", ...)
            if (args.length >= 1 && args.every(function (element) {
                return typeof element == "string";
            })) {
                this.templateSources = args.map(getContent);
                log.info("templateLayout... [OK]");
                return this;
            }

            log.error("Invalid argument");
            throw new Error("Invalid argument");
        },
        /**
         * Reads, compiles and generates the template
         *
         * @param {string}[options=all] Only for testing purposes.
         * Supported values [none|parse|compile]
         * </p>
         * Stops transform process at different points:
         * <ul>
         *     <li>none: transform does nothing</li>
         *     <li>parse: transform only parses template source</li>
         *     <li>compile: transform  parses source and compiles the template</li>
         * </ul>
         */
        transform:function () {
            log.debug("transform...");
            var options = parseTransformOptions(arguments);

            if (options.parse) {
                log.info("Step 1: parse");
                log.group();
                parser.whenStart(this.parserStarts);
                parser.whenProperty(this.propertyFound);
                parser.whenStop(this.parserDone);

                parser.parse(this.templateSources.reduce(function (previous, source) {
                    return previous + source.sourceText;
                }, ""));

                log.groupEnd();
                log.info("Step 1: parse... [OK]");
            }
            if (options.compile) {
                log.info("Step 2: compile");
                log.group();
                tom = this.compiler().compile(buffer);
                // log.info("TOM: ", tom);
                log.groupEnd();
                log.info("Step 2: compile... [OK]");
            }
            if (options.generate) {
                log.info("Step 3: generate");
                log.group();
                this.generator(tom).patchDOM();
                log.groupEnd();
                log.info("Step 3: generate... [OK]");
            }

            log.info("transform... [OK]");
            return this;
        },
        /**
         * Returns the info from the parsing step
         * @returns {ParserBufferEntry[]}buffer
         */
        getBuffer:function () {
            return buffer;
        },
        /**
         * Returns TOM (Template Object Model)
         * @returns {rootTemplate}tom
         */
        getTOM:function () {
            return tom;
        },
        /**
         * "Parser start" callback. Prints start time and resets buffer
         *
         * @param o Information sent by parser
         * @param o.time Start time in milliseconds
         */
        parserStarts:function (o) {
            log.info("start parsing at", new Date(o.time).toLocaleTimeString());
            buffer = {};
        },
        /**
         * "Property has been found" callback. Stores in buffer valid properties
         *
         * @param {CSSParserProperty}property found property information
         */
        propertyFound:function (property) {
            log.info("templateLayout listens: property found");
            if (templateLayout.fn.isSupportedProperty(property)) {
                store(property);
            }
        },
        /**
         * "Parser stop" callback. Prints stop time
         * @param {StopCallbackData}o Information sent by parser
         */
        parserDone:function (o) {
            log.info("parsing done at", new Date(o.time).toLocaleTimeString());
        },
        /**
         * Checks if given property is a valid one.
         * If property name exists in constants then is a valid one
         *
         * @param {CSSParserProperty}property the property
         * @returns {boolean}true if exists constants[???] == property.declaration.property
         */
        isSupportedProperty:function (property) {
            var iterator;
            for (iterator in templateLayout.fn.constants) {
                if (templateLayout.fn.constants.hasOwnProperty(iterator)) {
                    if (templateLayout.fn.constants[iterator] == property.declaration.property) {
                        log.info("supported property found: ", property.declaration.property);
                        return true;
                    }
                }
            }
            return false;
        }
    };

    templateLayout.fn = templateLayout.prototype;

    templateLayout.fn.init.prototype = templateLayout.fn;

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
            throw new Error("unknown sourceType");
        }
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

    function readFile(url) {
        var templateText="";

        try {
            log.info("reading file...");
            wef.net.ajax(url, {
                asynchronous:false,
                success:function (request) {
                    templateText = request.responseText;
                }
            });
            log.info("template loaded... [OK]");
            return templateText;
        } catch (e) {
            log.error("Operation not supported", e);
            throw new Error("Operation not supported", e);
        }
    }

    function store(rule) {
        if (!buffer[rule.selectorText]) {
            buffer[rule.selectorText] =
            /**
             * @namespace Data format of parser buffer entry
             * @name ParserBufferEntry
             */
            /**
             * @lends ParserBufferEntry#
             */
            {
                /**
                 * property selector text
                 * @type string
                 */
                selectorText:rule.selectorText,
                /**
                 * array of declarations (property_name:property_value)
                 * @type string[]
                 */
                declaration:{}
            };
        }
        buffer[rule.selectorText].declaration[rule.declaration.property] = rule.declaration.valueText;
        log.info("property stored: ", rule.declaration.property);
    }

    global.templateLayout = templateLayout;
})(window);