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
        compiler: null,
        generator: null,

        //templateLayout(), templateLayout(""), templateLayout("", "", ...)
        init:function (templateSources) {
            var args, firstSource;
            log.debug("sources:", templateSources);

            log.debug("init subsystems...");
            parser = wef.cssParser();
            log.debug("subsystems... [OK]");

            args = Array.prototype.slice.call(templateSources);
            firstSource = args[0];

            //templateLayout()
            if (!firstSource) {
                //TODO: load style & inline css
                log.info("no external template loaded!!!");

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
                this.generator().patchDOM(tom);
                log.groupEnd();
                log.info("Step 3: generate... [OK]");
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
            log.info("template loaded... [OK]");
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