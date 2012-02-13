/*!
 * Wef
 * Copyright (c) 2011 Pablo Escalada
 * MIT Licensed
 */

/**
 * wef module
 */
(function () {
    var wef;
    /**
     * @namespace
     */
    wef = function () {
        return new wef.prototype.init();
    };

    wef.prototype = {
        constructor:wef,
        /**
         * Version number
         */
        version:"0.2.0",
        /**
         * @ignore
         */
        init:function () {
            return this;
        }
    };

    /**
     * Extension point
     */
    wef.fn = wef.prototype;

    /**
     * @ignore
     */
    wef.prototype.init = function () {
        return this;
    };

    wef.prototype.init.prototype = wef.prototype;

    /**
     * Extends an object with other object properties
     * @param {Object}receiver receiver object
     * @param {Object}giver giver object
     * @param {string[]}[filter] array of strings. If giver property name is
     * contained in filter is added to receiver, else don't
     *
     * @memberOf wef
     */
    wef.fn.extend = function (receiver, giver, filter) {
        var tmp = receiver, property;
        //both must be objects
        if (typeof receiver === "object" && typeof giver === "object") {
            if (tmp === null) {
                tmp = {};
            }
            if (receiver === null) {
                return tmp;
            }

            for (property in giver) {
                if ((!filter || filter.indexOf(property) !== -1) && giver.hasOwnProperty(property) && giver[property] !== undefined) {
                    tmp[property] = giver[property];
                }
            }
            return tmp;
        }
        wef.fn.error("InvalidArgumentException: incorrect argument type");
        return null;
    };

    wef.fn.hasOwnProperty = function(o, property) {
        //literal objects in IE don't have hasOwnProperty
        //todo:delete????
        return Object.prototype.hasOwnProperty.call(o, property);
    };

    /**
     * Checks if param is a Function
     * @param obj object to check
     * @returns {boolean} true if a Function, false if not
     *
     * @memberOf wef
     */
    wef.fn.isFunction = function (obj) {
        return typeof obj == "function";
    };

    /**
     * Checks if param is a literal string
     * @param obj object to check
     * @returns {boolean} true if a literal string, false if not
     *
     * @memberOf wef
     */
    wef.fn.isString = function (obj) {
        return typeof obj == "string";
    };

    /**
     * Throws an Error
     * @param message error message
     *
     * @memberOf wef
     */
    wef.fn.error = function (message) {
        throw new Error(message);
    };

    //registering global variable
    if (window.wef) {
        throw new Error("wef has already been defined");
    } else {
        window.wef = wef();
    }

})();
/*!
 * Wef crossBrowser
 * Copyright (c) 2011 Pablo Escalada
 * MIT Licensed
 */
(function (wef) {

    if (!("map" in Array.prototype)) {
        /**
         * Crossbrowser implementation of Array.map().
         *
         * More info http://stackoverflow.com/questions/2790001/fixing-javascript-array-functions-in-internet-explorer-indexof-foreach-etc
         * </p>
         * Copyright (c) 2010 bobince [http://stackoverflow.com/users/18936/bobince]
         * </p>
         * Public Domain Licensed
         *
         * @param {Array}mapper the source array
         * @param [that] "this" object reference
         */
        Array.prototype.map = function (mapper, that) {
            var other, i;
            other = new Array(this.length);
            for (i = 0, n = this.length; i < n; i++)
                if (i in this)
                    other[i] = mapper.call(that, this[i], i, this);
            return other;
        };
    }

})(window.wef);/*!
 * Wef logger
 * Copyright (c) 2011 Pablo Escalada
 * MIT Licensed
 */
(function (wef) {

    var LOGLEVEL,textFormatter,registered = {},lastLogger,failSafeIndentation = false,logger,filteredLogs = 0;

    /**
     * @namespace  Log level constants
     */
    LOGLEVEL = {
        /**
         * @lends LOGLEVEL
         */
        /**
         * Max verbosity
         */
        all:-1,
        /**
         * Noisy
         */
        trace:1,
        /**
         * Useful for testing
         */
        debug:2,
        /**
         * Log and more important messages
         */
        log:2,
        /**
         * Info and more important messages
         */
        info:3,
        /**
         * Warn and error messages
         */
        warn:4,
        /**
         * Only error message
         */
        error:5,
        /**
         * Minimum verbosity. Zero logs
         */
        none:100
    }

    /**
     * Create a textFormatter
     *
     * @class Plain text logger formatter
     */
    textFormatter = function () {
        return this;
    };

    textFormatter.prototype = {

        /**
         * Formats logger messages
         * @param {Array-like}messages logger messages
         * @param {integer}indentationLevel indentation level
         * @param {string}type message type
         */
        format:function (messages, indentationLevel, type) {
            var tmp = [], levelMarks = "                                                                                            ", levelText, typeText;
            tmp = Array.prototype.slice.call(messages, tmp);
            if (failSafeIndentation && indentationLevel) {
                levelText = levelMarks.slice(0, indentationLevel);
                tmp.unshift(levelText);
            }
            if (type) {
                typeText = "[" + type + "]";
                tmp.unshift(typeText);
            }
            return tmp;
        }
    };

    /**
     * Creates a logger
     *
     * @param {string}[logName=default] Logger name
     *
     * @class Console logger withs vitamins.
     * </p>
     * Features:
     * <ul>
     *     <li>Named loggers</li>
     *     <li>Filters</li>
     *     <li>Failsafe logging functions</li>
     * </ul>
     */
    logger = function (logName) {
        var tmpLogger;
        if (!logName || logName === "") {
            logName = "default";
        }
        lastLogger = logName;
        if (registered[lastLogger]) {
            return registered[lastLogger].logger;
        } else {
            tmpLogger = new logger.prototype.init(lastLogger);
            registered[lastLogger] = {
                logLevel:LOGLEVEL.all,
                indentationLevel:0,
                logger:tmpLogger
            };
            return tmpLogger;
        }
    };

    logger.prototype = {
        constructor:logger,
        /**
         * Log level
         */
        loglevel: LOGLEVEL,
        /**
         * Version number
         */
        version:"0.2.0",
        /**
         * Logger formatter. Currently a plain text formatter
         */
        formatter:new textFormatter(),
        /**
         * @ignore
         */
        init:function (logName) {
            this.logName = logName;
            return this;
        },
        /**
         * Gets the number of filtered log messages. Only for testing purposes
         * @returns {integer} Number of Filtered messages
         */
        _filteredLogs:function () {
            return filteredLogs;
        },
        /**
         * Gets the indentation level of the specified logger. Only for testing
         * purposes
         *
         * @param {string}logName logger name
         * @returns {integer} indentation level
         */
        _getIndentLevel:function (logName) {
            return registered[logName].indentationLevel;
        },
        /**
         * Filter current loggers by name and priority level.
         * </p>
         * Only log entries from matched loggers and priority > filter level are
         * allowed. Filtered logs are lost.
         *
         * @param {Object|string} options filter options.
         * </p>
         * There are two shortcuts :
         * <ul>
         *     <li>"all": activates all loggers (logLevel: -1, pattern: ".*")</li>
         *     <li>"none": deactivates all loggers (logLevel: 100, pattern: ".*")</li>
         * </ul>
         * @param {integer} options.logLevel Priority level
         * @param {string} options.pattern Pattern that matches against current
         * registered loggers. Pattern must be regExp compatible.
         * */
        filter:function (options) {
            var name, regExp, logLevel;
            if (!options) {
                return this;
            }

            if (options == "none" || options == "off") {
                options = {logLevel:LOGLEVEL.none, pattern:".*"};
            }

            if (options == "all" || options == "on") {
                options = {logLevel:LOGLEVEL.all, pattern:".*"};
            }

            if (!options.logLevel || typeof options.logLevel != "number" || !options.pattern || typeof options.pattern != "string") {
                //do nothing
                return this;
            }
            regExp = new RegExp(options.pattern);
            logLevel = options.logLevel;

            for (name in registered) {
                if (regExp.test(name)) {
                    registered[name].logLevel = logLevel;
                } else {
                    registered[name].logLevel = LOGLEVEL.none;
                }
            }
            filteredLogs = 0;
            return this;
        }
    };

    /**
     * Extension point
     */
    logger.fn = logger.prototype;

    /**
     * @namespace Output object. Currently window.console
     * </p>
     * Redefining backend allows logs redirection
     * </p>
     */
    logger.prototype.backend = window.console || {};

    /**
     * FailSafe output. Currently unused.
     * </p> window.console its the best option, alert messages are too intrusive
     */
    logger.prototype.backend.failSafe = function () {
        //silent
    };

    /**
     * FailSafe grouping activation
     */
    logger.prototype.backend.failSafeGroup = function () {
        failSafeIndentation = true;
    };

    /**
     * FailSafe ungrouping activation
     */
    logger.prototype.backend.failSafeGroupEnd = function () {
        failSafeIndentation = true;
    };

    /**
     * trace backend
     * @function
     */
    logger.prototype.backend.trace = window.console.trace || logger.prototype.backend.log;
    /**
     * log backend
     * @function
     */
    logger.prototype.backend.log = window.console.log || logger.prototype.backend.failSafe;
    /**
     * debug backend
     * @function
     */
    logger.prototype.backend.debug = window.console.debug || logger.prototype.backend.log;
    /**
     * info backend
     * @function
     */
    logger.prototype.backend.info = window.console.info || logger.prototype.backend.log;
    /**
     * warn backend
     * @function
     */
    logger.prototype.backend.warn = window.console.warn || logger.prototype.backend.log;
    /**
     * error backend
     * @function
     */
    logger.prototype.backend.error = window.console.error || logger.prototype.backend.log;
    /**
     * group backend
     * @function
     */
    logger.prototype.backend.group = window.console.group || logger.prototype.backend.failSafeGroup;
    /**
     * groupCollapsed backend
     * @function
     */
    logger.prototype.backend.groupCollapsed = window.console.groupCollapsed || window.console.group || logger.prototype.backend.failSafeGroup;
    /**
     * groupEnd backend
     * @function
     */
    logger.prototype.backend.groupEnd = window.console.groupEnd || logger.prototype.backend.failSafeGroupEnd;

    logger.prototype.init.prototype = logger.prototype;

    //TODO: refactor using wef.extend

    logger.prototype.init.prototype.debug =
    /**
     * Logs messages of logLevel=debug
     * @param {string}message
     * @param {string}[messages] more messages, comma separated
     * @memberOf logger#
     * @name debug
     * @function
     */
    function (message) {
        if (registered[lastLogger].logLevel > LOGLEVEL.debug) {
            filteredLogs++;
            return this;
        }
        //crossBrowser support
        if (Function.prototype.bind && console && typeof console.debug == "object") {
            var debug = Function.prototype.bind.call(console.debug, console);
            debug.apply(console, this.formatter.format(arguments, registered[lastLogger].indentationLevel));
            return this;
        } else {
            this.backend.debug.apply(this.backend, this.formatter.format(arguments, registered[lastLogger].indentationLevel));
            return this;
        }
    };

    logger.prototype.init.prototype.error =
    /**
     * Logs messages of logLevel=error
     * @param {string}message
     * @param {string}[messages] more messages, comma separated
     * @memberOf logger#
     * @name error
     * @function
     */
    function (message) {
        if (registered[lastLogger].logLevel > LOGLEVEL.error) {
            filteredLogs++;
            return this;
        }
        if (Function.prototype.bind && console && typeof console.error == "object") {
            var error = Function.prototype.bind.call(console.error, console);
            error.apply(console, this.formatter.format(arguments, registered[lastLogger].indentationLevel));
            return this;
        } else {
            this.backend.error.apply(this.backend, this.formatter.format(arguments, registered[lastLogger].indentationLevel));
            return this;
        }
    };

    logger.prototype.init.prototype.info =
    /**
     * Logs messages of logLevel=info
     * @param {string}message
     * @param {string}[messages] more messages, comma separated
     * @memberOf logger#
     * @name info
     * @function
     */
    function (message) {
        if (registered[lastLogger].logLevel > LOGLEVEL.info) {
            filteredLogs++;
            return this;
        }
        if (Function.prototype.bind && console && typeof console.info == "object") {
            var info = Function.prototype.bind.call(console.info, console);
            info.apply(console, this.formatter.format(arguments, registered[lastLogger].indentationLevel));
            return this;
        } else {
            this.backend.info.apply(this.backend, this.formatter.format(arguments, registered[lastLogger].indentationLevel));
            return this;
        }
    };

    logger.prototype.init.prototype.warn =
    /**
     * Logs messages of logLevel=warn
     * @param {string}message
     * @param {string}[messages] more messages, comma separated
     * @memberOf logger#
     * @name warn
     * @function
     */
    function (message) {
        if (registered[lastLogger].logLevel > LOGLEVEL.warn) {
            filteredLogs++;
            return this;
        }
        if (Function.prototype.bind && console && typeof console.warn == "object") {
            var warn = Function.prototype.bind.call(console.warn, console);
            warn.apply(console, this.formatter.format(arguments, registered[lastLogger].indentationLevel));
            return this;
        } else {
            this.backend.warn.apply(this.backend, this.formatter.format(arguments, registered[lastLogger].indentationLevel));
            return this;
        }
    };

    logger.prototype.init.prototype.log =
    /**
     * Logs messages of logLevel=log
     * @param {string}message
     * @param {string}[messages] more messages, comma separated
     * @memberOf logger#
     * @name log
     * @function
     */
    function (message) {
        if (registered[lastLogger].logLevel > LOGLEVEL.log) {
            filteredLogs++;
            return this;
        }
        if (Function.prototype.bind && console && typeof console.log == "object") {
            var log = Function.prototype.bind.call(console.log, console);
            log.apply(console, this.formatter.format(arguments, registered[lastLogger].indentationLevel));
            return this;
        } else {
            this.backend.log.apply(this.backend, this.formatter.format(arguments, registered[lastLogger].indentationLevel));
            return this;
        }
    };

    logger.prototype.init.prototype.trace =
    /**
     * Logs messages of logLevel=trace
     * @param {string}message
     * @param {string}[messages] more messages, comma separated
     * @memberOf logger#
     * @name trace
     * @function
     */
    function () {
        if (registered[lastLogger].logLevel > LOGLEVEL.trace) {
            filteredLogs++;
            return this;
        }
        if (Function.prototype.bind && console && typeof console.trace == "object") {
            var trace = Function.prototype.bind.call(console.trace, console);
            trace.apply(console, this.formatter.format(arguments, registered[lastLogger].indentationLevel));
            return this;
        } else {
            this.backend.trace.apply(this.backend, this.formatter.format(arguments, registered[lastLogger].indentationLevel));
            return this;
        }
    };

    logger.prototype.init.prototype.group =
    /**
     * Groups next messages until there is a call to groupEnd
     * and logs messages to logLevel=log
     * @param {string}[messages] more messages, comma separated
     * @memberOf logger#
     * @name group
     * @function
     */
    function (message) {
        registered[lastLogger].indentationLevel++;
        this.backend.groupCollapsed.call(this.backend);
        if (registered[lastLogger].logLevel > LOGLEVEL.log) {
            filteredLogs++;
            return this;
        }
        if (message) {
            this.log.apply(this, arguments);
        }
        return this;
    };

    logger.prototype.init.prototype.groupEnd =
    /**
     * Ungroup previously grouped messages
     * and logs messages to logLevel=log
     * @param {string}[messages] messages, comma separated
     * @memberOf logger#
     * @name groupEnd
     * @function
     */
    function (message) {
        registered[lastLogger].indentationLevel--;
        this.backend.groupEnd.call(this.backend);
        if (registered[lastLogger].logLevel > LOGLEVEL.trace) {
            filteredLogs++;
            return this;
        }
        if (message) {
            this.log.apply(this, arguments);
        }
        return this;
    };

    wef.logger = logger;

})(window.wef);/*!
 * Wef net module
 * Copyright (c) 2011 Pablo Escalada
 * MIT Licensed
 *
 * Original ajax code from https://github.com/alexyoung/turing.js/blob/master/turing.net.js
 * Copyright (C) 2010-2011 Alex R. Young
 * MIT Licensed
 */
(function (wef) {
    var net;

    /**
     * @namespace
     */
    net = function () {
        return new net.prototype.init();
    };

    net.prototype = {
        constructor:net,
        /**
         * Version number
         */
        version:"0.1.0",
        /**
         * @ignore
         */
        init:function () {
            return this;
        },
        /**
         * Launch a XMLHttpRequest, waiting the result
         * @param url request url
         * @param [options] additional arguments
         * @param {string}options.method request method, supports[get|post]
         * @param {boolean}options.asynchronous request type, synchronous or asynchronous
         * @param {string}options.postBody message, in post request
         * @param {Function}options.success success callback
         * @param {Function}options.failure
         */
        ajax:function (url, options) {
            var request;

            function isSuccessfulRequest(request) {
                return (request.status >= 200 && request.status < 300)
                           || request.status == 304
                    || (request.status == 0 && request.responseText);
            }

            function respondToReadyState() {
                if (request.readyState == 4) {
                    if (isSuccessfulRequest(request)) {
                        if (options.success) {
                            options.success(request);
                        }
                    } else {
                        if (options.failure) {
                            options.failure(request);
                        }
                    }
                }
            }

            function setHeaders() {
                var name, headers = {
                    "Accept":"text/javascript, text/html, application/xml, text/xml, */*"
                };
                for (name in headers) {
                    request.setRequestHeader(name, headers[name]);
                }
            }

            request = xhr();
            if (typeof options === "undefined") {
                options = {};
            }

            //TODO: refactor using wef.fn.extend
            options.method = options.method ? options.method.toLowerCase() : "get";
            options.asynchronous = options.asynchronous!=="undefined" ? options.asynchronous : true;
            options.postBody = options.postBody || "";

            request.onreadystatechange = respondToReadyState;
            request.open(options.method, url, options.asynchronous);
            setHeaders();
            request.send(options.postBody);
        }
    };

    function xhr() {
        if (typeof XMLHttpRequest !== "undefined" && (window.location.protocol !== "file:" || !window.ActiveXObject)) {
            return new XMLHttpRequest();
        } else {
            try {
                return new ActiveXObject("Msxml2.XMLHTTP.6.0");
            } catch (e) {
            }
            try {
                return new ActiveXObject("Msxml2.XMLHTTP.3.0");
            } catch (e) {
            }
            try {
                return new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
            }
        }
        return false;
    }

    /**
     * Extension point
     */
    net.fn = net.prototype;

    net.prototype.init.prototype = net.prototype;

    wef.net = net();

})(window.wef);
/*!
 * wef.cssParser
 * Copyright (c) 2011 Pablo Escalada
 * MIT Licensed
 *
 * Uses a lightly modified version of JSCSSP
 * by Daniel Glazman <daniel.glazman@disruptive-innovations.com>
 * licensed under MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * Changelog:
 * - Add module pattern to jscsp
 * - Change const declarations to var for IE9 compatibility
 */
(function (wef) {
    /**#nocode+*/

    /* ***** BEGIN LICENSE BLOCK *****
     * Version: MPL 1.1/GPL 2.0/LGPL 2.1
     *
     * The contents of this file are subject to the Mozilla Public License Version
     * 1.1 (the "License"); you may not use this file except in compliance with
     * the License. You may obtain a copy of the License at
     * http://www.mozilla.org/MPL/
     *
     * Software distributed under the License is distributed on an "AS IS" basis,
     * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
     * for the specific language governing rights and limitations under the
     * License.
     *
     * The Original Code is mozilla.org code.
     *
     * The Initial Developer of the Original Code is
     * Netscape Communications Corporation.
     * Portions created by the Initial Developer are Copyright (C) 1998
     * the Initial Developer. All Rights Reserved.
     *
     * Contributor(s):
     *   emk <VYV03354@nifty.ne.jp>
     *   Daniel Glazman <glazman@netscape.com>
     *   L. David Baron <dbaron@dbaron.org>
     *   Boris Zbarsky <bzbarsky@mit.edu>
     *   Mats Palmgren <mats.palmgren@bredband.net>
     *   Christian Biesinger <cbiesinger@web.de>
     *   Jeff Walden <jwalden+code@mit.edu>
     *   Jonathon Jongsma <jonathon.jongsma@collabora.co.uk>, Collabora Ltd.
     *   Siraj Razick <siraj.razick@collabora.co.uk>, Collabora Ltd.
     *   Daniel Glazman <daniel.glazman@disruptive-innovations.com>
     *
     * Alternatively, the contents of this file may be used under the terms of
     * either of the GNU General Public License Version 2 or later (the "GPL"),
     * or the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
     * in which case the provisions of the GPL or the LGPL are applicable instead
     * of those above. If you wish to allow use of your version of this file only
     * under the terms of either the GPL or the LGPL, and not to allow others to
     * use your version of this file under the terms of the MPL, indicate your
     * decision by deleting the provisions above and replace them with the notice
     * and other provisions required by the GPL or the LGPL. If you do not delete
     * the provisions above, a recipient may use your version of this file under
     * the terms of any one of the MPL, the GPL or the LGPL.
     *
     * ***** END LICENSE BLOCK ***** */

    /* FROM http://peter.sh/data/vendor-prefixed-css.php?js=1 */

    var kENGINES = [
        "webkit", "presto", "trident", "generic"
    ];

    var kCSS_VENDOR_VALUES = {
        "-moz-box":{"webkit":"-webkit-box", "presto":"", "trident":"", "generic":"box" },
        "-moz-inline-box":{"webkit":"-webkit-inline-box", "presto":"", "trident":"", "generic":"inline-box" },
        "-moz-initial":{"webkit":"", "presto":"", "trident":"", "generic":"initial" },
        "-moz-linear-gradient":{"webkit20110101":FilterLinearGradientForOutput,
            "webkit":FilterLinearGradientForOutput,
            "presto":"",
            "trident":"",
            "generic":FilterLinearGradientForOutput },
        "-moz-radial-gradient":{"webkit20110101":FilterRadialGradientForOutput,
            "webkit":FilterRadialGradientForOutput,
            "presto":"",
            "trident":"",
            "generic":FilterRadialGradientForOutput },
        "-moz-repeating-linear-gradient":{"webkit20110101":"",
            "webkit":FilterRepeatingGradientForOutput,
            "presto":"",
            "trident":"",
            "generic":FilterRepeatingGradientForOutput },
        "-moz-repeating-radial-gradient":{"webkit20110101":"",
            "webkit":FilterRepeatingGradientForOutput,
            "presto":"",
            "trident":"",
            "generic":FilterRepeatingGradientForOutput }
    };

    var kCSS_VENDOR_PREFIXES = {"lastUpdate":1304175007, "properties":[
        {"gecko":"", "webkit":"", "presto":"", "trident":"-ms-accelerator", "status":"P"},
        {"gecko":"", "webkit":"", "presto":"-wap-accesskey", "trident":"", "status":""},
        {"gecko":"-moz-animation", "webkit":"-webkit-animation", "presto":"", "trident":"", "status":"WD"},
        {"gecko":"-moz-animation-delay", "webkit":"-webkit-animation-delay", "presto":"", "trident":"", "status":"WD"},
        {"gecko":"-moz-animation-direction", "webkit":"-webkit-animation-direction", "presto":"", "trident":"", "status":"WD"},
        {"gecko":"-moz-animation-duration", "webkit":"-webkit-animation-duration", "presto":"", "trident":"", "status":"WD"},
        {"gecko":"-moz-animation-fill-mode", "webkit":"-webkit-animation-fill-mode", "presto":"", "trident":"", "status":"ED"},
        {"gecko":"-moz-animation-iteration-count", "webkit":"-webkit-animation-iteration-count", "presto":"", "trident":"", "status":"WD"},
        {"gecko":"-moz-animation-name", "webkit":"-webkit-animation-name", "presto":"", "trident":"", "status":"WD"},
        {"gecko":"-moz-animation-play-state", "webkit":"-webkit-animation-play-state", "presto":"", "trident":"", "status":"WD"},
        {"gecko":"-moz-animation-timing-function", "webkit":"-webkit-animation-timing-function", "presto":"", "trident":"", "status":"WD"},
        {"gecko":"-moz-appearance", "webkit":"-webkit-appearance", "presto":"", "trident":"", "status":"CR"},
        {"gecko":"", "webkit":"-webkit-backface-visibility", "presto":"", "trident":"", "status":"WD"},
        {"gecko":"background-clip", "webkit":"-webkit-background-clip", "presto":"background-clip", "trident":"background-clip", "status":"WD"},
        {"gecko":"", "webkit":"-webkit-background-composite", "presto":"", "trident":"", "status":""},
        {"gecko":"-moz-background-inline-policy", "webkit":"", "presto":"", "trident":"", "status":"P"},
        {"gecko":"background-origin", "webkit":"-webkit-background-origin", "presto":"background-origin", "trident":"background-origin", "status":"WD"},
        {"gecko":"", "webkit":"background-position-x", "presto":"", "trident":"-ms-background-position-x", "status":""},
        {"gecko":"", "webkit":"background-position-y", "presto":"", "trident":"-ms-background-position-y", "status":""},
        {"gecko":"background-size", "webkit":"-webkit-background-size", "presto":"background-size", "trident":"background-size", "status":"WD"},
        {"gecko":"", "webkit":"", "presto":"", "trident":"-ms-behavior", "status":""},
        {"gecko":"-moz-binding", "webkit":"", "presto":"", "trident":"", "status":"P"},
        {"gecko":"", "webkit":"", "presto":"", "trident":"-ms-block-progression", "status":""},
        {"gecko":"", "webkit":"-webkit-border-after", "presto":"", "trident":"", "status":"ED"},
        {"gecko":"", "webkit":"-webkit-border-after-color", "presto":"", "trident":"", "status":"ED"},
        {"gecko":"", "webkit":"-webkit-border-after-style", "presto":"", "trident":"", "status":"ED"},
        {"gecko":"", "webkit":"-webkit-border-after-width", "presto":"", "trident":"", "status":"ED"},
        {"gecko":"", "webkit":"-webkit-border-before", "presto":"", "trident":"", "status":"ED"},
        {"gecko":"", "webkit":"-webkit-border-before-color", "presto":"", "trident":"", "status":"ED"},
        {"gecko":"", "webkit":"-webkit-border-before-style", "presto":"", "trident":"", "status":"ED"},
        {"gecko":"", "webkit":"-webkit-border-before-width", "presto":"", "trident":"", "status":"ED"},
        {"gecko":"-moz-border-bottom-colors", "webkit":"", "presto":"", "trident":"", "status":"P"},
        {"gecko":"border-bottom-left-radius", "webkit":"-webkit-border-bottom-left-radius", "presto":"border-bottom-left-radius", "trident":"border-bottom-left-radius", "status":"WD"},
        {"gecko":"", "webkit":"-webkit-border-bottom-left-radius = border-bottom-left-radius", "presto":"", "trident":"", "status":""},
        {"gecko":"border-bottom-right-radius", "webkit":"-webkit-border-bottom-right-radius", "presto":"border-bottom-right-radius", "trident":"border-bottom-right-radius", "status":"WD"},
        {"gecko":"", "webkit":"-webkit-border-bottom-right-radius = border-bottom-right-radius", "presto":"", "trident":"", "status":""},
        {"gecko":"-moz-border-end", "webkit":"-webkit-border-end", "presto":"", "trident":"", "status":"ED"},
        {"gecko":"-moz-border-end-color", "webkit":"-webkit-border-end-color", "presto":"", "trident":"", "status":"ED"},
        {"gecko":"-moz-border-end-style", "webkit":"-webkit-border-end-style", "presto":"", "trident":"", "status":"ED"},
        {"gecko":"-moz-border-end-width", "webkit":"-webkit-border-end-width", "presto":"", "trident":"", "status":"ED"},
        {"gecko":"", "webkit":"-webkit-border-fit", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-border-horizontal-spacing", "presto":"", "trident":"", "status":""},
        {"gecko":"-moz-border-image", "webkit":"-webkit-border-image", "presto":"-o-border-image", "trident":"", "status":"WD"},
        {"gecko":"-moz-border-left-colors", "webkit":"", "presto":"", "trident":"", "status":"P"},
        {"gecko":"border-radius", "webkit":"-webkit-border-radius", "presto":"border-radius", "trident":"border-radius", "status":"WD"},
        {"gecko":"-moz-border-right-colors", "webkit":"", "presto":"", "trident":"", "status":"P"},
        {"gecko":"-moz-border-start", "webkit":"-webkit-border-start", "presto":"", "trident":"", "status":"ED"},
        {"gecko":"-moz-border-start-color", "webkit":"-webkit-border-start-color", "presto":"", "trident":"", "status":"ED"},
        {"gecko":"-moz-border-start-style", "webkit":"-webkit-border-start-style", "presto":"", "trident":"", "status":"ED"},
        {"gecko":"-moz-border-start-width", "webkit":"-webkit-border-start-width", "presto":"", "trident":"", "status":"ED"},
        {"gecko":"-moz-border-top-colors", "webkit":"", "presto":"", "trident":"", "status":"P"},
        {"gecko":"border-top-left-radius", "webkit":"-webkit-border-top-left-radius", "presto":"border-top-left-radius", "trident":"border-top-left-radius", "status":"WD"},
        {"gecko":"", "webkit":"-webkit-border-top-left-radius = border-top-left-radius", "presto":"", "trident":"", "status":""},
        {"gecko":"border-top-right-radius", "webkit":"-webkit-border-top-right-radius", "presto":"border-top-right-radius", "trident":"border-top-right-radius", "status":"WD"},
        {"gecko":"", "webkit":"-webkit-border-top-right-radius = border-top-right-radius", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-border-vertical-spacing", "presto":"", "trident":"", "status":""},
        {"gecko":"-moz-box-align", "webkit":"-webkit-box-align", "presto":"", "trident":"-ms-box-align", "status":"WD"},
        {"gecko":"-moz-box-direction", "webkit":"-webkit-box-direction", "presto":"", "trident":"-ms-box-direction", "status":"WD"},
        {"gecko":"-moz-box-flex", "webkit":"-webkit-box-flex", "presto":"", "trident":"-ms-box-flex", "status":"WD"},
        {"gecko":"", "webkit":"-webkit-box-flex-group", "presto":"", "trident":"", "status":"WD"},
        {"gecko":"", "webkit":"", "presto":"", "trident":"-ms-box-line-progression", "status":""},
        {"gecko":"", "webkit":"-webkit-box-lines", "presto":"", "trident":"-ms-box-lines", "status":"WD"},
        {"gecko":"-moz-box-ordinal-group", "webkit":"-webkit-box-ordinal-group", "presto":"", "trident":"-ms-box-ordinal-group", "status":"WD"},
        {"gecko":"-moz-box-orient", "webkit":"-webkit-box-orient", "presto":"", "trident":"-ms-box-orient", "status":"WD"},
        {"gecko":"-moz-box-pack", "webkit":"-webkit-box-pack", "presto":"", "trident":"-ms-box-pack", "status":"WD"},
        {"gecko":"", "webkit":"-webkit-box-reflect", "presto":"", "trident":"", "status":""},
        {"gecko":"box-shadow", "webkit":"-webkit-box-shadow", "presto":"box-shadow", "trident":"box-shadow", "status":"WD"},
        {"gecko":"-moz-box-sizing", "webkit":"box-sizing", "presto":"box-sizing", "trident":"", "status":"CR"},
        {"gecko":"", "webkit":"-webkit-box-sizing = box-sizing", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-epub-caption-side = caption-side", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-color-correction", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-column-break-after", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-column-break-before", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-column-break-inside", "presto":"", "trident":"", "status":""},
        {"gecko":"-moz-column-count", "webkit":"-webkit-column-count", "presto":"column-count", "trident":"column-count", "status":"CR"},
        {"gecko":"-moz-column-gap", "webkit":"-webkit-column-gap", "presto":"column-gap", "trident":"column-gap", "status":"CR"},
        {"gecko":"-moz-column-rule", "webkit":"-webkit-column-rule", "presto":"column-rule", "trident":"column-rule", "status":"CR"},
        {"gecko":"-moz-column-rule-color", "webkit":"-webkit-column-rule-color", "presto":"column-rule-color", "trident":"column-rule-color", "status":"CR"},
        {"gecko":"-moz-column-rule-style", "webkit":"-webkit-column-rule-style", "presto":"column-rule-style", "trident":"column-rule-style", "status":"CR"},
        {"gecko":"-moz-column-rule-width", "webkit":"-webkit-column-rule-width", "presto":"column-rule-width", "trident":"column-rule-width", "status":"CR"},
        {"gecko":"", "webkit":"-webkit-column-span", "presto":"column-span", "trident":"column-span", "status":"CR"},
        {"gecko":"-moz-column-width", "webkit":"-webkit-column-width", "presto":"column-width", "trident":"column-width", "status":"CR"},
        {"gecko":"", "webkit":"-webkit-columns", "presto":"columns", "trident":"columns", "status":"CR"},
        {"gecko":"", "webkit":"-webkit-dashboard-region", "presto":"-apple-dashboard-region", "trident":"", "status":""},
        {"gecko":"filter", "webkit":"", "presto":"filter", "trident":"-ms-filter", "status":""},
        {"gecko":"-moz-float-edge", "webkit":"", "presto":"", "trident":"", "status":"P"},
        {"gecko":"", "webkit":"", "presto":"-o-focus-opacity", "trident":"", "status":""},
        {"gecko":"-moz-font-feature-settings", "webkit":"", "presto":"", "trident":"", "status":""},
        {"gecko":"-moz-font-language-override", "webkit":"", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-font-size-delta", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-font-smoothing", "presto":"", "trident":"", "status":""},
        {"gecko":"-moz-force-broken-image-icon", "webkit":"", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"", "presto":"", "trident":"-ms-grid-column", "status":"WD"},
        {"gecko":"", "webkit":"", "presto":"", "trident":"-ms-grid-column-align", "status":"WD"},
        {"gecko":"", "webkit":"", "presto":"", "trident":"-ms-grid-column-span", "status":"WD"},
        {"gecko":"", "webkit":"", "presto":"", "trident":"-ms-grid-columns", "status":"WD"},
        {"gecko":"", "webkit":"", "presto":"", "trident":"-ms-grid-layer", "status":"WD"},
        {"gecko":"", "webkit":"", "presto":"", "trident":"-ms-grid-row", "status":"WD"},
        {"gecko":"", "webkit":"", "presto":"", "trident":"-ms-grid-row-align", "status":"WD"},
        {"gecko":"", "webkit":"", "presto":"", "trident":"-ms-grid-row-span", "status":"WD"},
        {"gecko":"", "webkit":"", "presto":"", "trident":"-ms-grid-rows", "status":"WD"},
        {"gecko":"", "webkit":"-webkit-highlight", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-hyphenate-character", "presto":"", "trident":"", "status":"WD"},
        {"gecko":"", "webkit":"-webkit-hyphenate-limit-after", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-hyphenate-limit-before", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-hyphens", "presto":"", "trident":"", "status":"WD"},
        {"gecko":"", "webkit":"-epub-hyphens = -webkit-hyphens", "presto":"", "trident":"", "status":""},
        {"gecko":"-moz-image-region", "webkit":"", "presto":"", "trident":"", "status":"P"},
        {"gecko":"ime-mode", "webkit":"", "presto":"", "trident":"-ms-ime-mode", "status":""},
        {"gecko":"", "webkit":"", "presto":"-wap-input-format", "trident":"", "status":""},
        {"gecko":"", "webkit":"", "presto":"-wap-input-required", "trident":"", "status":""},
        {"gecko":"", "webkit":"", "presto":"", "trident":"-ms-interpolation-mode", "status":""},
        {"gecko":"", "webkit":"", "presto":"-xv-interpret-as", "trident":"", "status":""},
        {"gecko":"", "webkit":"", "presto":"", "trident":"-ms-layout-flow", "status":""},
        {"gecko":"", "webkit":"", "presto":"", "trident":"-ms-layout-grid", "status":""},
        {"gecko":"", "webkit":"", "presto":"", "trident":"-ms-layout-grid-char", "status":""},
        {"gecko":"", "webkit":"", "presto":"", "trident":"-ms-layout-grid-line", "status":""},
        {"gecko":"", "webkit":"", "presto":"", "trident":"-ms-layout-grid-mode", "status":""},
        {"gecko":"", "webkit":"", "presto":"", "trident":"-ms-layout-grid-type", "status":""},
        {"gecko":"", "webkit":"-webkit-line-box-contain", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-line-break", "presto":"", "trident":"-ms-line-break", "status":""},
        {"gecko":"", "webkit":"-webkit-line-clamp", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"", "presto":"", "trident":"-ms-line-grid-mode", "status":""},
        {"gecko":"", "webkit":"", "presto":"-o-link", "trident":"", "status":""},
        {"gecko":"", "webkit":"", "presto":"-o-link-source", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-locale", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-logical-height", "presto":"", "trident":"", "status":"ED"},
        {"gecko":"", "webkit":"-webkit-logical-width", "presto":"", "trident":"", "status":"ED"},
        {"gecko":"", "webkit":"-webkit-margin-after", "presto":"", "trident":"", "status":"ED"},
        {"gecko":"", "webkit":"-webkit-margin-after-collapse", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-margin-before", "presto":"", "trident":"", "status":"ED"},
        {"gecko":"", "webkit":"-webkit-margin-before-collapse", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-margin-bottom-collapse", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-margin-collapse", "presto":"", "trident":"", "status":""},
        {"gecko":"-moz-margin-end", "webkit":"-webkit-margin-end", "presto":"", "trident":"", "status":"ED"},
        {"gecko":"-moz-margin-start", "webkit":"-webkit-margin-start", "presto":"", "trident":"", "status":"ED"},
        {"gecko":"", "webkit":"-webkit-margin-top-collapse", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-marquee", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"", "presto":"-wap-marquee-dir", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-marquee-direction", "presto":"", "trident":"", "status":"WD"},
        {"gecko":"", "webkit":"-webkit-marquee-increment", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"", "presto":"-wap-marquee-loop", "trident":"", "status":"WD"},
        {"gecko":"", "webkit":"-webkit-marquee-repetition", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-marquee-speed", "presto":"-wap-marquee-speed", "trident":"", "status":"WD"},
        {"gecko":"", "webkit":"-webkit-marquee-style", "presto":"-wap-marquee-style", "trident":"", "status":"WD"},
        {"gecko":"mask", "webkit":"-webkit-mask", "presto":"mask", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-mask-attachment", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-mask-box-image", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-mask-clip", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-mask-composite", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-mask-image", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-mask-origin", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-mask-position", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-mask-position-x", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-mask-position-y", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-mask-repeat", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-mask-repeat-x", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-mask-repeat-y", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-mask-size", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-match-nearest-mail-blockquote-color", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-max-logical-height", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-max-logical-width", "presto":"", "trident":"", "status":"ED"},
        {"gecko":"", "webkit":"-webkit-min-logical-height", "presto":"", "trident":"", "status":"ED"},
        {"gecko":"", "webkit":"-webkit-min-logical-width", "presto":"", "trident":"", "status":"ED"},
        {"gecko":"", "webkit":"", "presto":"-o-mini-fold", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-nbsp-mode", "presto":"", "trident":"", "status":"P"},
        {"gecko":"", "webkit":"", "presto":"-o-object-fit", "trident":"", "status":"ED"},
        {"gecko":"", "webkit":"", "presto":"-o-object-position", "trident":"", "status":"ED"},
        {"gecko":"opacity", "webkit":"-webkit-opacity", "presto":"opacity", "trident":"opacity", "status":"WD"},
        {"gecko":"", "webkit":"-webkit-opacity = opacity", "presto":"", "trident":"", "status":""},
        {"gecko":"-moz-outline-radius", "webkit":"", "presto":"", "trident":"", "status":"P"},
        {"gecko":"-moz-outline-radius-bottomleft", "webkit":"", "presto":"", "trident":"", "status":"P"},
        {"gecko":"-moz-outline-radius-bottomright", "webkit":"", "presto":"", "trident":"", "status":"P"},
        {"gecko":"-moz-outline-radius-topleft", "webkit":"", "presto":"", "trident":"", "status":"P"},
        {"gecko":"-moz-outline-radius-topright", "webkit":"", "presto":"", "trident":"", "status":"P"},
        {"gecko":"overflow-x", "webkit":"overflow-x", "presto":"overflow-x", "trident":"-ms-overflow-x", "status":"WD"},
        {"gecko":"overflow-y", "webkit":"overflow-y", "presto":"overflow-y", "trident":"-ms-overflow-y", "status":"WD"},
        {"gecko":"", "webkit":"-webkit-padding-after", "presto":"", "trident":"", "status":"ED"},
        {"gecko":"", "webkit":"-webkit-padding-before", "presto":"", "trident":"", "status":"ED"},
        {"gecko":"-moz-padding-end", "webkit":"-webkit-padding-end", "presto":"", "trident":"", "status":"ED"},
        {"gecko":"-moz-padding-start", "webkit":"-webkit-padding-start", "presto":"", "trident":"", "status":"ED"},
        {"gecko":"", "webkit":"-webkit-perspective", "presto":"", "trident":"", "status":"WD"},
        {"gecko":"", "webkit":"-webkit-perspective-origin", "presto":"", "trident":"", "status":"WD"},
        {"gecko":"", "webkit":"-webkit-perspective-origin-x", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-perspective-origin-y", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"", "presto":"-xv-phonemes", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-rtl-ordering", "presto":"", "trident":"", "status":"P"},
        {"gecko":"-moz-script-level", "webkit":"", "presto":"", "trident":"", "status":""},
        {"gecko":"-moz-script-min-size", "webkit":"", "presto":"", "trident":"", "status":""},
        {"gecko":"-moz-script-size-multiplier", "webkit":"", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"", "presto":"scrollbar-3dlight-color", "trident":"-ms-scrollbar-3dlight-color", "status":"P"},
        {"gecko":"", "webkit":"", "presto":"scrollbar-arrow-color", "trident":"-ms-scrollbar-arrow-color", "status":"P"},
        {"gecko":"", "webkit":"", "presto":"scrollbar-base-color", "trident":"-ms-scrollbar-base-color", "status":"P"},
        {"gecko":"", "webkit":"", "presto":"scrollbar-darkshadow-color", "trident":"-ms-scrollbar-darkshadow-color", "status":"P"},
        {"gecko":"", "webkit":"", "presto":"scrollbar-face-color", "trident":"-ms-scrollbar-face-color", "status":"P"},
        {"gecko":"", "webkit":"", "presto":"scrollbar-highlight-color", "trident":"-ms-scrollbar-highlight-color", "status":"P"},
        {"gecko":"", "webkit":"", "presto":"scrollbar-shadow-color", "trident":"-ms-scrollbar-shadow-color", "status":"P"},
        {"gecko":"", "webkit":"", "presto":"scrollbar-track-color", "trident":"-ms-scrollbar-track-color", "status":"P"},
        {"gecko":"-moz-stack-sizing", "webkit":"", "presto":"", "trident":"", "status":"P"},
        {"gecko":"", "webkit":"-webkit-svg-shadow", "presto":"", "trident":"", "status":""},
        {"gecko":"-moz-tab-size", "webkit":"", "presto":"-o-tab-size", "trident":"", "status":""},
        {"gecko":"", "webkit":"", "presto":"-o-table-baseline", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-tap-highlight-color", "presto":"", "trident":"", "status":"P"},
        {"gecko":"", "webkit":"", "presto":"", "trident":"-ms-text-align-last", "status":"WD"},
        {"gecko":"", "webkit":"", "presto":"", "trident":"-ms-text-autospace", "status":"WD"},
        {"gecko":"-moz-text-blink", "webkit":"", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-text-combine", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-epub-text-combine = -webkit-text-combine", "presto":"", "trident":"", "status":""},
        {"gecko":"-moz-text-decoration-color", "webkit":"", "presto":"", "trident":"", "status":""},
        {"gecko":"-moz-text-decoration-line", "webkit":"", "presto":"", "trident":"", "status":""},
        {"gecko":"-moz-text-decoration-style", "webkit":"", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-text-decorations-in-effect", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-text-emphasis", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-epub-text-emphasis = -webkit-text-emphasis", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-text-emphasis-color", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-epub-text-emphasis-color = -webkit-text-emphasis-color", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-text-emphasis-position", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-text-emphasis-style", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-epub-text-emphasis-style = -webkit-text-emphasis-style", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-webkit-text-fill-color", "presto":"", "trident":"", "status":"P"},
        {"gecko":"", "webkit":"", "presto":"", "trident":"-ms-text-justify", "status":"WD"},
        {"gecko":"", "webkit":"", "presto":"", "trident":"-ms-text-kashida-space", "status":"P"},
        {"gecko":"", "webkit":"-webkit-text-orientation", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"-epub-text-orientation = -webkit-text-orientation", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"text-overflow", "presto":"text-overflow", "trident":"-ms-text-overflow", "status":"WD"},
        {"gecko":"", "webkit":"-webkit-text-security", "presto":"", "trident":"", "status":"P"},
        {"gecko":"", "webkit":"-webkit-text-size-adjust", "presto":"", "trident":"-ms-text-size-adjust", "status":""},
        {"gecko":"", "webkit":"-webkit-text-stroke", "presto":"", "trident":"", "status":"P"},
        {"gecko":"", "webkit":"-webkit-text-stroke-color", "presto":"", "trident":"", "status":"P"},
        {"gecko":"", "webkit":"-webkit-text-stroke-width", "presto":"", "trident":"", "status":"P"},
        {"gecko":"", "webkit":"-epub-text-transform = text-transform", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"", "presto":"", "trident":"-ms-text-underline-position", "status":"P"},
        {"gecko":"", "webkit":"-webkit-touch-callout", "presto":"", "trident":"", "status":"P"},
        {"gecko":"-moz-transform", "webkit":"-webkit-transform", "presto":"-o-transform", "trident":"-ms-transform", "status":"WD"},
        {"gecko":"-moz-transform-origin", "webkit":"-webkit-transform-origin", "presto":"-o-transform-origin", "trident":"-ms-transform-origin", "status":"WD"},
        {"gecko":"", "webkit":"-webkit-transform-origin-x", "presto":"", "trident":"", "status":"P"},
        {"gecko":"", "webkit":"-webkit-transform-origin-y", "presto":"", "trident":"", "status":"P"},
        {"gecko":"", "webkit":"-webkit-transform-origin-z", "presto":"", "trident":"", "status":"P"},
        {"gecko":"", "webkit":"-webkit-transform-style", "presto":"", "trident":"", "status":"WD"},
        {"gecko":"-moz-transition", "webkit":"-webkit-transition", "presto":"-o-transition", "trident":"", "status":"WD"},
        {"gecko":"-moz-transition-delay", "webkit":"-webkit-transition-delay", "presto":"-o-transition-delay", "trident":"", "status":"WD"},
        {"gecko":"-moz-transition-duration", "webkit":"-webkit-transition-duration", "presto":"-o-transition-duration", "trident":"", "status":"WD"},
        {"gecko":"-moz-transition-property", "webkit":"-webkit-transition-property", "presto":"-o-transition-property", "trident":"", "status":"WD"},
        {"gecko":"-moz-transition-timing-function", "webkit":"-webkit-transition-timing-function", "presto":"-o-transition-timing-function", "trident":"", "status":"WD"},
        {"gecko":"", "webkit":"-webkit-user-drag", "presto":"", "trident":"", "status":"P"},
        {"gecko":"-moz-user-focus", "webkit":"", "presto":"", "trident":"", "status":"P"},
        {"gecko":"-moz-user-input", "webkit":"", "presto":"", "trident":"", "status":"P"},
        {"gecko":"-moz-user-modify", "webkit":"-webkit-user-modify", "presto":"", "trident":"", "status":"P"},
        {"gecko":"-moz-user-select", "webkit":"-webkit-user-select", "presto":"", "trident":"", "status":"P"},
        {"gecko":"", "webkit":"", "presto":"-xv-voice-balance", "trident":"", "status":""},
        {"gecko":"", "webkit":"", "presto":"-xv-voice-duration", "trident":"", "status":""},
        {"gecko":"", "webkit":"", "presto":"-xv-voice-pitch", "trident":"", "status":""},
        {"gecko":"", "webkit":"", "presto":"-xv-voice-pitch-range", "trident":"", "status":""},
        {"gecko":"", "webkit":"", "presto":"-xv-voice-rate", "trident":"", "status":""},
        {"gecko":"", "webkit":"", "presto":"-xv-voice-stress", "trident":"", "status":""},
        {"gecko":"", "webkit":"", "presto":"-xv-voice-volume", "trident":"", "status":""},
        {"gecko":"-moz-window-shadow", "webkit":"", "presto":"", "trident":"", "status":"P"},
        {"gecko":"", "webkit":"word-break", "presto":"", "trident":"-ms-word-break", "status":"WD"},
        {"gecko":"", "webkit":"-epub-word-break = word-break", "presto":"", "trident":"", "status":""},
        {"gecko":"word-wrap", "webkit":"word-wrap", "presto":"word-wrap", "trident":"-ms-word-wrap", "status":"WD"},
        {"gecko":"", "webkit":"-webkit-writing-mode", "presto":"writing-mode", "trident":"-ms-writing-mode", "status":"ED"},
        {"gecko":"", "webkit":"-epub-writing-mode = -webkit-writing-mode", "presto":"", "trident":"", "status":""},
        {"gecko":"", "webkit":"zoom", "presto":"", "trident":"-ms-zoom", "status":""}
    ]};

    var kCSS_PREFIXED_VALUE = [
        {"gecko":"-moz-box", "webkit":"-moz-box", "presto":"", "trident":"", "generic":"box"}
    ];

    var CssInspector = {

        mVENDOR_PREFIXES:null,

        kEXPORTS_FOR_GECKO:true,
        kEXPORTS_FOR_WEBKIT:true,
        kEXPORTS_FOR_PRESTO:true,
        kEXPORTS_FOR_TRIDENT:true,

        cleanPrefixes:function () {
            this.mVENDOR_PREFIXES = null;
        },

        prefixesForProperty:function (aProperty) {
            if (!this.mVENDOR_PREFIXES) {

                this.mVENDOR_PREFIXES = {};
                for (var i = 0; i < kCSS_VENDOR_PREFIXES.properties.length; i++) {
                    var p = kCSS_VENDOR_PREFIXES.properties[i];
                    if (p.gecko && (p.webkit || p.presto || p.trident)) {
                        var o = {};
                        if (this.kEXPORTS_FOR_GECKO) {
                            o[p.gecko] = true;
                        }
                        if (this.kEXPORTS_FOR_WEBKIT && p.webkit) {
                            o[p.webkit] = true;
                        }
                        if (this.kEXPORTS_FOR_PRESTO && p.presto) {
                            o[p.presto] = true;
                        }
                        if (this.kEXPORTS_FOR_TRIDENT && p.trident) {
                            o[p.trident] = true;
                        }
                        this.mVENDOR_PREFIXES[p.gecko] = [];
                        for (var j in o) {
                            this.mVENDOR_PREFIXES[p.gecko].push(j)
                        }
                    }
                }
            }
            if (aProperty in this.mVENDOR_PREFIXES) {
                return this.mVENDOR_PREFIXES[aProperty].sort();
            }
            return null;
        },

        parseColorStop:function (parser, token) {
            var color = parser.parseColor(token);
            var position = "";
            if (!color) {
                return null;
            }
            token = parser.getToken(true, true);
            if (token.isPercentage() || token.isDimensionOfUnit("cm") || token.isDimensionOfUnit("mm") || token.isDimensionOfUnit("in") || token.isDimensionOfUnit("pc") || token.isDimensionOfUnit("px") || token.isDimensionOfUnit("em") || token.isDimensionOfUnit("ex") || token.isDimensionOfUnit("pt")) {
                position = token.value;
                token = parser.getToken(true, true);
            }
            return { color:color, position:position }
        },

        parseGradient:function (parser, token) {
            var isRadial = false;
            var gradient = { isRepeating:false };
            if (token.isNotNull()) {
                if (token.isFunction("-moz-linear-gradient(") || token.isFunction("-moz-radial-gradient(") || token.isFunction("-moz-repeating-linear-gradient(") || token.isFunction("-moz-repeating-radial-gradient(")) {
                    if (token.isFunction("-moz-radial-gradient(") || token.isFunction("-moz-repeating-radial-gradient(")) {
                        gradient.isRadial = true;
                    }
                    if (token.isFunction("-moz-repeating-linear-gradient(") || token.isFunction("-moz-repeating-radial-gradient(")) {
                        gradient.isRepeating = true;
                    }


                    token = parser.getToken(true, true);
                    var haveGradientLine = false;
                    var foundHorizPosition = false;
                    var haveAngle = false;

                    if (token.isAngle()) {
                        gradient.angle = token.value;
                        haveGradientLine = true;
                        haveAngle = true;
                        token = parser.getToken(true, true);
                    }

                    if (token.isLength() || token.isIdent("top") || token.isIdent("center") || token.isIdent("bottom") || token.isIdent("left") || token.isIdent("right")) {
                        haveGradientLine = true;
                        if (token.isLength() || token.isIdent("left") || token.isIdent("right")) {
                            foundHorizPosition = true;
                        }
                        gradient.position = token.value;
                        token = parser.getToken(true, true);
                    }

                    if (haveGradientLine) {
                        if (!haveAngle && token.isAngle()) { // we have an angle here
                            gradient.angle = token.value;
                            haveAngle = true;
                            token = parser.getToken(true, true);
                        }

                        else if (token.isLength() || (foundHorizPosition && (token.isIdent("top") || token.isIdent("center") || token.isIdent("bottom"))) || (!foundHorizPosition && (token.isLength() || token.isIdent("top") || token.isIdent("center") || token.isIdent("bottom") || token.isIdent("left") || token.isIdent("right")))) {
                            gradient.position = ("position" in gradient) ? gradient.position + " " : "";
                            gradient.position += token.value;
                            token = parser.getToken(true, true);
                        }

                        if (!haveAngle && token.isAngle()) { // we have an angle here
                            gradient.angle = token.value;
                            haveAngle = true;
                            token = parser.getToken(true, true);
                        }

                        // we must find a comma here
                        if (!token.isSymbol(",")) {
                            return null;
                        }
                        token = parser.getToken(true, true);
                    }

                    // ok... Let's deal with the rest now
                    if (gradient.isRadial) {
                        if (token.isIdent("circle") || token.isIdent("ellipse")) {
                            gradient.shape = token.value;
                            token = parser.getToken(true, true);
                        }
                        if (token.isIdent("closest-side") || token.isIdent("closest-corner") || token.isIdent("farthest-side") || token.isIdent("farthest-corner") || token.isIdent("contain") || token.isIdent("cover")) {
                            gradient.size = token.value;
                            token = parser.getToken(true, true);
                        }
                        if (!("shape" in gradient) && (token.isIdent("circle") || token.isIdent("ellipse"))) {
                            // we can still have the second value...
                            gradient.shape = token.value;
                            token = parser.getToken(true, true);
                        }
                        if ((("shape" in gradient) || ("size" in gradient)) && !token.isSymbol(",")) {
                            return null;
                        } else if (("shape" in gradient) || ("size" in gradient)) {
                            token = parser.getToken(true, true);
                        }
                    }

                    // now color stops...
                    var stop1 = this.parseColorStop(parser, token);
                    if (!stop1) {
                        return null;
                    }
                    token = parser.currentToken();
                    if (!token.isSymbol(",")) {
                        return null;
                    }
                    token = parser.getToken(true, true);
                    var stop2 = this.parseColorStop(parser, token);
                    if (!stop2) {
                        return null;
                    }
                    token = parser.currentToken();
                    if (token.isSymbol(",")) {
                        token = parser.getToken(true, true);
                    }
                    // ok we have at least two color stops
                    gradient.stops = [stop1, stop2];
                    while (!token.isSymbol(")")) {
                        var colorstop = this.parseColorStop(parser, token);
                        if (!colorstop) {
                            return null;
                        }
                        token = parser.currentToken();
                        if (!token.isSymbol(")") && !token.isSymbol(",")) {
                            return null;
                        }
                        if (token.isSymbol(",")) {
                            token = parser.getToken(true, true);
                        }
                        gradient.stops.push(colorstop);
                    }
                    return gradient;
                }
            }
            return null;
        },

        parseBoxShadows:function (aString) {
            var parser = new CSSParser();
            parser._init();
            parser.mPreserveWS = false;
            parser.mPreserveComments = false;
            parser.mPreservedTokens = [];
            parser.mScanner.init(aString);

            var shadows = [];
            var token = parser.getToken(true, true);
            var color = "", blurRadius = "0px", offsetX = "0px", offsetY = "0px", spreadRadius = "0px";
            var inset = false;
            while (token.isNotNull()) {
                if (token.isIdent("none")) {
                    shadows.push({ none:true });
                    token = parser.getToken(true, true);
                } else {
                    if (token.isIdent('inset')) {
                        inset = true;
                        token = parser.getToken(true, true);
                    }

                    if (token.isPercentage() || token.isDimensionOfUnit("cm") || token.isDimensionOfUnit("mm") || token.isDimensionOfUnit("in") || token.isDimensionOfUnit("pc") || token.isDimensionOfUnit("px") || token.isDimensionOfUnit("em") || token.isDimensionOfUnit("ex") || token.isDimensionOfUnit("pt")) {
                        var offsetX = token.value;
                        token = parser.getToken(true, true);
                    } else {
                        return [];
                    }

                    if (!inset && token.isIdent('inset')) {
                        inset = true;
                        token = parser.getToken(true, true);
                    }

                    if (token.isPercentage() || token.isDimensionOfUnit("cm") || token.isDimensionOfUnit("mm") || token.isDimensionOfUnit("in") || token.isDimensionOfUnit("pc") || token.isDimensionOfUnit("px") || token.isDimensionOfUnit("em") || token.isDimensionOfUnit("ex") || token.isDimensionOfUnit("pt")) {
                        var offsetX = token.value;
                        token = parser.getToken(true, true);
                    } else {
                        return [];
                    }

                    if (!inset && token.isIdent('inset')) {
                        inset = true;
                        token = parser.getToken(true, true);
                    }

                    if (token.isPercentage() || token.isDimensionOfUnit("cm") || token.isDimensionOfUnit("mm") || token.isDimensionOfUnit("in") || token.isDimensionOfUnit("pc") || token.isDimensionOfUnit("px") || token.isDimensionOfUnit("em") || token.isDimensionOfUnit("ex") || token.isDimensionOfUnit("pt")) {
                        var blurRadius = token.value;
                        token = parser.getToken(true, true);
                    }

                    if (!inset && token.isIdent('inset')) {
                        inset = true;
                        token = parser.getToken(true, true);
                    }

                    if (token.isPercentage() || token.isDimensionOfUnit("cm") || token.isDimensionOfUnit("mm") || token.isDimensionOfUnit("in") || token.isDimensionOfUnit("pc") || token.isDimensionOfUnit("px") || token.isDimensionOfUnit("em") || token.isDimensionOfUnit("ex") || token.isDimensionOfUnit("pt")) {
                        var spreadRadius = token.value;
                        token = parser.getToken(true, true);
                    }

                    if (!inset && token.isIdent('inset')) {
                        inset = true;
                        token = parser.getToken(true, true);
                    }

                    if (token.isFunction("rgb(") || token.isFunction("rgba(") || token.isFunction("hsl(") || token.isFunction("hsla(") || token.isSymbol("#") || token.isIdent()) {
                        var color = parser.parseColor(token);
                        token = parser.getToken(true, true);
                    }

                    if (!inset && token.isIdent('inset')) {
                        inset = true;
                        token = parser.getToken(true, true);
                    }

                    shadows.push({ none:false,
                                     color:color,
                                     offsetX:offsetX, offsetY:offsetY,
                                     blurRadius:blurRadius,
                                     spreadRadius:spreadRadius });

                    if (token.isSymbol(",")) {
                        inset = false;
                        color = "";
                        blurRadius = "0px";
                        spreadRadius = "0px"
                        offsetX = "0px";
                        offsetY = "0px";
                        token = parser.getToken(true, true);
                    } else if (!token.isNotNull()) {
                        return shadows;
                    } else {
                        return [];
                    }
                }
            }
            return shadows;
        },

        parseTextShadows:function (aString) {
            var parser = new CSSParser();
            parser._init();
            parser.mPreserveWS = false;
            parser.mPreserveComments = false;
            parser.mPreservedTokens = [];
            parser.mScanner.init(aString);

            var shadows = [];
            var token = parser.getToken(true, true);
            var color = "", blurRadius = "0px", offsetX = "0px", offsetY = "0px";
            while (token.isNotNull()) {
                if (token.isIdent("none")) {
                    shadows.push({ none:true });
                    token = parser.getToken(true, true);
                } else {
                    if (token.isFunction("rgb(") || token.isFunction("rgba(") || token.isFunction("hsl(") || token.isFunction("hsla(") || token.isSymbol("#") || token.isIdent()) {
                        var color = parser.parseColor(token);
                        token = parser.getToken(true, true);
                    }
                    if (token.isPercentage() || token.isDimensionOfUnit("cm") || token.isDimensionOfUnit("mm") || token.isDimensionOfUnit("in") || token.isDimensionOfUnit("pc") || token.isDimensionOfUnit("px") || token.isDimensionOfUnit("em") || token.isDimensionOfUnit("ex") || token.isDimensionOfUnit("pt")) {
                        var offsetX = token.value;
                        token = parser.getToken(true, true);
                    } else {
                        return [];
                    }
                    if (token.isPercentage() || token.isDimensionOfUnit("cm") || token.isDimensionOfUnit("mm") || token.isDimensionOfUnit("in") || token.isDimensionOfUnit("pc") || token.isDimensionOfUnit("px") || token.isDimensionOfUnit("em") || token.isDimensionOfUnit("ex") || token.isDimensionOfUnit("pt")) {
                        var offsetY = token.value;
                        token = parser.getToken(true, true);
                    } else {
                        return [];
                    }
                    if (token.isPercentage() || token.isDimensionOfUnit("cm") || token.isDimensionOfUnit("mm") || token.isDimensionOfUnit("in") || token.isDimensionOfUnit("pc") || token.isDimensionOfUnit("px") || token.isDimensionOfUnit("em") || token.isDimensionOfUnit("ex") || token.isDimensionOfUnit("pt")) {
                        var blurRadius = token.value;
                        token = parser.getToken(true, true);
                    }
                    if (!color && (token.isFunction("rgb(") || token.isFunction("rgba(") || token.isFunction("hsl(") || token.isFunction("hsla(") || token.isSymbol("#") || token.isIdent())) {
                        var color = parser.parseColor(token);
                        token = parser.getToken(true, true);
                    }

                    shadows.push({ none:false,
                                     color:color,
                                     offsetX:offsetX, offsetY:offsetY,
                                     blurRadius:blurRadius });

                    if (token.isSymbol(",")) {
                        color = "";
                        blurRadius = "0px";
                        offsetX = "0px";
                        offsetY = "0px";
                        token = parser.getToken(true, true);
                    } else if (!token.isNotNull()) {
                        return shadows;
                    } else {
                        return [];
                    }
                }
            }
            return shadows;
        },

        parseBackgroundImages:function (aString) {
            var parser = new CSSParser();
            parser._init();
            parser.mPreserveWS = false;
            parser.mPreserveComments = false;
            parser.mPreservedTokens = [];
            parser.mScanner.init(aString);

            var backgrounds = [];
            var token = parser.getToken(true, true);
            while (token.isNotNull()) {
                /*if (token.isFunction("rgb(") ||
                 token.isFunction("rgba(") ||
                 token.isFunction("hsl(") ||
                 token.isFunction("hsla(") ||
                 token.isSymbol("#") ||
                 token.isIdent()) {
                 var color = parser.parseColor(token);
                 backgrounds.push( { type: "color", value: color });
                 token = parser.getToken(true, true);
                 }
                 else */
                if (token.isFunction("url(")) {
                    token = parser.getToken(true, true);
                    var urlContent = parser.parseURL(token);
                    backgrounds.push({ type:"image", value:"url(" + urlContent });
                    token = parser.getToken(true, true);
                } else if (token.isFunction("-moz-linear-gradient(") || token.isFunction("-moz-radial-gradient(") || token.isFunction("-moz-repeating-linear-gradient(") || token.isFunction("-moz-repeating-radial-gradient(")) {
                    var gradient = this.parseGradient(parser, token);
                    backgrounds.push({ type:gradient.isRadial ? "radial-gradient" : "linear-gradient", value:gradient });
                    token = parser.getToken(true, true);
                } else {
                    return null;
                }
                if (token.isSymbol(",")) {
                    token = parser.getToken(true, true);
                    if (!token.isNotNull()) {
                        return null;
                    }
                }
            }
            return backgrounds;
        },

        serializeGradient:function (gradient) {
            var s = gradient.isRadial ? (gradient.isRepeating ? "-moz-repeating-radial-gradient(" : "-moz-radial-gradient(" ) : (gradient.isRepeating ? "-moz-repeating-linear-gradient(" : "-moz-linear-gradient(" );
            if (gradient.angle || gradient.position) {
                s += (gradient.angle ? gradient.angle + " " : "") + (gradient.position ? gradient.position : "") + ", ";
            }
            if (gradient.isRadial && (gradient.shape || gradient.size)) {
                s += (gradient.shape ? gradient.shape : "") + " " + (gradient.size ? gradient.size : "") + ", ";
            }
            for (var i = 0; i < gradient.stops.length; i++) {
                var colorstop = gradient.stops[i];
                s += colorstop.color + (colorstop.position ? " " + colorstop.position : "");
                if (i != gradient.stops.length - 1) {
                    s += ", ";
                }
            }
            s += ")";
            return s;
        },

        parseBorderImage:function (aString) {
            var parser = new CSSParser();
            parser._init();
            parser.mPreserveWS = false;
            parser.mPreserveComments = false;
            parser.mPreservedTokens = [];
            parser.mScanner.init(aString);

            var borderImage = {url:"", offsets:[], widths:[], sizes:[]};
            var token = parser.getToken(true, true);
            if (token.isFunction("url(")) {
                token = parser.getToken(true, true);
                var urlContent = parser.parseURL(token);
                if (urlContent) {
                    borderImage.url = urlContent.substr(0, urlContent.length - 1).trim();
                    if ((borderImage.url[0] == '"' && borderImage.url[borderImage.url.length - 1] == '"') || (borderImage.url[0] == "'" && borderImage.url[borderImage.url.length - 1] == "'")) {
                        borderImage.url = borderImage.url.substr(1, borderImage.url.length - 2);
                    }
                } else {
                    return null;
                }
            } else {
                return null;
            }

            token = parser.getToken(true, true);
            if (token.isNumber() || token.isPercentage()) {
                borderImage.offsets.push(token.value);
            } else {
                return null;
            }
            var i;
            for (i = 0; i < 3; i++) {
                token = parser.getToken(true, true);
                if (token.isNumber() || token.isPercentage()) {
                    borderImage.offsets.push(token.value);
                } else {
                    break;
                }
            }
            if (i == 3) {
                token = parser.getToken(true, true);
            }

            if (token.isSymbol("/")) {
                token = parser.getToken(true, true);
                if (token.isDimension() || token.isNumber("0") || (token.isIdent() && token.value in parser.kBORDER_WIDTH_NAMES)) {
                    borderImage.widths.push(token.value);
                } else {
                    return null;
                }

                for (var i = 0; i < 3; i++) {
                    token = parser.getToken(true, true);
                    if (token.isDimension() || token.isNumber("0") || (token.isIdent() && token.value in parser.kBORDER_WIDTH_NAMES)) {
                        borderImage.widths.push(token.value);
                    } else {
                        break;
                    }
                }
                if (i == 3) {
                    token = parser.getToken(true, true);
                }
            }

            for (var i = 0; i < 2; i++) {
                if (token.isIdent("stretch") || token.isIdent("repeat") || token.isIdent("round")) {
                    borderImage.sizes.push(token.value);
                } else if (!token.isNotNull()) {
                    return borderImage;
                } else {
                    return null;
                }
                token = parser.getToken(true, true);
            }
            if (!token.isNotNull()) {
                return borderImage;
            }

            return null;
        },

        parseMediaQuery:function (aString) {
            var kCONSTRAINTS = {
                "width":true,
                "min-width":true,
                "max-width":true,
                "height":true,
                "min-height":true,
                "max-height":true,
                "device-width":true,
                "min-device-width":true,
                "max-device-width":true,
                "device-height":true,
                "min-device-height":true,
                "max-device-height":true,
                "orientation":true,
                "aspect-ratio":true,
                "min-aspect-ratio":true,
                "max-aspect-ratio":true,
                "device-aspect-ratio":true,
                "min-device-aspect-ratio":true,
                "max-device-aspect-ratio":true,
                "color":true,
                "min-color":true,
                "max-color":true,
                "color-index":true,
                "min-color-index":true,
                "max-color-index":true,
                "monochrome":true,
                "min-monochrome":true,
                "max-monochrome":true,
                "resolution":true,
                "min-resolution":true,
                "max-resolution":true,
                "scan":true,
                "grid":true
            };
            var parser = new CSSParser();
            parser._init();
            parser.mPreserveWS = false;
            parser.mPreserveComments = false;
            parser.mPreservedTokens = [];
            parser.mScanner.init(aString);

            var m = {amplifier:"", medium:"", constraints:[]};
            var token = parser.getToken(true, true);

            if (token.isIdent("all") || token.isIdent("aural") || token.isIdent("braille") || token.isIdent("handheld") || token.isIdent("print") || token.isIdent("projection") || token.isIdent("screen") || token.isIdent("tty") || token.isIdent("tv")) {
                m.medium = token.value;
                token = parser.getToken(true, true);
            } else if (token.isIdent("not") || token.isIdent("only")) {
                m.amplifier = token.value;
                token = parser.getToken(true, true);
                if (token.isIdent("all") || token.isIdent("aural") || token.isIdent("braille") || token.isIdent("handheld") || token.isIdent("print") || token.isIdent("projection") || token.isIdent("screen") || token.isIdent("tty") || token.isIdent("tv")) {
                    m.medium = token.value;
                    token = parser.getToken(true, true);
                } else {
                    return null;
                }
            }

            if (m.medium) {
                if (!token.isNotNull()) {
                    return m;
                }
                if (token.isIdent("and")) {
                    token = parser.getToken(true, true);
                } else {
                    return null;
                }
            }

            while (token.isSymbol("(")) {
                token = parser.getToken(true, true);
                if (token.isIdent() && (token.value in kCONSTRAINTS)) {
                    var constraint = token.value;
                    token = parser.getToken(true, true);
                    if (token.isSymbol(":")) {
                        token = parser.getToken(true, true);
                        var values = [];
                        while (!token.isSymbol(")")) {
                            values.push(token.value);
                            token = parser.getToken(true, true);
                        }
                        if (token.isSymbol(")")) {
                            m.constraints.push({constraint:constraint, value:values});
                            token = parser.getToken(true, true);
                            if (token.isNotNull()) {
                                if (token.isIdent("and")) {
                                    token = parser.getToken(true, true);
                                } else {
                                    return null;
                                }
                            } else {
                                return m;
                            }
                        } else {
                            return null;
                        }
                    } else if (token.isSymbol(")")) {
                        m.constraints.push({constraint:constraint, value:null});
                        token = parser.getToken(true, true);
                        if (token.isNotNull()) {
                            if (token.isIdent("and")) {
                                token = parser.getToken(true, true);
                            } else {
                                return null;
                            }
                        } else {
                            return m;
                        }
                    } else {
                        return null;
                    }
                } else {
                    return null;
                }
            }
            return m;
        }

    };


    /************************************************************/
    /************************** JSCSSP **************************/
    /************************************************************/

    var CSS_ESCAPE = '\\';

    var IS_HEX_DIGIT = 1;
    var START_IDENT = 2;
    var IS_IDENT = 4;
    var IS_WHITESPACE = 8;

    var W = IS_WHITESPACE;
    var I = IS_IDENT;
    var S = START_IDENT;
    var SI = IS_IDENT | START_IDENT;
    var XI = IS_IDENT | IS_HEX_DIGIT;
    var XSI = IS_IDENT | START_IDENT | IS_HEX_DIGIT;

    function CSSScanner(aString) {
        this.init(aString);
    }

    CSSScanner.prototype = {

        kLexTable:[
            //                                     TAB LF      FF  CR
            0, 0, 0, 0, 0, 0, 0, 0, 0, W, W, 0, W, W, 0, 0, //
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // SPC !   "   #   $   %   &   '   (   )   *   +   ,   -   .   /
            W, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, I, 0, 0, // 0   1   2   3   4   5   6   7   8   9   :   ;   <   =   >   ?
            XI, XI, XI, XI, XI, XI, XI, XI, XI, XI, 0, 0, 0, 0, 0, 0, // @   A   B   C   D   E   F   G   H   I   J   K   L   M   N   O
            0, XSI, XSI, XSI, XSI, XSI, XSI, SI, SI, SI, SI, SI, SI, SI, SI, SI, // P   Q   R   S   T   U   V   W   X   Y   Z   [   \   ]   ^   _
            SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, 0, S, 0, 0, SI, // `   a   b   c   d   e   f   g   h   i   j   k   l   m   n   o
            0, XSI, XSI, XSI, XSI, XSI, XSI, SI, SI, SI, SI, SI, SI, SI, SI, SI, // p   q   r   s   t   u   v   w   x   y   z   {   |   }   ~
            SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, 0, 0, 0, 0, 0, //
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, //
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, //     ¡   ¢   £   ¤   ¥   ¦   §   ¨   ©   ª   «   ¬   ­   ®   ¯
            0, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, // °   ±   ²   ³   ´   µ   ¶   ·   ¸   ¹   º   »   ¼   ½   ¾   ¿
            SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, // À   Á   Â   Ã   Ä   Å   Æ   Ç   È   É   Ê   Ë   Ì   Í   Î   Ï
            SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, // Ð   Ñ   Ò   Ó   Ô   Õ   Ö   ×   Ø   Ù   Ú   Û   Ü   Ý   Þ   ß
            SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, // à   á   â   ã   ä   å   æ   ç   è   é   ê   ë   ì   í   î   ï
            SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, // ð   ñ   ò   ó   ô   õ   ö   ÷   ø   ù   ú   û   ü   ý   þ   ÿ
            SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI
        ],

        kHexValues:{
            "0":0, "1":1, "2":2, "3":3, "4":4, "5":5, "6":6, "7":7, "8":8, "9":9,
            "a":10, "b":11, "c":12, "d":13, "e":14, "f":15
        },

        mString:"",
        mPos:0,
        mPreservedPos:[],

        init:function (aString) {
            this.mString = aString;
            this.mPos = 0;
            this.mPreservedPos = [];
        },

        getCurrentPos:function () {
            return this.mPos;
        },

        getAlreadyScanned:function () {
            return this.mString.substr(0, this.mPos);
        },

        preserveState:function () {
            this.mPreservedPos.push(this.mPos);
        },

        restoreState:function () {
            if (this.mPreservedPos.length) {
                this.mPos = this.mPreservedPos.pop();
            }
        },

        forgetState:function () {
            if (this.mPreservedPos.length) {
                this.mPreservedPos.pop();
            }
        },

        read:function () {
            if (this.mPos < this.mString.length) {
                return this.mString.charAt(this.mPos++);
            }
            return -1;
        },

        peek:function () {
            if (this.mPos < this.mString.length) {
                return this.mString.charAt(this.mPos);
            }
            return -1;
        },

        isHexDigit:function (c) {
            var code = c.charCodeAt(0);
            return (code < 256 && (this.kLexTable[code] & IS_HEX_DIGIT) != 0);
        },

        isIdentStart:function (c) {
            var code = c.charCodeAt(0);
            return (code >= 256 || (this.kLexTable[code] & START_IDENT) != 0);
        },

        startsWithIdent:function (aFirstChar, aSecondChar) {
            var code = aFirstChar.charCodeAt(0);
            return this.isIdentStart(aFirstChar) || (aFirstChar == "-" && this.isIdentStart(aSecondChar));
        },

        isIdent:function (c) {
            var code = c.charCodeAt(0);
            return (code >= 256 || (this.kLexTable[code] & IS_IDENT) != 0);
        },

        pushback:function () {
            this.mPos--;
        },

        nextHexValue:function () {
            var c = this.read();
            if (c == -1 || !this.isHexDigit(c)) {
                return new jscsspToken(jscsspToken.NULL_TYPE, null);
            }
            var s = c;
            c = this.read();
            while (c != -1 && this.isHexDigit(c)) {
                s += c;
                c = this.read();
            }
            if (c != -1) {
                this.pushback();
            }
            return new jscsspToken(jscsspToken.HEX_TYPE, s);
        },

        gatherEscape:function () {
            var c = this.peek();
            if (c == -1) {
                return "";
            }
            if (this.isHexDigit(c)) {
                var code = 0;
                for (var i = 0; i < 6; i++) {
                    c = this.read();
                    if (this.isHexDigit(c)) {
                        code = code * 16 + this.kHexValues[c.toLowerCase()];
                    } else if (!this.isHexDigit(c) && !this.isWhiteSpace(c)) {
                        this.pushback();
                        break;
                    } else {
                        break;
                    }
                }
                if (i == 6) {
                    c = this.peek();
                    if (this.isWhiteSpace(c)) {
                        this.read();
                    }
                }
                return String.fromCharCode(code);
            }
            c = this.read();
            if (c != "\n") {
                return c;
            }
            return "";
        },

        gatherIdent:function (c) {
            var s = "";
            if (c == CSS_ESCAPE) {
                s += this.gatherEscape();
            } else {
                s += c;
            }
            c = this.read();
            while (c != -1 && (this.isIdent(c) || c == CSS_ESCAPE)) {
                if (c == CSS_ESCAPE) {
                    s += this.gatherEscape();
                } else {
                    s += c;
                }
                c = this.read();
            }
            if (c != -1) {
                this.pushback();
            }
            return s;
        },

        parseIdent:function (c) {
            var value = this.gatherIdent(c);
            var nextChar = this.peek();
            if (nextChar == "(") {
                value += this.read();
                return new jscsspToken(jscsspToken.FUNCTION_TYPE, value);
            }
            return new jscsspToken(jscsspToken.IDENT_TYPE, value);
        },

        isDigit:function (c) {
            return (c >= '0') && (c <= '9');
        },

        parseComment:function (c) {
            var s = c;
            while ((c = this.read()) != -1) {
                s += c;
                if (c == "*") {
                    c = this.read();
                    if (c == -1) {
                        break;
                    }
                    if (c == "/") {
                        s += c;
                        break;
                    }
                    this.pushback();
                }
            }
            return new jscsspToken(jscsspToken.COMMENT_TYPE, s);
        },

        parseNumber:function (c) {
            var s = c;
            var foundDot = false;
            while ((c = this.read()) != -1) {
                if (c == ".") {
                    if (foundDot) {
                        break;
                    } else {
                        s += c;
                        foundDot = true;
                    }
                } else if (this.isDigit(c)) {
                    s += c;
                } else {
                    break;
                }
            }

            if (c != -1 && this.startsWithIdent(c, this.peek())) { // DIMENSION
                var unit = this.gatherIdent(c);
                s += unit;
                return new jscsspToken(jscsspToken.DIMENSION_TYPE, s, unit);
            } else if (c == "%") {
                s += "%";
                return new jscsspToken(jscsspToken.PERCENTAGE_TYPE, s);
            } else if (c != -1) {
                this.pushback();
            }
            return new jscsspToken(jscsspToken.NUMBER_TYPE, s);
        },

        parseString:function (aStop) {
            var s = aStop;
            var previousChar = aStop;
            var c;
            while ((c = this.read()) != -1) {
                if (c == aStop && previousChar != CSS_ESCAPE) {
                    s += c;
                    break;
                } else if (c == CSS_ESCAPE) {
                    c = this.peek();
                    if (c == -1) {
                        break;
                    } else if (c == "\n" || c == "\r" || c == "\f") {
                        d = c;
                        c = this.read();
                        // special for Opera that preserves \r\n...
                        if (d == "\r") {
                            c = this.peek();
                            if (c == "\n") {
                                c = this.read();
                            }
                        }
                    } else {
                        s += this.gatherEscape();
                        c = this.peek();
                    }
                } else if (c == "\n" || c == "\r" || c == "\f") {
                    break;
                } else {
                    s += c;
                }

                previousChar = c;
            }
            return new jscsspToken(jscsspToken.STRING_TYPE, s);
        },

        isWhiteSpace:function (c) {
            var code = c.charCodeAt(0);
            return code < 256 && (this.kLexTable[code] & IS_WHITESPACE) != 0;
        },

        eatWhiteSpace:function (c) {
            var s = c;
            while ((c = this.read()) != -1) {
                if (!this.isWhiteSpace(c)) {
                    break;
                }
                s += c;
            }
            if (c != -1) {
                this.pushback();
            }
            return s;
        },

        parseAtKeyword:function (c) {
            return new jscsspToken(jscsspToken.ATRULE_TYPE, this.gatherIdent(c));
        },

        nextToken:function () {
            var c = this.read();
            if (c == -1) {
                return new jscsspToken(jscsspToken.NULL_TYPE, null);
            }

            if (this.startsWithIdent(c, this.peek())) {
                return this.parseIdent(c);
            }

            if (c == '@') {
                var nextChar = this.read();
                if (nextChar != -1) {
                    var followingChar = this.peek();
                    this.pushback();
                    if (this.startsWithIdent(nextChar, followingChar)) {
                        return this.parseAtKeyword(c);
                    }
                }
            }

            if (c == "." || c == "+" || c == "-") {
                var nextChar = this.peek();
                if (this.isDigit(nextChar)) {
                    return this.parseNumber(c);
                } else if (nextChar == "." && c != ".") {
                    firstChar = this.read();
                    var secondChar = this.peek();
                    this.pushback();
                    if (this.isDigit(secondChar)) {
                        return this.parseNumber(c);
                    }
                }
            }
            if (this.isDigit(c)) {
                return this.parseNumber(c);
            }

            if (c == "'" || c == '"') {
                return this.parseString(c);
            }

            if (this.isWhiteSpace(c)) {
                var s = this.eatWhiteSpace(c);

                return new jscsspToken(jscsspToken.WHITESPACE_TYPE, s);
            }

            if (c == "|" || c == "~" || c == "^" || c == "$" || c == "*") {
                var nextChar = this.read();
                if (nextChar == "=") {
                    switch (c) {
                        case "~" :
                            return new jscsspToken(jscsspToken.INCLUDES_TYPE, "~=");
                        case "|" :
                            return new jscsspToken(jscsspToken.DASHMATCH_TYPE, "|=");
                        case "^" :
                            return new jscsspToken(jscsspToken.BEGINSMATCH_TYPE, "^=");
                        case "$" :
                            return new jscsspToken(jscsspToken.ENDSMATCH_TYPE, "$=");
                        case "*" :
                            return new jscsspToken(jscsspToken.CONTAINSMATCH_TYPE, "*=");
                        default :
                            break;
                    }
                } else if (nextChar != -1) {
                    this.pushback();
                }
            }

            if (c == "/" && this.peek() == "*") {
                return this.parseComment(c);
            }

            return new jscsspToken(jscsspToken.SYMBOL_TYPE, c);
        }
    };

    function CSSParser(aString) {
        this.mToken = null;
        this.mLookAhead = null;
        this.mScanner = new CSSScanner(aString);

        this.mPreserveWS = true;
        this.mPreserveComments = true;

        this.mPreservedTokens = [];

        this.mError = null;
    }

    CSSParser.prototype = {

        _init:function () {
            this.mToken = null;
            this.mLookAhead = null;
        },

        kINHERIT:"inherit",

        kBORDER_WIDTH_NAMES:{
            "thin":true,
            "medium":true,
            "thick":true
        },

        kBORDER_STYLE_NAMES:{
            "none":true,
            "hidden":true,
            "dotted":true,
            "dashed":true,
            "solid":true,
            "double":true,
            "groove":true,
            "ridge":true,
            "inset":true,
            "outset":true
        },

        kCOLOR_NAMES:{
            "transparent":true,

            "black":true,
            "silver":true,
            "gray":true,
            "white":true,
            "maroon":true,
            "red":true,
            "purple":true,
            "fuchsia":true,
            "green":true,
            "lime":true,
            "olive":true,
            "yellow":true,
            "navy":true,
            "blue":true,
            "teal":true,
            "aqua":true,

            "aliceblue":true,
            "antiquewhite":true,
            "aqua":true,
            "aquamarine":true,
            "azure":true,
            "beige":true,
            "bisque":true,
            "black":true,
            "blanchedalmond":true,
            "blue":true,
            "blueviolet":true,
            "brown":true,
            "burlywood":true,
            "cadetblue":true,
            "chartreuse":true,
            "chocolate":true,
            "coral":true,
            "cornflowerblue":true,
            "cornsilk":true,
            "crimson":true,
            "cyan":true,
            "darkblue":true,
            "darkcyan":true,
            "darkgoldenrod":true,
            "darkgray":true,
            "darkgreen":true,
            "darkgrey":true,
            "darkkhaki":true,
            "darkmagenta":true,
            "darkolivegreen":true,
            "darkorange":true,
            "darkorchid":true,
            "darkred":true,
            "darksalmon":true,
            "darkseagreen":true,
            "darkslateblue":true,
            "darkslategray":true,
            "darkslategrey":true,
            "darkturquoise":true,
            "darkviolet":true,
            "deeppink":true,
            "deepskyblue":true,
            "dimgray":true,
            "dimgrey":true,
            "dodgerblue":true,
            "firebrick":true,
            "floralwhite":true,
            "forestgreen":true,
            "fuchsia":true,
            "gainsboro":true,
            "ghostwhite":true,
            "gold":true,
            "goldenrod":true,
            "gray":true,
            "green":true,
            "greenyellow":true,
            "grey":true,
            "honeydew":true,
            "hotpink":true,
            "indianred":true,
            "indigo":true,
            "ivory":true,
            "khaki":true,
            "lavender":true,
            "lavenderblush":true,
            "lawngreen":true,
            "lemonchiffon":true,
            "lightblue":true,
            "lightcoral":true,
            "lightcyan":true,
            "lightgoldenrodyellow":true,
            "lightgray":true,
            "lightgreen":true,
            "lightgrey":true,
            "lightpink":true,
            "lightsalmon":true,
            "lightseagreen":true,
            "lightskyblue":true,
            "lightslategray":true,
            "lightslategrey":true,
            "lightsteelblue":true,
            "lightyellow":true,
            "lime":true,
            "limegreen":true,
            "linen":true,
            "magenta":true,
            "maroon":true,
            "mediumaquamarine":true,
            "mediumblue":true,
            "mediumorchid":true,
            "mediumpurple":true,
            "mediumseagreen":true,
            "mediumslateblue":true,
            "mediumspringgreen":true,
            "mediumturquoise":true,
            "mediumvioletred":true,
            "midnightblue":true,
            "mintcream":true,
            "mistyrose":true,
            "moccasin":true,
            "navajowhite":true,
            "navy":true,
            "oldlace":true,
            "olive":true,
            "olivedrab":true,
            "orange":true,
            "orangered":true,
            "orchid":true,
            "palegoldenrod":true,
            "palegreen":true,
            "paleturquoise":true,
            "palevioletred":true,
            "papayawhip":true,
            "peachpuff":true,
            "peru":true,
            "pink":true,
            "plum":true,
            "powderblue":true,
            "purple":true,
            "red":true,
            "rosybrown":true,
            "royalblue":true,
            "saddlebrown":true,
            "salmon":true,
            "sandybrown":true,
            "seagreen":true,
            "seashell":true,
            "sienna":true,
            "silver":true,
            "skyblue":true,
            "slateblue":true,
            "slategray":true,
            "slategrey":true,
            "snow":true,
            "springgreen":true,
            "steelblue":true,
            "tan":true,
            "teal":true,
            "thistle":true,
            "tomato":true,
            "turquoise":true,
            "violet":true,
            "wheat":true,
            "white":true,
            "whitesmoke":true,
            "yellow":true,
            "yellowgreen":true,

            "activeborder":true,
            "activecaption":true,
            "appworkspace":true,
            "background":true,
            "buttonface":true,
            "buttonhighlight":true,
            "buttonshadow":true,
            "buttontext":true,
            "captiontext":true,
            "graytext":true,
            "highlight":true,
            "highlighttext":true,
            "inactiveborder":true,
            "inactivecaption":true,
            "inactivecaptiontext":true,
            "infobackground":true,
            "infotext":true,
            "menu":true,
            "menutext":true,
            "scrollbar":true,
            "threeddarkshadow":true,
            "threedface":true,
            "threedhighlight":true,
            "threedlightshadow":true,
            "threedshadow":true,
            "window":true,
            "windowframe":true,
            "windowtext":true
        },

        kLIST_STYLE_TYPE_NAMES:{
            "decimal":true,
            "decimal-leading-zero":true,
            "lower-roman":true,
            "upper-roman":true,
            "georgian":true,
            "armenian":true,
            "lower-latin":true,
            "lower-alpha":true,
            "upper-latin":true,
            "upper-alpha":true,
            "lower-greek":true,

            "disc":true,
            "circle":true,
            "square":true,
            "none":true,

            /* CSS 3 */
            "box":true,
            "check":true,
            "diamond":true,
            "hyphen":true,

            "lower-armenian":true,
            "cjk-ideographic":true,
            "ethiopic-numeric":true,
            "hebrew":true,
            "japanese-formal":true,
            "japanese-informal":true,
            "simp-chinese-formal":true,
            "simp-chinese-informal":true,
            "syriac":true,
            "tamil":true,
            "trad-chinese-formal":true,
            "trad-chinese-informal":true,
            "upper-armenian":true,
            "arabic-indic":true,
            "binary":true,
            "bengali":true,
            "cambodian":true,
            "khmer":true,
            "devanagari":true,
            "gujarati":true,
            "gurmukhi":true,
            "kannada":true,
            "lower-hexadecimal":true,
            "lao":true,
            "malayalam":true,
            "mongolian":true,
            "myanmar":true,
            "octal":true,
            "oriya":true,
            "persian":true,
            "urdu":true,
            "telugu":true,
            "tibetan":true,
            "upper-hexadecimal":true,
            "afar":true,
            "ethiopic-halehame-aa-et":true,
            "ethiopic-halehame-am-et":true,
            "amharic-abegede":true,
            "ehiopic-abegede-am-et":true,
            "cjk-earthly-branch":true,
            "cjk-heavenly-stem":true,
            "ethiopic":true,
            "ethiopic-abegede":true,
            "ethiopic-abegede-gez":true,
            "hangul-consonant":true,
            "hangul":true,
            "hiragana-iroha":true,
            "hiragana":true,
            "katakana-iroha":true,
            "katakana":true,
            "lower-norwegian":true,
            "oromo":true,
            "ethiopic-halehame-om-et":true,
            "sidama":true,
            "ethiopic-halehame-sid-et":true,
            "somali":true,
            "ethiopic-halehame-so-et":true,
            "tigre":true,
            "ethiopic-halehame-tig":true,
            "tigrinya-er-abegede":true,
            "ethiopic-abegede-ti-er":true,
            "tigrinya-et":true,
            "ethiopic-halehame-ti-et":true,
            "upper-greek":true,
            "asterisks":true,
            "footnotes":true,
            "circled-decimal":true,
            "circled-lower-latin":true,
            "circled-upper-latin":true,
            "dotted-decimal":true,
            "double-circled-decimal":true,
            "filled-circled-decimal":true,
            "parenthesised-decimal":true,
            "parenthesised-lower-latin":true
        },

        reportError:function (aMsg) {
            this.mError = aMsg;
        },

        consumeError:function () {
            var e = this.mError;
            this.mError = null;
            return e;
        },

        currentToken:function () {
            return this.mToken;
        },

        getHexValue:function () {
            this.mToken = this.mScanner.nextHexValue();
            return this.mToken;
        },

        getToken:function (aSkipWS, aSkipComment) {
            if (this.mLookAhead) {
                this.mToken = this.mLookAhead;
                this.mLookAhead = null;
                return this.mToken;
            }

            this.mToken = this.mScanner.nextToken();
            while (this.mToken && ((aSkipWS && this.mToken.isWhiteSpace()) || (aSkipComment && this.mToken.isComment()))) {
                this.mToken = this.mScanner.nextToken();
            }
            return this.mToken;
        },

        lookAhead:function (aSkipWS, aSkipComment) {
            var preservedToken = this.mToken;
            this.mScanner.preserveState();
            var token = this.getToken(aSkipWS, aSkipComment);
            this.mScanner.restoreState();
            this.mToken = preservedToken;

            return token;
        },

        ungetToken:function () {
            this.mLookAhead = this.mToken;
        },

        addUnknownAtRule:function (aSheet, aString) {
            var currentLine = CountLF(this.mScanner.getAlreadyScanned());
            var blocks = [];
            var token = this.getToken(false, false);
            while (token.isNotNull()) {
                aString += token.value;
                if (token.isSymbol(";") && !blocks.length) {
                    break;
                } else if (token.isSymbol("{") || token.isSymbol("(") || token.isSymbol("[") || token.type == "function") {
                    blocks.push(token.isFunction() ? "(" : token.value);
                } else if (token.isSymbol("}") || token.isSymbol(")") || token.isSymbol("]")) {
                    if (blocks.length) {
                        var ontop = blocks[blocks.length - 1];
                        if ((token.isSymbol("}") && ontop == "{") || (token.isSymbol(")") && ontop == "(") || (token.isSymbol("]") && ontop == "[")) {
                            blocks.pop();
                            if (!blocks.length && token.isSymbol("}")) {
                                break;
                            }
                        }
                    }
                }
                token = this.getToken(false, false);
            }

            this.addUnknownRule(aSheet, aString, currentLine);
        },

        addUnknownRule:function (aSheet, aString, aCurrentLine) {
            var errorMsg = this.consumeError();
            var rule = new jscsspErrorRule(errorMsg);
            rule.currentLine = aCurrentLine;
            rule.parsedCssText = aString;
            rule.parentStyleSheet = aSheet;
            aSheet.cssRules.push(rule);
        },

        addWhitespace:function (aSheet, aString) {
            var rule = new jscsspWhitespace();
            rule.parsedCssText = aString;
            rule.parentStyleSheet = aSheet;
            aSheet.cssRules.push(rule);
        },

        addComment:function (aSheet, aString) {
            var rule = new jscsspComment();
            rule.parsedCssText = aString;
            rule.parentStyleSheet = aSheet;
            aSheet.cssRules.push(rule);
        },

        parseCharsetRule:function (aToken, aSheet) {
            var s = aToken.value;
            var token = this.getToken(false, false);
            s += token.value;
            if (token.isWhiteSpace(" ")) {
                token = this.getToken(false, false);
                s += token.value;
                if (token.isString()) {
                    var encoding = token.value;
                    token = this.getToken(false, false);
                    s += token.value;
                    if (token.isSymbol(";")) {
                        var rule = new jscsspCharsetRule();
                        rule.encoding = encoding;
                        rule.parsedCssText = s;
                        rule.parentStyleSheet = aSheet;
                        aSheet.cssRules.push(rule);
                        return true;
                    } else {
                        this.reportError(kCHARSET_RULE_MISSING_SEMICOLON);
                    }
                } else {
                    this.reportError(kCHARSET_RULE_CHARSET_IS_STRING);
                }
            } else {
                this.reportError(kCHARSET_RULE_MISSING_WS);
            }

            this.addUnknownAtRule(aSheet, s);
            return false;
        },

        parseImportRule:function (aToken, aSheet) {
            var currentLine = CountLF(this.mScanner.getAlreadyScanned());
            var s = aToken.value;
            this.preserveState();
            var token = this.getToken(true, true);
            var media = [];
            var href = "";
            if (token.isString()) {
                href = token.value;
                s += " " + href;
            } else if (token.isFunction("url(")) {
                token = this.getToken(true, true);
                var urlContent = this.parseURL(token);
                if (urlContent) {
                    href = "url(" + urlContent;
                    s += " " + href;
                }
            } else {
                this.reportError(kIMPORT_RULE_MISSING_URL);
            }

            if (href) {
                token = this.getToken(true, true);
                while (token.isIdent()) {
                    s += " " + token.value;
                    media.push(token.value);
                    token = this.getToken(true, true);
                    if (!token) {
                        break;
                    }
                    if (token.isSymbol(",")) {
                        s += ",";
                    } else if (token.isSymbol(";")) {
                        break;
                    } else {
                        break;
                    }
                    token = this.getToken(true, true);
                }

                if (!media.length) {
                    media.push("all");
                }

                if (token.isSymbol(";")) {
                    s += ";"
                    this.forgetState();
                    var rule = new jscsspImportRule();
                    rule.currentLine = currentLine;
                    rule.parsedCssText = s;
                    rule.href = href;
                    rule.media = media;
                    rule.parentStyleSheet = aSheet;
                    aSheet.cssRules.push(rule);
                    return true;
                }
            }

            this.restoreState();
            this.addUnknownAtRule(aSheet, "@import");
            return false;
        },

        parseVariablesRule:function (token, aSheet) {
            var currentLine = CountLF(this.mScanner.getAlreadyScanned());
            var s = token.value;
            var declarations = [];
            var valid = false;
            this.preserveState();
            token = this.getToken(true, true);
            var media = [];
            var foundMedia = false;
            while (token.isNotNull()) {
                if (token.isIdent()) {
                    foundMedia = true;
                    s += " " + token.value;
                    media.push(token.value);
                    token = this.getToken(true, true);
                    if (token.isSymbol(",")) {
                        s += ",";
                    } else {
                        if (token.isSymbol("{")) {
                            this.ungetToken();
                        } else {
                            // error...
                            token.type = jscsspToken.NULL_TYPE;
                            break;
                        }
                    }
                } else if (token.isSymbol("{")) {
                    break;
                } else if (foundMedia) {
                    token.type = jscsspToken.NULL_TYPE;
                    // not a media list
                    break;
                }
                token = this.getToken(true, true);
            }

            if (token.isSymbol("{")) {
                s += " {";
                token = this.getToken(true, true);
                while (true) {
                    if (!token.isNotNull()) {
                        valid = true;
                        break;
                    }
                    if (token.isSymbol("}")) {
                        s += "}";
                        valid = true;
                        break;
                    } else {
                        var d = this.parseDeclaration(token, declarations, true, false, aSheet);
                        s += ((d && declarations.length) ? " " : "") + d;
                    }
                    token = this.getToken(true, false);
                }
            }
            if (valid) {
                this.forgetState();
                var rule = new jscsspVariablesRule();
                rule.currentLine = currentLine;
                rule.parsedCssText = s;
                rule.declarations = declarations;
                rule.media = media;
                rule.parentStyleSheet = aSheet;
                aSheet.cssRules.push(rule)
                return true;
            }
            this.restoreState();
            return false;
        },

        parseNamespaceRule:function (aToken, aSheet) {
            var currentLine = CountLF(this.mScanner.getAlreadyScanned());
            var s = aToken.value;
            var valid = false;
            this.preserveState();
            var token = this.getToken(true, true);
            if (token.isNotNull()) {
                var prefix = "";
                var url = "";
                if (token.isIdent()) {
                    prefix = token.value;
                    s += " " + prefix;
                    token = this.getToken(true, true);
                }
                if (token) {
                    var foundURL = false;
                    if (token.isString()) {
                        foundURL = true;
                        url = token.value;
                        s += " " + url;
                    } else if (token.isFunction("url(")) {
                        // get a url here...
                        token = this.getToken(true, true);
                        var urlContent = this.parseURL(token);
                        if (urlContent) {
                            url += "url(" + urlContent;
                            foundURL = true;
                            s += " " + urlContent;
                        }
                    }
                }
                if (foundURL) {
                    token = this.getToken(true, true);
                    if (token.isSymbol(";")) {
                        s += ";";
                        this.forgetState();
                        var rule = new jscsspNamespaceRule();
                        rule.currentLine = currentLine;
                        rule.parsedCssText = s;
                        rule.prefix = prefix;
                        rule.url = url;
                        rule.parentStyleSheet = aSheet;
                        aSheet.cssRules.push(rule);
                        return true;
                    }
                }

            }
            this.restoreState();
            this.addUnknownAtRule(aSheet, "@namespace");
            return false;
        },

        parseFontFaceRule:function (aToken, aSheet) {
            var currentLine = CountLF(this.mScanner.getAlreadyScanned());
            var s = aToken.value;
            var valid = false;
            var descriptors = [];
            this.preserveState();
            var token = this.getToken(true, true);
            if (token.isNotNull()) {
                // expecting block start
                if (token.isSymbol("{")) {
                    s += " " + token.value;
                    var token = this.getToken(true, false);
                    while (true) {
                        if (token.isSymbol("}")) {
                            s += "}";
                            valid = true;
                            break;
                        } else {
                            var d = this.parseDeclaration(token, descriptors, false, false, aSheet);
                            s += ((d && descriptors.length) ? " " : "") + d;
                        }
                        token = this.getToken(true, false);
                    }
                }
            }
            if (valid) {
                this.forgetState();
                var rule = new jscsspFontFaceRule();
                rule.currentLine = currentLine;
                rule.parsedCssText = s;
                rule.descriptors = descriptors;
                rule.parentStyleSheet = aSheet;
                aSheet.cssRules.push(rule)
                return true;
            }
            this.restoreState();
            return false;
        },

        parsePageRule:function (aToken, aSheet) {
            var currentLine = CountLF(this.mScanner.getAlreadyScanned());
            var s = aToken.value;
            var valid = false;
            var declarations = [];
            this.preserveState();
            var token = this.getToken(true, true);
            var pageSelector = "";
            if (token.isSymbol(":") || token.isIdent()) {
                if (token.isSymbol(":")) {
                    pageSelector = ":";
                    token = this.getToken(false, false);
                }
                if (token.isIdent()) {
                    pageSelector += token.value;
                    s += " " + pageSelector;
                    token = this.getToken(true, true);
                }
            }
            if (token.isNotNull()) {
                // expecting block start
                if (token.isSymbol("{")) {
                    s += " " + token.value;
                    var token = this.getToken(true, false);
                    while (true) {
                        if (token.isSymbol("}")) {
                            s += "}";
                            valid = true;
                            break;
                        } else {
                            var d = this.parseDeclaration(token, declarations, true, true, aSheet);
                            s += ((d && declarations.length) ? " " : "") + d;
                        }
                        token = this.getToken(true, false);
                    }
                }
            }
            if (valid) {
                this.forgetState();
                var rule = new jscsspPageRule();
                rule.currentLine = currentLine;
                rule.parsedCssText = s;
                rule.pageSelector = pageSelector;
                rule.declarations = declarations;
                rule.parentStyleSheet = aSheet;
                aSheet.cssRules.push(rule)
                return true;
            }
            this.restoreState();
            return false;
        },

        parseDefaultPropertyValue:function (token, aDecl, aAcceptPriority, descriptor, aSheet) {
            var valueText = "";
            var blocks = [];
            var foundPriority = false;
            var values = [];
            while (token.isNotNull()) {

                if ((token.isSymbol(";") || token.isSymbol("}") || token.isSymbol("!")) && !blocks.length) {
                    if (token.isSymbol("}")) {
                        this.ungetToken();
                    }
                    break;
                }

                if (token.isIdent(this.kINHERIT)) {
                    if (values.length) {
                        return "";
                    } else {
                        valueText = this.kINHERIT;
                        var value = new jscsspVariable(kJscsspINHERIT_VALUE, aSheet);
                        values.push(value);
                        token = this.getToken(true, true);
                        break;
                    }
                } else if (token.isSymbol("{") || token.isSymbol("(") || token.isSymbol("[")) {
                    blocks.push(token.value);
                } else if (token.isSymbol("}") || token.isSymbol("]")) {
                    if (blocks.length) {
                        var ontop = blocks[blocks.length - 1];
                        if ((token.isSymbol("}") && ontop == "{") || (token.isSymbol(")") && ontop == "(") || (token.isSymbol("]") && ontop == "[")) {
                            blocks.pop();
                        }
                    }
                }
                // XXX must find a better way to store individual values
                // probably a |values: []| field holding dimensions, percentages
                // functions, idents, numbers and symbols, in that order.
                if (token.isFunction()) {
                    if (token.isFunction("var(")) {
                        token = this.getToken(true, true);
                        if (token.isIdent()) {
                            var name = token.value;
                            token = this.getToken(true, true);
                            if (token.isSymbol(")")) {
                                var value = new jscsspVariable(kJscsspVARIABLE_VALUE, aSheet);
                                valueText += "var(" + name + ")";
                                value.name = name;
                                values.push(value);
                            } else {
                                return "";
                            }
                        } else {
                            return "";
                        }
                    } else {
                        var fn = token.value;
                        token = this.getToken(false, true);
                        var arg = this.parseFunctionArgument(token);
                        if (arg) {
                            valueText += fn + arg;
                            var value = new jscsspVariable(kJscsspPRIMITIVE_VALUE, aSheet);
                            value.value = fn + arg;
                            values.push(value);
                        } else {
                            return "";
                        }
                    }
                } else if (token.isSymbol("#")) {
                    var color = this.parseColor(token);
                    if (color) {
                        valueText += color;
                        var value = new jscsspVariable(kJscsspPRIMITIVE_VALUE, aSheet);
                        value.value = color;
                        values.push(value);
                    } else {
                        return "";
                    }
                } else if (!token.isWhiteSpace() && !token.isSymbol(",")) {
                    var value = new jscsspVariable(kJscsspPRIMITIVE_VALUE, aSheet);
                    value.value = token.value;
                    values.push(value);
                    valueText += token.value;
                } else {
                    valueText += token.value;
                }
                token = this.getToken(false, true);
            }
            if (values.length && valueText) {
                this.forgetState();
                aDecl.push(this._createJscsspDeclarationFromValuesArray(descriptor, values, valueText));
                return valueText;
            }
            return "";
        },

        parseMarginOrPaddingShorthand:function (token, aDecl, aAcceptPriority, aProperty) {
            var top = null;
            var bottom = null;
            var left = null;
            var right = null;

            var values = [];
            while (true) {

                if (!token.isNotNull()) {
                    break;
                }

                if (token.isSymbol(";") || (aAcceptPriority && token.isSymbol("!")) || token.isSymbol("}")) {
                    if (token.isSymbol("}")) {
                        this.ungetToken();
                    }
                    break;
                }

                else if (!values.length && token.isIdent(this.kINHERIT)) {
                    values.push(token.value);
                    token = this.getToken(true, true);
                    break;
                }

                else if (token.isDimension() || token.isNumber("0") || token.isPercentage() || token.isIdent("auto")) {
                    values.push(token.value);
                } else {
                    return "";
                }

                token = this.getToken(true, true);
            }

            var count = values.length;
            switch (count) {
                case 1:
                    top = values[0];
                    bottom = top;
                    left = top;
                    right = top;
                    break;
                case 2:
                    top = values[0];
                    bottom = top;
                    left = values[1];
                    right = left;
                    break;
                case 3:
                    top = values[0];
                    left = values[1];
                    right = left;
                    bottom = values[2];
                    break;
                case 4:
                    top = values[0];
                    right = values[1];
                    bottom = values[2];
                    left = values[3];
                    break;
                default:
                    return "";
            }
            this.forgetState();
            aDecl.push(this._createJscsspDeclarationFromValue(aProperty + "-top", top));
            aDecl.push(this._createJscsspDeclarationFromValue(aProperty + "-right", right));
            aDecl.push(this._createJscsspDeclarationFromValue(aProperty + "-bottom", bottom));
            aDecl.push(this._createJscsspDeclarationFromValue(aProperty + "-left", left));
            return top + " " + right + " " + bottom + " " + left;
        },

        parseBorderColorShorthand:function (token, aDecl, aAcceptPriority) {
            var top = null;
            var bottom = null;
            var left = null;
            var right = null;

            var values = [];
            while (true) {

                if (!token.isNotNull()) {
                    break;
                }

                if (token.isSymbol(";") || (aAcceptPriority && token.isSymbol("!")) || token.isSymbol("}")) {
                    if (token.isSymbol("}")) {
                        this.ungetToken();
                    }
                    break;
                }

                else if (!values.length && token.isIdent(this.kINHERIT)) {
                    values.push(token.value);
                    token = this.getToken(true, true);
                    break;
                }

                else {
                    var color = this.parseColor(token);
                    if (color) {
                        values.push(color);
                    } else {
                        return "";
                    }
                }

                token = this.getToken(true, true);
            }

            var count = values.length;
            switch (count) {
                case 1:
                    top = values[0];
                    bottom = top;
                    left = top;
                    right = top;
                    break;
                case 2:
                    top = values[0];
                    bottom = top;
                    left = values[1];
                    right = left;
                    break;
                case 3:
                    top = values[0];
                    left = values[1];
                    right = left;
                    bottom = values[2];
                    break;
                case 4:
                    top = values[0];
                    right = values[1];
                    bottom = values[2];
                    left = values[3];
                    break;
                default:
                    return "";
            }
            this.forgetState();
            aDecl.push(this._createJscsspDeclarationFromValue("border-top-color", top));
            aDecl.push(this._createJscsspDeclarationFromValue("border-right-color", right));
            aDecl.push(this._createJscsspDeclarationFromValue("border-bottom-color", bottom));
            aDecl.push(this._createJscsspDeclarationFromValue("border-left-color", left));
            return top + " " + right + " " + bottom + " " + left;
        },

        parseCueShorthand:function (token, declarations, aAcceptPriority) {
            var before = "";
            var after = "";

            var values = [];
            var values = [];
            while (true) {

                if (!token.isNotNull()) {
                    break;
                }

                if (token.isSymbol(";") || (aAcceptPriority && token.isSymbol("!")) || token.isSymbol("}")) {
                    if (token.isSymbol("}")) {
                        this.ungetToken();
                    }
                    break;
                }

                else if (!values.length && token.isIdent(this.kINHERIT)) {
                    values.push(token.value);
                }

                else if (token.isIdent("none")) {
                    values.push(token.value);
                }

                else if (token.isFunction("url(")) {
                    var token = this.getToken(true, true);
                    var urlContent = this.parseURL(token);
                    if (urlContent) {
                        values.push("url(" + urlContent);
                    } else {
                        return "";
                    }
                } else {
                    return "";
                }

                token = this.getToken(true, true);
            }

            var count = values.length;
            switch (count) {
                case 1:
                    before = values[0];
                    after = before;
                    break;
                case 2:
                    before = values[0];
                    after = values[1];
                    break;
                default:
                    return "";
            }
            this.forgetState();
            aDecl.push(this._createJscsspDeclarationFromValue("cue-before", before));
            aDecl.push(this._createJscsspDeclarationFromValue("cue-after", after));
            return before + " " + after;
        },

        parsePauseShorthand:function (token, declarations, aAcceptPriority) {
            var before = "";
            var after = "";

            var values = [];
            var values = [];
            while (true) {

                if (!token.isNotNull()) {
                    break;
                }

                if (token.isSymbol(";") || (aAcceptPriority && token.isSymbol("!")) || token.isSymbol("}")) {
                    if (token.isSymbol("}")) {
                        this.ungetToken();
                    }
                    break;
                }

                else if (!values.length && token.isIdent(this.kINHERIT)) {
                    values.push(token.value);
                }

                else if (token.isDimensionOfUnit("ms") || token.isDimensionOfUnit("s") || token.isPercentage() || token.isNumber("0")) {
                    values.push(token.value);
                } else {
                    return "";
                }

                token = this.getToken(true, true);
            }

            var count = values.length;
            switch (count) {
                case 1:
                    before = values[0];
                    after = before;
                    break;
                case 2:
                    before = values[0];
                    after = values[1];
                    break;
                default:
                    return "";
            }
            this.forgetState();
            aDecl.push(this._createJscsspDeclarationFromValue("pause-before", before));
            aDecl.push(this._createJscsspDeclarationFromValue("pause-after", after));
            return before + " " + after;
        },

        parseBorderWidthShorthand:function (token, aDecl, aAcceptPriority) {
            var top = null;
            var bottom = null;
            var left = null;
            var right = null;

            var values = [];
            while (true) {

                if (!token.isNotNull()) {
                    break;
                }

                if (token.isSymbol(";") || (aAcceptPriority && token.isSymbol("!")) || token.isSymbol("}")) {
                    if (token.isSymbol("}")) {
                        this.ungetToken();
                    }
                    break;
                }

                else if (!values.length && token.isIdent(this.kINHERIT)) {
                    values.push(token.value);
                }

                else if (token.isDimension() || token.isNumber("0") || (token.isIdent() && token.value in this.kBORDER_WIDTH_NAMES)) {
                    values.push(token.value);
                } else {
                    return "";
                }

                token = this.getToken(true, true);
            }

            var count = values.length;
            switch (count) {
                case 1:
                    top = values[0];
                    bottom = top;
                    left = top;
                    right = top;
                    break;
                case 2:
                    top = values[0];
                    bottom = top;
                    left = values[1];
                    right = left;
                    break;
                case 3:
                    top = values[0];
                    left = values[1];
                    right = left;
                    bottom = values[2];
                    break;
                case 4:
                    top = values[0];
                    right = values[1];
                    bottom = values[2];
                    left = values[3];
                    break;
                default:
                    return "";
            }
            this.forgetState();
            aDecl.push(this._createJscsspDeclarationFromValue("border-top-width", top));
            aDecl.push(this._createJscsspDeclarationFromValue("border-right-width", right));
            aDecl.push(this._createJscsspDeclarationFromValue("border-bottom-width", bottom));
            aDecl.push(this._createJscsspDeclarationFromValue("border-left-width", left));
            return top + " " + right + " " + bottom + " " + left;
        },

        parseBorderStyleShorthand:function (token, aDecl, aAcceptPriority) {
            var top = null;
            var bottom = null;
            var left = null;
            var right = null;

            var values = [];
            while (true) {

                if (!token.isNotNull()) {
                    break;
                }

                if (token.isSymbol(";") || (aAcceptPriority && token.isSymbol("!")) || token.isSymbol("}")) {
                    if (token.isSymbol("}")) {
                        this.ungetToken();
                    }
                    break;
                }

                else if (!values.length && token.isIdent(this.kINHERIT)) {
                    values.push(token.value);
                }

                else if (token.isIdent() && token.value in this.kBORDER_STYLE_NAMES) {
                    values.push(token.value);
                } else {
                    return "";
                }

                token = this.getToken(true, true);
            }

            var count = values.length;
            switch (count) {
                case 1:
                    top = values[0];
                    bottom = top;
                    left = top;
                    right = top;
                    break;
                case 2:
                    top = values[0];
                    bottom = top;
                    left = values[1];
                    right = left;
                    break;
                case 3:
                    top = values[0];
                    left = values[1];
                    right = left;
                    bottom = values[2];
                    break;
                case 4:
                    top = values[0];
                    right = values[1];
                    bottom = values[2];
                    left = values[3];
                    break;
                default:
                    return "";
            }
            this.forgetState();
            aDecl.push(this._createJscsspDeclarationFromValue("border-top-style", top));
            aDecl.push(this._createJscsspDeclarationFromValue("border-right-style", right));
            aDecl.push(this._createJscsspDeclarationFromValue("border-bottom-style", bottom));
            aDecl.push(this._createJscsspDeclarationFromValue("border-left-style", left));
            return top + " " + right + " " + bottom + " " + left;
        },

        parseBorderEdgeOrOutlineShorthand:function (token, aDecl, aAcceptPriority, aProperty) {
            var bWidth = null;
            var bStyle = null;
            var bColor = null;

            while (true) {
                if (!token.isNotNull()) {
                    break;
                }

                if (token.isSymbol(";") || (aAcceptPriority && token.isSymbol("!")) || token.isSymbol("}")) {
                    if (token.isSymbol("}")) {
                        this.ungetToken();
                    }
                    break;
                }

                else if (!bWidth && !bStyle && !bColor && token.isIdent(this.kINHERIT)) {
                    bWidth = this.kINHERIT;
                    bStyle = this.kINHERIT;
                    bColor = this.kINHERIT;
                }

                else if (!bWidth && (token.isDimension() || (token.isIdent() && token.value in this.kBORDER_WIDTH_NAMES) || token.isNumber("0"))) {
                    bWidth = token.value;
                }

                else if (!bStyle && (token.isIdent() && token.value in this.kBORDER_STYLE_NAMES)) {
                    bStyle = token.value;
                }

                else {
                    var color = (aProperty == "outline" && token.isIdent("invert")) ? "invert" : this.parseColor(token);
                    if (!bColor && color) {
                        bColor = color;
                    } else {
                        return "";
                    }
                }
                token = this.getToken(true, true);
            }

            // create the declarations
            this.forgetState();
            bWidth = bWidth ? bWidth : "medium";
            bStyle = bStyle ? bStyle : "none";
            bColor = bColor ? bColor : "-moz-initial";

            function addPropertyToDecl(aSelf, aDecl, property, w, s, c) {
                aDecl.push(aSelf._createJscsspDeclarationFromValue(property + "-width", w));
                aDecl.push(aSelf._createJscsspDeclarationFromValue(property + "-style", s));
                aDecl.push(aSelf._createJscsspDeclarationFromValue(property + "-color", c));
            }

            if (aProperty == "border") {
                addPropertyToDecl(this, aDecl, "border-top", bWidth, bStyle, bColor);
                addPropertyToDecl(this, aDecl, "border-right", bWidth, bStyle, bColor);
                addPropertyToDecl(this, aDecl, "border-bottom", bWidth, bStyle, bColor);
                addPropertyToDecl(this, aDecl, "border-left", bWidth, bStyle, bColor);
            } else {
                addPropertyToDecl(this, aDecl, aProperty, bWidth, bStyle, bColor);
            }
            return bWidth + " " + bStyle + " " + bColor;
        },

        parseBackgroundShorthand:function (token, aDecl, aAcceptPriority) {
            var kHPos = {"left":true, "right":true };
            var kVPos = {"top":true, "bottom":true };
            var kPos = {"left":true, "right":true, "top":true, "bottom":true, "center":true};

            var bgColor = null;
            var bgRepeat = null;
            var bgAttachment = null;
            var bgImage = null;
            var bgPosition = null;

            while (true) {

                if (!token.isNotNull()) {
                    break;
                }

                if (token.isSymbol(";") || (aAcceptPriority && token.isSymbol("!")) || token.isSymbol("}")) {
                    if (token.isSymbol("}")) {
                        this.ungetToken();
                    }
                    break;
                }

                else if (!bgColor && !bgRepeat && !bgAttachment && !bgImage && !bgPosition && token.isIdent(this.kINHERIT)) {
                    bgColor = this.kINHERIT;
                    bgRepeat = this.kINHERIT;
                    bgAttachment = this.kINHERIT;
                    bgImage = this.kINHERIT;
                    bgPosition = this.kINHERIT;
                }

                else {
                    if (!bgAttachment && (token.isIdent("scroll") || token.isIdent("fixed"))) {
                        bgAttachment = token.value;
                    }

                    else if (!bgPosition && ((token.isIdent() && token.value in kPos) || token.isDimension() || token.isNumber("0") || token.isPercentage())) {
                        bgPosition = token.value;
                        token = this.getToken(true, true);
                        if (token.isDimension() || token.isNumber("0") || token.isPercentage()) {
                            bgPosition += " " + token.value;
                        } else if (token.isIdent() && token.value in kPos) {
                            if ((bgPosition in kHPos && token.value in kHPos) || (bgPosition in kVPos && token.value in kVPos)) {
                                return "";
                            }
                            bgPosition += " " + token.value;
                        } else {
                            this.ungetToken();
                            bgPosition += " center";
                        }
                    }

                    else if (!bgRepeat && (token.isIdent("repeat") || token.isIdent("repeat-x") || token.isIdent("repeat-y") || token.isIdent("no-repeat"))) {
                        bgRepeat = token.value;
                    }

                    else if (!bgImage && (token.isFunction("url(") || token.isIdent("none"))) {
                        bgImage = token.value;
                        if (token.isFunction("url(")) {
                            token = this.getToken(true, true);
                            var url = this.parseURL(token); // TODO
                            if (url) {
                                bgImage += url;
                            } else {
                                return "";
                            }
                        }
                    }

                    else if (!bgImage && (token.isFunction("-moz-linear-gradient(") || token.isFunction("-moz-radial-gradient(") || token.isFunction("-moz-repeating-linear-gradient(") || token.isFunction("-moz-repeating-radial-gradient("))) {
                        var gradient = CssInspector.parseGradient(this, token);
                        if (gradient) {
                            bgImage = CssInspector.serializeGradient(gradient);
                        } else {
                            return "";
                        }
                    }

                    else {
                        var color = this.parseColor(token);
                        if (!bgColor && color) {
                            bgColor = color;
                        } else {
                            return "";
                        }
                    }

                }

                token = this.getToken(true, true);
            }

            // create the declarations
            this.forgetState();
            bgColor = bgColor ? bgColor : "transparent";
            bgImage = bgImage ? bgImage : "none";
            bgRepeat = bgRepeat ? bgRepeat : "repeat";
            bgAttachment = bgAttachment ? bgAttachment : "scroll";
            bgPosition = bgPosition ? bgPosition : "top left";

            aDecl.push(this._createJscsspDeclarationFromValue("background-color", bgColor));
            aDecl.push(this._createJscsspDeclarationFromValue("background-image", bgImage));
            aDecl.push(this._createJscsspDeclarationFromValue("background-repeat", bgRepeat));
            aDecl.push(this._createJscsspDeclarationFromValue("background-attachment", bgAttachment));
            aDecl.push(this._createJscsspDeclarationFromValue("background-position", bgPosition));
            return bgColor + " " + bgImage + " " + bgRepeat + " " + bgAttachment + " " + bgPosition;
        },

        parseListStyleShorthand:function (token, aDecl, aAcceptPriority) {
            var kPosition = { "inside":true, "outside":true };

            var lType = null;
            var lPosition = null;
            var lImage = null;

            while (true) {

                if (!token.isNotNull()) {
                    break;
                }

                if (token.isSymbol(";") || (aAcceptPriority && token.isSymbol("!")) || token.isSymbol("}")) {
                    if (token.isSymbol("}")) {
                        this.ungetToken();
                    }
                    break;
                }

                else if (!lType && !lPosition && !lImage && token.isIdent(this.kINHERIT)) {
                    lType = this.kINHERIT;
                    lPosition = this.kINHERIT;
                    lImage = this.kINHERIT;
                }

                else if (!lType && (token.isIdent() && token.value in this.kLIST_STYLE_TYPE_NAMES)) {
                    lType = token.value;
                }

                else if (!lPosition && (token.isIdent() && token.value in kPosition)) {
                    lPosition = token.value;
                }

                else if (!lImage && token.isFunction("url")) {
                    token = this.getToken(true, true);
                    var urlContent = this.parseURL(token);
                    if (urlContent) {
                        lImage = "url(" + urlContent;
                    } else {
                        return "";
                    }
                } else if (!token.isIdent("none")) {
                    return "";
                }

                token = this.getToken(true, true);
            }

            // create the declarations
            this.forgetState();
            lType = lType ? lType : "none";
            lImage = lImage ? lImage : "none";
            lPosition = lPosition ? lPosition : "outside";

            aDecl.push(this._createJscsspDeclarationFromValue("list-style-type", lType));
            aDecl.push(this._createJscsspDeclarationFromValue("list-style-position", lPosition));
            aDecl.push(this._createJscsspDeclarationFromValue("list-style-image", lImage));
            return lType + " " + lPosition + " " + lImage;
        },

        parseFontShorthand:function (token, aDecl, aAcceptPriority) {
            var kStyle = {"italic":true, "oblique":true };
            var kVariant = {"small-caps":true };
            var kWeight = { "bold":true, "bolder":true, "lighter":true,
                "100":true, "200":true, "300":true, "400":true,
                "500":true, "600":true, "700":true, "800":true,
                "900":true };
            var kSize = { "xx-small":true, "x-small":true, "small":true, "medium":true,
                "large":true, "x-large":true, "xx-large":true,
                "larger":true, "smaller":true };
            var kValues = { "caption":true, "icon":true, "menu":true, "message-box":true, "small-caption":true, "status-bar":true };
            var kFamily = { "serif":true, "sans-serif":true, "cursive":true, "fantasy":true, "monospace":true };

            var fStyle = null;
            var fVariant = null;
            var fWeight = null;
            var fSize = null;
            var fLineHeight = null;
            var fFamily = "";
            var fSystem = null;
            var fFamilyValues = [];

            var normalCount = 0;
            while (true) {

                if (!token.isNotNull()) {
                    break;
                }

                if (token.isSymbol(";") || (aAcceptPriority && token.isSymbol("!")) || token.isSymbol("}")) {
                    if (token.isSymbol("}")) {
                        this.ungetToken();
                    }
                    break;
                }

                else if (!fStyle && !fVariant && !fWeight && !fSize && !fLineHeight && !fFamily && !fSystem && token.isIdent(this.kINHERIT)) {
                    fStyle = this.kINHERIT;
                    fVariant = this.kINHERIT;
                    fWeight = this.kINHERIT;
                    fSize = this.kINHERIT;
                    fLineHeight = this.kINHERIT;
                    fFamily = this.kINHERIT;
                    fSystem = this.kINHERIT;
                }

                else {
                    if (!fSystem && (token.isIdent() && token.value in kValues)) {
                        fSystem = token.value;
                        break;
                    }

                    else {
                        if (!fStyle && token.isIdent() && (token.value in kStyle)) {
                            fStyle = token.value;
                        }

                        else if (!fVariant && token.isIdent() && (token.value in kVariant)) {
                            fVariant = token.value;
                        }

                        else if (!fWeight && (token.isIdent() || token.isNumber()) && (token.value in kWeight)) {
                            fWeight = token.value;
                        }

                        else if (!fSize && ((token.isIdent() && (token.value in kSize)) || token.isDimension() || token.isPercentage())) {
                            fSize = token.value;
                            var token = this.getToken(false, false);
                            if (token.isSymbol("/")) {
                                token = this.getToken(false, false);
                                if (!fLineHeight && (token.isDimension() || token.isNumber() || token.isPercentage())) {
                                    fLineHeight = token.value;
                                } else {
                                    return "";
                                }
                            } else {
                                this.ungetToken();
                            }
                        }

                        else if (token.isIdent("normal")) {
                            normalCount++;
                            if (normalCount > 3) {
                                return "";
                            }
                        }

                        else if (!fFamily && // *MUST* be last to be tested here
                                 (token.isString() || token.isIdent())) {
                            var lastWasComma = false;
                            while (true) {
                                if (!token.isNotNull()) {
                                    break;
                                } else if (token.isSymbol(";") || (aAcceptPriority && token.isSymbol("!")) || token.isSymbol("}")) {
                                    this.ungetToken();
                                    break;
                                } else if (token.isIdent() && token.value in kFamily) {
                                    var value = new jscsspVariable(kJscsspPRIMITIVE_VALUE, null);
                                    value.value = token.value;
                                    fFamilyValues.push(value);
                                    fFamily += token.value;
                                    break;
                                } else if (token.isString() || token.isIdent()) {
                                    var value = new jscsspVariable(kJscsspPRIMITIVE_VALUE, null);
                                    value.value = token.value;
                                    fFamilyValues.push(value);
                                    fFamily += token.value;
                                    lastWasComma = false;
                                } else if (!lastWasComma && token.isSymbol(",")) {
                                    fFamily += ", ";
                                    lastWasComma = true;
                                } else {
                                    return "";
                                }
                                token = this.getToken(true, true);
                            }
                        }

                        else {
                            return "";
                        }
                    }

                }

                token = this.getToken(true, true);
            }

            // create the declarations
            this.forgetState();
            if (fSystem) {
                aDecl.push(this._createJscsspDeclarationFromValue("font", fSystem));
                return fSystem;
            }
            fStyle = fStyle ? fStyle : "normal";
            fVariant = fVariant ? fVariant : "normal";
            fWeight = fWeight ? fWeight : "normal";
            fSize = fSize ? fSize : "medium";
            fLineHeight = fLineHeight ? fLineHeight : "normal";
            fFamily = fFamily ? fFamily : "-moz-initial";

            aDecl.push(this._createJscsspDeclarationFromValue("font-style", fStyle));
            aDecl.push(this._createJscsspDeclarationFromValue("font-variant", fVariant));
            aDecl.push(this._createJscsspDeclarationFromValue("font-weight", fWeight));
            aDecl.push(this._createJscsspDeclarationFromValue("font-size", fSize));
            aDecl.push(this._createJscsspDeclarationFromValue("line-height", fLineHeight));
            aDecl.push(this._createJscsspDeclarationFromValuesArray("font-family", fFamilyValues, fFamily));
            return fStyle + " " + fVariant + " " + fWeight + " " + fSize + "/" + fLineHeight + " " + fFamily;
        },

        _createJscsspDeclaration:function (property, value) {
            var decl = new jscsspDeclaration();
            decl.property = property;
            decl.value = this.trim11(value);
            decl.parsedCssText = property + ": " + value + ";";
            return decl;
        },

        _createJscsspDeclarationFromValue:function (property, valueText) {
            var decl = new jscsspDeclaration();
            decl.property = property;
            var value = new jscsspVariable(kJscsspPRIMITIVE_VALUE, null);
            value.value = valueText;
            decl.values = [value];
            decl.valueText = valueText;
            decl.parsedCssText = property + ": " + valueText + ";";
            return decl;
        },

        _createJscsspDeclarationFromValuesArray:function (property, values, valueText) {
            var decl = new jscsspDeclaration();
            decl.property = property;
            decl.values = values;
            decl.valueText = valueText;
            decl.parsedCssText = property + ": " + valueText + ";";
            return decl;
        },

        parseURL:function (token) {
            var value = "";
            if (token.isString()) {
                value += token.value;
                token = this.getToken(true, true);
            } else {
                while (true) {
                    if (!token.isNotNull()) {
                        this.reportError(kURL_EOF);
                        return "";
                    }
                    if (token.isWhiteSpace()) {
                        nextToken = this.lookAhead(true, true);
                        // if next token is not a closing parenthesis, that's an error
                        if (!nextToken.isSymbol(")")) {
                            this.reportError(kURL_WS_INSIDE);
                            token = this.currentToken();
                            break;
                        }
                    }
                    if (token.isSymbol(")")) {
                        break;
                    }
                    value += token.value;
                    token = this.getToken(false, false);
                }
            }

            if (token.isSymbol(")")) {
                return value + ")";
            }
            return "";
        },

        parseFunctionArgument:function (token) {
            var value = "";
            if (token.isString()) {
                value += token.value;
                token = this.getToken(true, true);
            } else {
                var parenthesis = 1;
                while (true) {
                    if (!token.isNotNull()) {
                        return "";
                    }
                    if (token.isFunction() || token.isSymbol("(")) {
                        parenthesis++;
                    }
                    if (token.isSymbol(")")) {
                        parenthesis--;
                        if (!parenthesis) {
                            break;
                        }
                    }
                    value += token.value;
                    token = this.getToken(false, false);
                }
            }

            if (token.isSymbol(")")) {
                return value + ")";
            }
            return "";
        },

        parseColor:function (token) {
            var color = "";
            if (token.isFunction("rgb(") || token.isFunction("rgba(")) {
                color = token.value;
                var isRgba = token.isFunction("rgba(")
                token = this.getToken(true, true);
                if (!token.isNumber() && !token.isPercentage()) {
                    return "";
                }
                color += token.value;
                token = this.getToken(true, true);
                if (!token.isSymbol(",")) {
                    return "";
                }
                color += ", ";

                token = this.getToken(true, true);
                if (!token.isNumber() && !token.isPercentage()) {
                    return "";
                }
                color += token.value;
                token = this.getToken(true, true);
                if (!token.isSymbol(",")) {
                    return "";
                }
                color += ", ";

                token = this.getToken(true, true);
                if (!token.isNumber() && !token.isPercentage()) {
                    return "";
                }
                color += token.value;

                if (isRgba) {
                    token = this.getToken(true, true);
                    if (!token.isSymbol(",")) {
                        return "";
                    }
                    color += ", ";

                    token = this.getToken(true, true);
                    if (!token.isNumber()) {
                        return "";
                    }
                    color += token.value;
                }

                token = this.getToken(true, true);
                if (!token.isSymbol(")")) {
                    return "";
                }
                color += token.value;
            }

            else if (token.isFunction("hsl(") || token.isFunction("hsla(")) {
                color = token.value;
                var isHsla = token.isFunction("hsla(")
                token = this.getToken(true, true);
                if (!token.isNumber()) {
                    return "";
                }
                color += token.value;
                token = this.getToken(true, true);
                if (!token.isSymbol(",")) {
                    return "";
                }
                color += ", ";

                token = this.getToken(true, true);
                if (!token.isPercentage()) {
                    return "";
                }
                color += token.value;
                token = this.getToken(true, true);
                if (!token.isSymbol(",")) {
                    return "";
                }
                color += ", ";

                token = this.getToken(true, true);
                if (!token.isPercentage()) {
                    return "";
                }
                color += token.value;

                if (isHsla) {
                    token = this.getToken(true, true);
                    if (!token.isSymbol(",")) {
                        return "";
                    }
                    color += ", ";

                    token = this.getToken(true, true);
                    if (!token.isNumber()) {
                        return "";
                    }
                    color += token.value;
                }

                token = this.getToken(true, true);
                if (!token.isSymbol(")")) {
                    return "";
                }
                color += token.value;
            }

            else if (token.isIdent() && (token.value in this.kCOLOR_NAMES)) {
                color = token.value;
            }

            else if (token.isSymbol("#")) {
                token = this.getHexValue();
                if (!token.isHex()) {
                    return "";
                }
                var length = token.value.length;
                if (length != 3 && length != 6) {
                    return "";
                }
                if (token.value.match(/[a-fA-F0-9]/g).length != length) {
                    return "";
                }
                color = "#" + token.value;
            }
            return color;
        },

        parseDeclaration:function (aToken, aDecl, aAcceptPriority, aExpandShorthands, aSheet) {
            this.preserveState();
            var blocks = [];
            if (aToken.isIdent()) {
                var descriptor = aToken.value.toLowerCase();
                var token = this.getToken(true, true);
                if (token.isSymbol(":")) {
                    var token = this.getToken(true, true);

                    var value = "";
                    var declarations = [];
                    if (aExpandShorthands) {
                        switch (descriptor) {
                            case "background":
                                value = this.parseBackgroundShorthand(token, declarations, aAcceptPriority);
                                break;
                            case "margin":
                            case "padding":
                                value = this.parseMarginOrPaddingShorthand(token, declarations, aAcceptPriority, descriptor);
                                break;
                            case "border-color":
                                value = this.parseBorderColorShorthand(token, declarations, aAcceptPriority);
                                break;
                            case "border-style":
                                value = this.parseBorderStyleShorthand(token, declarations, aAcceptPriority);
                                break;
                            case "border-width":
                                value = this.parseBorderWidthShorthand(token, declarations, aAcceptPriority);
                                break;
                            case "border-top":
                            case "border-right":
                            case "border-bottom":
                            case "border-left":
                            case "border":
                            case "outline":
                                value = this.parseBorderEdgeOrOutlineShorthand(token, declarations, aAcceptPriority, descriptor);
                                break;
                            case "cue":
                                value = this.parseCueShorthand(token, declarations, aAcceptPriority);
                                break;
                            case "pause":
                                value = this.parsePauseShorthand(token, declarations, aAcceptPriority);
                                break;
                            case "font":
                                value = this.parseFontShorthand(token, declarations, aAcceptPriority);
                                break;
                            case "list-style":
                                value = this.parseListStyleShorthand(token, declarations, aAcceptPriority);
                                break;
                            default:
                                value = this.parseDefaultPropertyValue(token, declarations, aAcceptPriority, descriptor, aSheet);
                                break;
                        }
                    } else {
                        value = this.parseDefaultPropertyValue(token, declarations, aAcceptPriority, descriptor, aSheet);
                    }
                    token = this.currentToken();
                    if (value) // no error above
                    {
                        var priority = false;
                        if (token.isSymbol("!")) {
                            token = this.getToken(true, true);
                            if (token.isIdent("important")) {
                                priority = true;
                                token = this.getToken(true, true);
                                if (token.isSymbol(";") || token.isSymbol("}")) {
                                    if (token.isSymbol("}")) {
                                        this.ungetToken();
                                    }
                                } else {
                                    return "";
                                }
                            } else {
                                return "";
                            }
                        } else if (token.isNotNull() && !token.isSymbol(";") && !token.isSymbol("}")) {
                            return "";
                        }
                        for (var i = 0; i < declarations.length; i++) {
                            declarations[i].priority = priority;
                            aDecl.push(declarations[i]);
                        }
                        return descriptor + ": " + value + ";";
                    }
                }
            } else if (aToken.isComment()) {
                if (this.mPreserveComments) {
                    this.forgetState();
                    var comment = new jscsspComment();
                    comment.parsedCssText = aToken.value;
                    aDecl.push(comment);
                }
                return aToken.value;
            }

            // we have an error here, let's skip it
            this.restoreState();
            var s = aToken.value;
            blocks = [];
            var token = this.getToken(false, false);
            while (token.isNotNull()) {
                s += token.value;
                if ((token.isSymbol(";") || token.isSymbol("}")) && !blocks.length) {
                    if (token.isSymbol("}")) {
                        this.ungetToken();
                    }
                    break;
                } else if (token.isSymbol("{") || token.isSymbol("(") || token.isSymbol("[") || token.isFunction()) {
                    blocks.push(token.isFunction() ? "(" : token.value);
                } else if (token.isSymbol("}") || token.isSymbol(")") || token.isSymbol("]")) {
                    if (blocks.length) {
                        var ontop = blocks[blocks.length - 1];
                        if ((token.isSymbol("}") && ontop == "{") || (token.isSymbol(")") && ontop == "(") || (token.isSymbol("]") && ontop == "[")) {
                            blocks.pop();
                        }
                    }
                }
                token = this.getToken(false, false);
            }
            return "";
        },

        parseMediaRule:function (aToken, aSheet) {
            var currentLine = CountLF(this.mScanner.getAlreadyScanned());
            var s = aToken.value;
            var valid = false;
            var mediaRule = new jscsspMediaRule();
            mediaRule.currentLine = currentLine;
            this.preserveState();
            var token = this.getToken(true, true);
            var foundMedia = false;
            while (token.isNotNull()) {
                if (token.isIdent()) {
                    foundMedia = true;
                    s += " " + token.value;
                    mediaRule.media.push(token.value);
                    token = this.getToken(true, true);
                    if (token.isSymbol(",")) {
                        s += ",";
                    } else {
                        if (token.isSymbol("{")) {
                            this.ungetToken();
                        } else {
                            // error...
                            token.type = jscsspToken.NULL_TYPE;
                            break;
                        }
                    }
                } else if (token.isSymbol("{")) {
                    break;
                } else if (foundMedia) {
                    token.type = jscsspToken.NULL_TYPE;
                    // not a media list
                    break;
                }
                token = this.getToken(true, true);
            }
            if (token.isSymbol("{") && mediaRule.media.length) {
                // ok let's parse style rules now...
                s += " { ";
                token = this.getToken(true, false);
                while (token.isNotNull()) {
                    if (token.isComment() && this.mPreserveComments) {
                        s += " " + token.value;
                        var comment = new jscsspComment();
                        comment.parsedCssText = token.value;
                        mediaRule.cssRules.push(comment);
                    } else if (token.isSymbol("}")) {
                        valid = true;
                        break;
                    } else {
                        var r = this.parseStyleRule(token, mediaRule, true);
                        if (r) {
                            s += r;
                        }
                    }
                    token = this.getToken(true, false);
                }
            }
            if (valid) {
                this.forgetState();
                mediaRule.parsedCssText = s;
                aSheet.cssRules.push(mediaRule);
                return true;
            }
            this.restoreState();
            return false;
        },

        trim11:function (str) {
            str = str.replace(/^\s+/, '');
            for (var i = str.length - 1; i >= 0; i--) {
                if (/\S/.test(str.charAt(i))) { // XXX charat
                    str = str.substring(0, i + 1);
                    break;
                }
            }
            return str;
        },

        parseStyleRule:function (aToken, aOwner, aIsInsideMediaRule) {
            var currentLine = CountLF(this.mScanner.getAlreadyScanned());
            this.preserveState();
            // first let's see if we have a selector here...
            var selector = this.parseSelector(aToken, false);
            var valid = false;
            var declarations = [];
            if (selector) {
                selector = this.trim11(selector.selector);
                var s = selector;
                var token = this.getToken(true, true);
                if (token.isSymbol("{")) {
                    s += " { ";
                    var token = this.getToken(true, false);
                    while (true) {
                        if (!token.isNotNull()) {
                            valid = true;
                            break;
                        }
                        if (token.isSymbol("}")) {
                            s += "}";
                            valid = true;
                            break;
                        } else {
                            var d = this.parseDeclaration(token, declarations, true, true, aOwner);
                            s += ((d && declarations.length) ? " " : "") + d;
                        }
                        token = this.getToken(true, false);
                    }
                }
            } else {
                // selector is invalid so the whole rule is invalid with it
            }

            if (valid) {
                var rule = new jscsspStyleRule();
                rule.currentLine = currentLine;
                rule.parsedCssText = s;
                rule.declarations = declarations;
                rule.mSelectorText = selector;
                if (aIsInsideMediaRule) {
                    rule.parentRule = aOwner;
                } else {
                    rule.parentStyleSheet = aOwner;
                }
                aOwner.cssRules.push(rule);
                return s;
            }
            this.restoreState();
            s = this.currentToken().value;
            this.addUnknownAtRule(aOwner, s);
            return "";
        },

        parseSelector:function (aToken, aParseSelectorOnly) {
            var s = "";
            var specificity = {a:0, b:0, c:0, d:0}; // CSS 2.1 section 6.4.3
            var isFirstInChain = true;
            var token = aToken;
            var valid = false;
            var combinatorFound = false;
            while (true) {
                if (!token.isNotNull()) {
                    if (aParseSelectorOnly) {
                        return {selector:s, specificity:specificity };
                    }
                    return "";
                }

                if (!aParseSelectorOnly && token.isSymbol("{")) {
                    // end of selector
                    valid = !combinatorFound;
                    // don't unget if invalid since addUnknownRule is going to restore state anyway
                    if (valid) {
                        this.ungetToken();
                    }
                    break;
                }

                if (token.isSymbol(",")) { // group of selectors
                    s += token.value;
                    isFirstInChain = true;
                    combinatorFound = false;
                    token = this.getToken(false, true);
                    continue;
                }
                // now combinators and grouping...
                else if (!combinatorFound && (token.isWhiteSpace() || token.isSymbol(">") || token.isSymbol("+") || token.isSymbol("~"))) {
                    if (token.isWhiteSpace()) {
                        s += " ";
                        var nextToken = this.lookAhead(true, true);
                        if (!nextToken.isNotNull()) {
                            if (aParseSelectorOnly) {
                                return {selector:s, specificity:specificity };
                            }
                            return "";
                        }
                        if (nextToken.isSymbol(">") || nextToken.isSymbol("+") || nextToken.isSymbol("~")) {
                            token = this.getToken(true, true);
                            s += token.value + " ";
                            combinatorFound = true;
                        }
                    } else {
                        s += token.value;
                        combinatorFound = true;
                    }
                    isFirstInChain = true;
                    token = this.getToken(true, true);
                    continue;
                } else {
                    var simpleSelector = this.parseSimpleSelector(token, isFirstInChain, true);
                    if (!simpleSelector) {
                        break;
                    } // error
                    s += simpleSelector.selector;
                    specificity.b += simpleSelector.specificity.b;
                    specificity.c += simpleSelector.specificity.c;
                    specificity.d += simpleSelector.specificity.d;
                    isFirstInChain = false;
                    combinatorFound = false;
                }

                token = this.getToken(false, true);
            }

            if (valid) {
                return {selector:s, specificity:specificity };
            }
            return "";
        },

        isPseudoElement:function (aIdent) {
            switch (aIdent) {
                case "first-letter":
                case "first-line":
                case "before":
                case "after":
                case "marker":
                    return true;
                    break;
                default:
                    return false;
                    break;
            }
        },

        parseSimpleSelector:function (token, isFirstInChain, canNegate) {
            var s = "";
            var specificity = {a:0, b:0, c:0, d:0}; // CSS 2.1 section 6.4.3

            if (isFirstInChain && (token.isSymbol("*") || token.isSymbol("|") || token.isIdent())) {
                // type or universal selector
                if (token.isSymbol("*") || token.isIdent()) {
                    // we don't know yet if it's a prefix or a universal
                    // selector
                    s += token.value;
                    var isIdent = token.isIdent();
                    token = this.getToken(false, true);
                    if (token.isSymbol("|")) {
                        // it's a prefix
                        s += token.value;
                        token = this.getToken(false, true);
                        if (token.isIdent() || token.isSymbol("*")) {
                            // ok we now have a type element or universal
                            // selector
                            s += token.value;
                            if (token.isIdent()) {
                                specificity.d++;
                            }
                        } else
                        // oops that's an error...
                        {
                            return null;
                        }
                    } else {
                        this.ungetToken();
                        if (isIdent) {
                            specificity.d++;
                        }
                    }
                } else if (token.isSymbol("|")) {
                    s += token.value;
                    token = this.getToken(false, true);
                    if (token.isIdent() || token.isSymbol("*")) {
                        s += token.value;
                        if (token.isIdent()) {
                            specificity.d++;
                        }
                    } else
                    // oops that's an error
                    {
                        return null;
                    }
                }
            }

            else if (token.isSymbol(".") || token.isSymbol("#")) {
                var isClass = token.isSymbol(".");
                s += token.value;
                token = this.getToken(false, true);
                if (token.isIdent()) {
                    s += token.value;
                    if (isClass) {
                        specificity.c++;
                    } else {
                        specificity.b++;
                    }
                } else {
                    return null;
                }
            }

            else if (token.isSymbol(":")) {
                s += token.value;
                token = this.getToken(false, true);
                if (token.isSymbol(":")) {
                    s += token.value;
                    token = this.getToken(false, true);
                }
                if (token.isIdent()) {
                    s += token.value;
                    if (this.isPseudoElement(token.value)) {
                        specificity.d++;
                    } else {
                        specificity.c++;
                    }
                } else if (token.isFunction()) {
                    s += token.value;
                    if (token.isFunction(":not(")) {
                        if (!canNegate) {
                            return null;
                        }
                        token = this.getToken(true, true);
                        var simpleSelector = this.parseSimpleSelector(token, isFirstInChain, false);
                        if (!simpleSelector) {
                            return null;
                        } else {
                            s += simpleSelector.selector;
                            token = this.getToken(true, true);
                            if (token.isSymbol(")")) {
                                s += ")";
                            } else {
                                return null;
                            }
                        }
                        specificity.c++;
                    } else {
                        while (true) {
                            token = this.getToken(false, true);
                            if (token.isSymbol(")")) {
                                s += ")";
                                break;
                            } else {
                                s += token.value;
                            }
                        }
                        specificity.c++;
                    }
                } else {
                    return null;
                }

            } else if (token.isSymbol("[")) {
                s += "[";
                token = this.getToken(true, true);
                if (token.isIdent() || token.isSymbol("*")) {
                    s += token.value;
                    var nextToken = this.getToken(true, true);
                    if (token.isSymbol("|")) {
                        s += "|";
                        token = this.getToken(true, true);
                        if (token.isIdent()) {
                            s += token.value;
                        } else {
                            return null;
                        }
                    } else {
                        this.ungetToken();
                    }
                } else if (token.isSymbol("|")) {
                    s += "|";
                    token = this.getToken(true, true);
                    if (token.isIdent()) {
                        s += token.value;
                    } else {
                        return null;
                    }
                } else {
                    return null;
                }

                // nothing, =, *=, $=, ^=, |=
                token = this.getToken(true, true);
                if (token.isIncludes() || token.isDashmatch() || token.isBeginsmatch() || token.isEndsmatch() || token.isContainsmatch() || token.isSymbol("=")) {
                    s += token.value;
                    token = this.getToken(true, true);
                    if (token.isString() || token.isIdent()) {
                        s += token.value;
                        token = this.getToken(true, true);
                    } else {
                        return null;
                    }

                    if (token.isSymbol("]")) {
                        s += token.value;
                        specificity.c++;
                    } else {
                        return null;
                    }
                } else if (token.isSymbol("]")) {
                    s += token.value;
                    specificity.c++;
                } else {
                    return null;
                }

            } else if (token.isWhiteSpace()) {
                var t = this.lookAhead(true, true);
                if (t.isSymbol('{')) {
                    return ""
                }
            }
            if (s) {
                return {selector:s, specificity:specificity };
            }
            return null;
        },

        preserveState:function () {
            this.mPreservedTokens.push(this.currentToken());
            this.mScanner.preserveState();
        },

        restoreState:function () {
            if (this.mPreservedTokens.length) {
                this.mScanner.restoreState();
                this.mToken = this.mPreservedTokens.pop();
            }
        },

        forgetState:function () {
            if (this.mPreservedTokens.length) {
                this.mScanner.forgetState();
                this.mPreservedTokens.pop();
            }
        },

        parse:function (aString, aTryToPreserveWhitespaces, aTryToPreserveComments) {
            if (!aString) {
                return null;
            } // early way out if we can

            this.mPreserveWS = aTryToPreserveWhitespaces;
            this.mPreserveComments = aTryToPreserveComments;
            this.mPreservedTokens = [];
            this.mScanner.init(aString);
            var sheet = new jscsspStylesheet();

            // @charset can only appear at first char of the stylesheet
            var token = this.getToken(false, false);
            if (!token.isNotNull()) {
                return;
            }
            if (token.isAtRule("@charset")) {
                this.parseCharsetRule(token, sheet);
                token = this.getToken(false, false);
            }

            var foundStyleRules = false;
            var foundImportRules = false;
            var foundNameSpaceRules = false;
            while (true) {
                if (!token.isNotNull()) {
                    break;
                }
                if (token.isWhiteSpace()) {
                    if (aTryToPreserveWhitespaces) {
                        this.addWhitespace(sheet, token.value);
                    }
                }

                else if (token.isComment()) {
                    if (this.mPreserveComments) {
                        this.addComment(sheet, token.value);
                    }
                }

                else if (token.isAtRule()) {
                    if (token.isAtRule("@variables")) {
                        if (!foundImportRules && !foundStyleRules) {
                            this.parseVariablesRule(token, sheet);
                        } else {
                            this.reportError(kVARIABLES_RULE_POSITION);
                            this.addUnknownAtRule(sheet, token.value);
                        }
                    } else if (token.isAtRule("@import")) {
                        // @import rules MUST occur before all style and namespace
                        // rules
                        if (!foundStyleRules && !foundNameSpaceRules) {
                            foundImportRules = this.parseImportRule(token, sheet);
                        } else {
                            this.reportError(kIMPORT_RULE_POSITION);
                            this.addUnknownAtRule(sheet, token.value);
                        }
                    } else if (token.isAtRule("@namespace")) {
                        // @namespace rules MUST occur before all style rule and
                        // after all @import rules
                        if (!foundStyleRules) {
                            foundNameSpaceRules = this.parseNamespaceRule(token, sheet);
                        } else {
                            this.reportError(kNAMESPACE_RULE_POSITION);
                            this.addUnknownAtRule(sheet, token.value);
                        }
                    } else if (token.isAtRule("@font-face")) {
                        if (this.parseFontFaceRule(token, sheet)) {
                            foundStyleRules = true;
                        } else {
                            this.addUnknownAtRule(sheet, token.value);
                        }
                    } else if (token.isAtRule("@page")) {
                        if (this.parsePageRule(token, sheet)) {
                            foundStyleRules = true;
                        } else {
                            this.addUnknownAtRule(sheet, token.value);
                        }
                    } else if (token.isAtRule("@media")) {
                        if (this.parseMediaRule(token, sheet)) {
                            foundStyleRules = true;
                        } else {
                            this.addUnknownAtRule(sheet, token.value);
                        }
                    } else if (token.isAtRule("@charset")) {
                        this.reportError(kCHARSET_RULE_CHARSET_SOF);
                        this.addUnknownAtRule(sheet, token.value);
                    } else {
                        this.reportError(kUNKNOWN_AT_RULE);
                        this.addUnknownAtRule(sheet, token.value);
                    }
                }

                else // plain style rules
                {
                    var ruleText = this.parseStyleRule(token, sheet, false);
                    if (ruleText) {
                        foundStyleRules = true;
                    }
                }
                token = this.getToken(false);
            }

            return sheet;
        }

    };


    function jscsspToken(aType, aValue, aUnit) {
        this.type = aType;
        this.value = aValue;
        this.unit = aUnit;
    }

    jscsspToken.NULL_TYPE = 0;

    jscsspToken.WHITESPACE_TYPE = 1;
    jscsspToken.STRING_TYPE = 2;
    jscsspToken.COMMENT_TYPE = 3;
    jscsspToken.NUMBER_TYPE = 4;
    jscsspToken.IDENT_TYPE = 5;
    jscsspToken.FUNCTION_TYPE = 6;
    jscsspToken.ATRULE_TYPE = 7;
    jscsspToken.INCLUDES_TYPE = 8;
    jscsspToken.DASHMATCH_TYPE = 9;
    jscsspToken.BEGINSMATCH_TYPE = 10;
    jscsspToken.ENDSMATCH_TYPE = 11;
    jscsspToken.CONTAINSMATCH_TYPE = 12;
    jscsspToken.SYMBOL_TYPE = 13;
    jscsspToken.DIMENSION_TYPE = 14;
    jscsspToken.PERCENTAGE_TYPE = 15;
    jscsspToken.HEX_TYPE = 16;

    jscsspToken.prototype = {

        isNotNull:function () {
            return this.type;
        },

        _isOfType:function (aType, aValue) {
            return (this.type == aType && (!aValue || this.value.toLowerCase() == aValue));
        },

        isWhiteSpace:function (w) {
            return this._isOfType(jscsspToken.WHITESPACE_TYPE, w);
        },

        isString:function () {
            return this._isOfType(jscsspToken.STRING_TYPE);
        },

        isComment:function () {
            return this._isOfType(jscsspToken.COMMENT_TYPE);
        },

        isNumber:function (n) {
            return this._isOfType(jscsspToken.NUMBER_TYPE, n);
        },

        isSymbol:function (c) {
            return this._isOfType(jscsspToken.SYMBOL_TYPE, c);
        },

        isIdent:function (i) {
            return this._isOfType(jscsspToken.IDENT_TYPE, i);
        },

        isFunction:function (f) {
            return this._isOfType(jscsspToken.FUNCTION_TYPE, f);
        },

        isAtRule:function (a) {
            return this._isOfType(jscsspToken.ATRULE_TYPE, a);
        },

        isIncludes:function () {
            return this._isOfType(jscsspToken.INCLUDES_TYPE);
        },

        isDashmatch:function () {
            return this._isOfType(jscsspToken.DASHMATCH_TYPE);
        },

        isBeginsmatch:function () {
            return this._isOfType(jscsspToken.BEGINSMATCH_TYPE);
        },

        isEndsmatch:function () {
            return this._isOfType(jscsspToken.ENDSMATCH_TYPE);
        },

        isContainsmatch:function () {
            return this._isOfType(jscsspToken.CONTAINSMATCH_TYPE);
        },

        isSymbol:function (c) {
            return this._isOfType(jscsspToken.SYMBOL_TYPE, c);
        },

        isDimension:function () {
            return this._isOfType(jscsspToken.DIMENSION_TYPE);
        },

        isPercentage:function () {
            return this._isOfType(jscsspToken.PERCENTAGE_TYPE);
        },

        isHex:function () {
            return this._isOfType(jscsspToken.HEX_TYPE);
        },

        isDimensionOfUnit:function (aUnit) {
            return (this.isDimension() && this.unit == aUnit);
        },

        isLength:function () {
            return (this.isPercentage() || this.isDimensionOfUnit("cm") || this.isDimensionOfUnit("mm") || this.isDimensionOfUnit("in") || this.isDimensionOfUnit("pc") || this.isDimensionOfUnit("px") || this.isDimensionOfUnit("em") || this.isDimensionOfUnit("ex") || this.isDimensionOfUnit("pt"));
        },

        isAngle:function () {
            return (this.isDimensionOfUnit("deg") || this.isDimensionOfUnit("rad") || this.isDimensionOfUnit("grad"));
        }
    }

    var kJscsspUNKNOWN_RULE = 0;
    var kJscsspSTYLE_RULE = 1
    var kJscsspCHARSET_RULE = 2;
    var kJscsspIMPORT_RULE = 3;
    var kJscsspMEDIA_RULE = 4;
    var kJscsspFONT_FACE_RULE = 5;
    var kJscsspPAGE_RULE = 6;
    var kJscsspVARIABLES_RULE = 7;

    var kJscsspNAMESPACE_RULE = 100;
    var kJscsspCOMMENT = 101;
    var kJscsspWHITE_SPACE = 102;

    var kJscsspSTYLE_DECLARATION = 1000;

    var gTABS = "";

    function jscsspStylesheet() {
        this.cssRules = [];
        this.variables = {};
    }

    jscsspStylesheet.prototype = {
        insertRule:function (aRule, aIndex) {
            try {
                this.cssRules.splice(aIndex, 1, aRule);
            } catch (e) {
            }
        },

        deleteRule:function (aIndex) {
            try {
                this.cssRules.splice(aIndex);
            } catch (e) {
            }
        },

        cssText:function () {
            var rv = "";
            for (var i = 0; i < this.cssRules.length; i++) {
                rv += this.cssRules[i].cssText() + "\n";
            }
            return rv;
        },

        resolveVariables:function (aMedium) {

            function ItemFoundInArray(aArray, aItem) {
                for (var i = 0; i < aArray.length; i++) {
                    if (aItem == aArray[i]) {
                        return true;
                    }
                }
                return false;
            }

            for (var i = 0; i < this.cssRules.length; i++) {
                var rule = this.cssRules[i];
                if (rule.type == kJscsspSTYLE_RULE || rule.type == kJscsspIMPORT_RULE) {
                    break;
                } else if (rule.type == kJscsspVARIABLES_RULE && (!rule.media.length || ItemFoundInArray(rule.media, aMedium))) {

                    for (var j = 0; j < rule.declarations.length; j++) {
                        var valueText = "";
                        for (var k = 0; k < rule.declarations[j].values.length; k++) {
                            valueText += (k ? " " : "") + rule.declarations[j].values[k].value;
                        }
                        this.variables[rule.declarations[j].property] = valueText;
                    }
                }
            }
        }
    };

    /* kJscsspCHARSET_RULE */

    function jscsspCharsetRule() {
        this.type = kJscsspCHARSET_RULE;
        this.encoding = null;
        this.parsedCssText = null;
        this.parentStyleSheet = null;
        this.parentRule = null;
    }

    jscsspCharsetRule.prototype = {

        cssText:function () {
            return "@charset " + this.encoding + ";";
        },

        setCssText:function (val) {
            var sheet = {cssRules:[]};
            var parser = new CSSParser(val);
            var token = parser.getToken(false, false);
            if (token.isAtRule("@charset")) {
                if (parser.parseCharsetRule(token, sheet)) {
                    var newRule = sheet.cssRules[0];
                    this.encoding = newRule.encoding;
                    this.parsedCssText = newRule.parsedCssText;
                    return;
                }
            }
            throw DOMException.SYNTAX_ERR;
        }
    };

    /* kJscsspUNKNOWN_RULE */

    function jscsspErrorRule(aErrorMsg) {
        this.error = aErrorMsg ? aErrorMsg : "INVALID";
        this.type = kJscsspUNKNOWN_RULE;
        this.parsedCssText = null;
        this.parentStyleSheet = null;
        this.parentRule = null;
    }

    jscsspErrorRule.prototype = {
        cssText:function () {
            return this.parsedCssText;
        }
    };

    /* kJscsspCOMMENT */

    function jscsspComment() {
        this.type = kJscsspCOMMENT;
        this.parsedCssText = null;
        this.parentStyleSheet = null;
        this.parentRule = null;
    }

    jscsspComment.prototype = {
        cssText:function () {
            return this.parsedCssText;
        },

        setCssText:function (val) {
            var parser = new CSSParser(val);
            var token = parser.getToken(true, false);
            if (token.isComment()) {
                this.parsedCssText = token.value;
            } else {
                throw DOMException.SYNTAX_ERR;
            }
        }
    };

    /* kJscsspWHITE_SPACE */

    function jscsspWhitespace() {
        this.type = kJscsspWHITE_SPACE;
        this.parsedCssText = null;
        this.parentStyleSheet = null;
        this.parentRule = null;
    }

    jscsspWhitespace.prototype = {
        cssText:function () {
            return this.parsedCssText;
        }
    };

    /* kJscsspIMPORT_RULE */

    function jscsspImportRule() {
        this.type = kJscsspIMPORT_RULE;
        this.parsedCssText = null;
        this.href = null;
        this.media = [];
        this.parentStyleSheet = null;
        this.parentRule = null;
    }

    jscsspImportRule.prototype = {
        cssText:function () {
            var mediaString = this.media.join(", ");
            return "@import " + this.href + ((mediaString && mediaString != "all") ? mediaString + " " : "") + ";";
        },

        setCssText:function (val) {
            var sheet = {cssRules:[]};
            var parser = new CSSParser(val);
            var token = parser.getToken(true, true);
            if (token.isAtRule("@import")) {
                if (parser.parseImportRule(token, sheet)) {
                    var newRule = sheet.cssRules[0];
                    this.href = newRule.href;
                    this.media = newRule.media;
                    this.parsedCssText = newRule.parsedCssText;
                    return;
                }
            }
            throw DOMException.SYNTAX_ERR;
        }
    };

    /* kJscsspNAMESPACE_RULE */

    function jscsspNamespaceRule() {
        this.type = kJscsspNAMESPACE_RULE;
        this.parsedCssText = null;
        this.prefix = null;
        this.url = null;
        this.parentStyleSheet = null;
        this.parentRule = null;
    }

    jscsspNamespaceRule.prototype = {
        cssText:function () {
            return "@namespace " + (this.prefix ? this.prefix + " " : "") + this.url + ";";
        },

        setCssText:function (val) {
            var sheet = {cssRules:[]};
            var parser = new CSSParser(val);
            var token = parser.getToken(true, true);
            if (token.isAtRule("@namespace")) {
                if (parser.parseNamespaceRule(token, sheet)) {
                    var newRule = sheet.cssRules[0];
                    this.url = newRule.url;
                    this.prefix = newRule.prefix;
                    this.parsedCssText = newRule.parsedCssText;
                    return;
                }
            }
            throw DOMException.SYNTAX_ERR;
        }
    };

    /* kJscsspSTYLE_DECLARATION */

    function jscsspDeclaration() {
        this.type = kJscsspSTYLE_DECLARATION;
        this.property = null;
        this.values = [];
        this.valueText = null;
        this.priority = null;
        this.parsedCssText = null;
        this.parentStyleSheet = null;
        this.parentRule = null;
    }

    jscsspDeclaration.prototype = {
        kCOMMA_SEPARATED:{
            "cursor":true,
            "font-family":true,
            "voice-family":true,
            "background-image":true
        },

        kUNMODIFIED_COMMA_SEPARATED_PROPERTIES:{
            "text-shadow":true,
            "box-shadow":true,
            "-moz-transition":true,
            "-moz-transition-property":true,
            "-moz-transition-duration":true,
            "-moz-transition-timing-function":true,
            "-moz-transition-delay":true
        },

        cssText:function () {
            var prefixes = CssInspector.prefixesForProperty(this.property);

            if (this.property in this.kUNMODIFIED_COMMA_SEPARATED_PROPERTIES) {
                if (prefixes) {
                    var rv = "";
                    for (var propertyIndex = 0; propertyIndex < prefixes.length; propertyIndex++) {
                        var property = prefixes[propertyIndex];
                        rv += (propertyIndex ? gTABS : "") + property + ": ";
                        rv += this.valueText + (this.priority ? " !important" : "") + ";";
                        rv += ((prefixes.length > 1 && propertyIndex != prefixes.length - 1) ? "\n" : "");
                    }
                    return rv;
                }
                return this.property + ": " + this.valueText + (this.priority ? " !important" : "") + ";"
            }

            if (prefixes) {
                var rv = "";
                for (var propertyIndex = 0; propertyIndex < prefixes.length; propertyIndex++) {
                    var property = prefixes[propertyIndex];
                    rv += (propertyIndex ? gTABS : "") + property + ": ";
                    var separator = (property in this.kCOMMA_SEPARATED) ? ", " : " ";
                    for (var i = 0; i < this.values.length; i++) {
                        if (this.values[i].cssText() != null) {
                            rv += (i ? separator : "") + this.values[i].cssText();
                        } else {
                            return null;
                        }
                    }
                    rv += (this.priority ? " !important" : "") + ";" + ((prefixes.length > 1 && propertyIndex != prefixes.length - 1) ? "\n" : "");
                }
                return rv;
            }

            var rv = this.property + ": ";
            var separator = (this.property in this.kCOMMA_SEPARATED) ? ", " : " ";
            var extras = {"webkit":false, "presto":false, "trident":false, "generic":false }
            for (var i = 0; i < this.values.length; i++) {
                var v = this.values[i].cssText();
                if (v != null) {
                    var paren = v.indexOf("(");
                    var kwd = v;
                    if (paren != -1) {
                        kwd = v.substr(0, paren);
                    }
                    if (kwd in kCSS_VENDOR_VALUES) {
                        for (var j in kCSS_VENDOR_VALUES[kwd]) {
                            extras[j] = extras[j] || (kCSS_VENDOR_VALUES[kwd][j] != "");
                        }
                    }
                    rv += (i ? separator : "") + v;
                } else {
                    return null;
                }
            }
            rv += (this.priority ? " !important" : "") + ";";

            for (var j in extras) {
                if (extras[j]) {
                    var str = "\n" + gTABS + this.property + ": ";
                    for (var i = 0; i < this.values.length; i++) {
                        var v = this.values[i].cssText();
                        if (v != null) {
                            var paren = v.indexOf("(");
                            var kwd = v;
                            if (paren != -1) {
                                kwd = v.substr(0, paren);
                            }
                            if (kwd in kCSS_VENDOR_VALUES) {
                                functor = kCSS_VENDOR_VALUES[kwd][j];
                                if (functor) {
                                    v = (typeof functor == "string") ? functor : functor(v, j);
                                    if (!v) {
                                        str = null;
                                        break;
                                    }
                                }
                            }
                            str += (i ? separator : "") + v;
                        } else {
                            return null;
                        }
                    }
                    if (str) {
                        rv += str + ";"
                    } else {
                        rv += "\n" + gTABS + "/* Impossible to translate property " + this.property + " for " + j + " */";
                    }
                }
            }
            return rv;
        },

        setCssText:function (val) {
            var declarations = [];
            var parser = new CSSParser(val);
            var token = parser.getToken(true, true);
            if (parser.parseDeclaration(token, declarations, true, true, null) && declarations.length && declarations[0].type == kJscsspSTYLE_DECLARATION) {
                var newDecl = declarations.cssRules[0];
                this.property = newDecl.property;
                this.value = newDecl.value;
                this.priority = newDecl.priority;
                this.parsedCssText = newRule.parsedCssText;
                return;
            }
            throw DOMException.SYNTAX_ERR;
        }
    };

    /* kJscsspFONT_FACE_RULE */

    function jscsspFontFaceRule() {
        this.type = kJscsspFONT_FACE_RULE;
        this.parsedCssText = null;
        this.descriptors = [];
        this.parentStyleSheet = null;
        this.parentRule = null;
    }

    jscsspFontFaceRule.prototype = {
        cssText:function () {
            var rv = gTABS + "@font-face {\n";
            var preservedGTABS = gTABS;
            gTABS += "  ";
            for (var i = 0; i < this.descriptors.length; i++) {
                rv += gTABS + this.descriptors[i].cssText() + "\n";
            }
            gTABS = preservedGTABS;
            return rv + gTABS + "}";
        },

        setCssText:function (val) {
            var sheet = {cssRules:[]};
            var parser = new CSSParser(val);
            var token = parser.getToken(true, true);
            if (token.isAtRule("@font-face")) {
                if (parser.parseFontFaceRule(token, sheet)) {
                    var newRule = sheet.cssRules[0];
                    this.descriptors = newRule.descriptors;
                    this.parsedCssText = newRule.parsedCssText;
                    return;
                }
            }
            throw DOMException.SYNTAX_ERR;
        }
    };

    /* kJscsspMEDIA_RULE */

    function jscsspMediaRule() {
        this.type = kJscsspMEDIA_RULE;
        this.parsedCssText = null;
        this.cssRules = [];
        this.media = [];
        this.parentStyleSheet = null;
        this.parentRule = null;
    }

    jscsspMediaRule.prototype = {
        cssText:function () {
            var rv = gTABS + "@media " + this.media.join(", ") + " {\n";
            var preservedGTABS = gTABS;
            gTABS += "  ";
            for (var i = 0; i < this.cssRules.length; i++) {
                rv += gTABS + this.cssRules[i].cssText() + "\n";
            }
            gTABS = preservedGTABS;
            return rv + gTABS + "}";
        },

        setCssText:function (val) {
            var sheet = {cssRules:[]};
            var parser = new CSSParser(val);
            var token = parser.getToken(true, true);
            if (token.isAtRule("@media")) {
                if (parser.parseMediaRule(token, sheet)) {
                    var newRule = sheet.cssRules[0];
                    this.cssRules = newRule.cssRules;
                    this.media = newRule.media;
                    this.parsedCssText = newRule.parsedCssText;
                    return;
                }
            }
            throw DOMException.SYNTAX_ERR;
        }
    };

    /* kJscsspSTYLE_RULE */

    function jscsspStyleRule() {
        this.type = kJscsspSTYLE_RULE;
        this.parsedCssText = null;
        this.declarations = []
        this.mSelectorText = null;
        this.parentStyleSheet = null;
        this.parentRule = null;
    }

    jscsspStyleRule.prototype = {
        cssText:function () {
            var rv = this.mSelectorText + " {\n";
            var preservedGTABS = gTABS;
            gTABS += "  ";
            for (var i = 0; i < this.declarations.length; i++) {
                var declText = this.declarations[i].cssText();
                if (declText) {
                    rv += gTABS + this.declarations[i].cssText() + "\n";
                }
            }
            gTABS = preservedGTABS;
            return rv + gTABS + "}";
        },

        setCssText:function (val) {
            var sheet = {cssRules:[]};
            var parser = new CSSParser(val);
            var token = parser.getToken(true, true);
            if (!token.isNotNull()) {
                if (parser.parseStyleRule(token, sheet, false)) {
                    var newRule = sheet.cssRules[0];
                    this.mSelectorText = newRule.mSelectorText;
                    this.declarations = newRule.declarations;
                    this.parsedCssText = newRule.parsedCssText;
                    return;
                }
            }
            throw DOMException.SYNTAX_ERR;
        },

        selectorText:function () {
            return this.mSelectorText;
        },

        setSelectorText:function (val) {
            var parser = new CSSParser(val);
            var token = parser.getToken(true, true);
            if (!token.isNotNull()) {
                var s = parser.parseSelector(token, true);
                if (s) {
                    this.mSelectorText = s.selector;
                    return;
                }
            }
            throw DOMException.SYNTAX_ERR;
        }
    };

    /* kJscsspPAGE_RULE */

    function jscsspPageRule() {
        this.type = kJscsspPAGE_RULE;
        this.parsedCssText = null;
        this.pageSelector = null;
        this.declarations = [];
        this.parentStyleSheet = null;
        this.parentRule = null;
    }

    jscsspPageRule.prototype = {
        cssText:function () {
            var rv = gTABS + "@page " + (this.pageSelector ? this.pageSelector + " " : "") + "{\n";
            var preservedGTABS = gTABS;
            gTABS += "  ";
            for (var i = 0; i < this.declarations.length; i++) {
                rv += gTABS + this.declarations[i].cssText() + "\n";
            }
            gTABS = preservedGTABS;
            return rv + gTABS + "}";
        },

        setCssText:function (val) {
            var sheet = {cssRules:[]};
            var parser = new CSSParser(val);
            var token = parser.getToken(true, true);
            if (token.isAtRule("@page")) {
                if (parser.parsePageRule(token, sheet)) {
                    var newRule = sheet.cssRules[0];
                    this.pageSelector = newRule.pageSelector;
                    this.declarations = newRule.declarations;
                    this.parsedCssText = newRule.parsedCssText;
                    return;
                }
            }
            throw DOMException.SYNTAX_ERR;
        }
    };

    /* kJscsspVARIABLES_RULE */

    function jscsspVariablesRule() {
        this.type = kJscsspVARIABLES_RULE;
        this.parsedCssText = null;
        this.declarations = [];
        this.parentStyleSheet = null;
        this.parentRule = null;
        this.media = null;
    }

    jscsspVariablesRule.prototype = {
        cssText:function () {
            var rv = gTABS + "@variables " + (this.media.length ? this.media.join(", ") + " " : "") + "{\n";
            var preservedGTABS = gTABS;
            gTABS += "  ";
            for (var i = 0; i < this.declarations.length; i++) {
                rv += gTABS + this.declarations[i].cssText() + "\n";
            }
            gTABS = preservedGTABS;
            return rv + gTABS + "}";
        },

        setCssText:function (val) {
            var sheet = {cssRules:[]};
            var parser = new CSSParser(val);
            var token = parser.getToken(true, true);
            if (token.isAtRule("@variables")) {
                if (parser.parseVariablesRule(token, sheet)) {
                    var newRule = sheet.cssRules[0];
                    this.declarations = newRule.declarations;
                    this.parsedCssText = newRule.parsedCssText;
                    return;
                }
            }
            throw DOMException.SYNTAX_ERR;
        }
    };

    var kJscsspINHERIT_VALUE = 0;
    var kJscsspPRIMITIVE_VALUE = 1;
    var kJscsspVARIABLE_VALUE = 4;

    function jscsspVariable(aType, aSheet) {
        this.value = "";
        this.type = aType;
        this.name = null;
        this.parentRule = null;
        this.parentStyleSheet = aSheet;
    }

    jscsspVariable.prototype = {
        cssText:function () {
            if (this.type == kJscsspVARIABLE_VALUE) {
                return this.resolveVariable(this.name, this.parentRule, this.parentStyleSheet);
            } else {
                return this.value;
            }
        },

        setCssText:function (val) {
            if (this.type == kJscsspVARIABLE_VALUE) {
                throw DOMException.SYNTAX_ERR;
            } else {
                this.value = val;
            }
        },

        resolveVariable:function (aName, aRule, aSheet) {
            if (aName.toLowerCase() in aSheet.variables) {
                return aSheet.variables[aName.toLowerCase()];
            }
            return null;
        }
    };

    function ParseURL(buffer) {
        var result = { };
        result.protocol = "";
        result.user = "";
        result.password = "";
        result.host = "";
        result.port = "";
        result.path = "";
        result.query = "";

        var section = "PROTOCOL";
        var start = 0;
        var wasSlash = false;

        while (start < buffer.length) {
            if (section == "PROTOCOL") {
                if (buffer.charAt(start) == ':') {
                    section = "AFTER_PROTOCOL";
                    start++;
                } else if (buffer.charAt(start) == '/' && result.protocol.length() == 0) {
                    section = PATH;
                } else {
                    result.protocol += buffer.charAt(start++);
                }
            } else if (section == "AFTER_PROTOCOL") {
                if (buffer.charAt(start) == '/') {
                    if (!wasSlash) {
                        wasSlash = true;
                    } else {
                        wasSlash = false;
                        section = "USER";
                    }
                    start++;
                } else {
                    throw new ParseException("Protocol shell be separated with 2 slashes");
                }
            } else if (section == "USER") {
                if (buffer.charAt(start) == '/') {
                    result.host = result.user;
                    result.user = "";
                    section = "PATH";
                } else if (buffer.charAt(start) == '?') {
                    result.host = result.user;
                    result.user = "";
                    section = "QUERY";
                    start++;
                } else if (buffer.charAt(start) == ':') {
                    section = "PASSWORD";
                    start++;
                } else if (buffer.charAt(start) == '@') {
                    section = "HOST";
                    start++;
                } else {
                    result.user += buffer.charAt(start++);
                }
            } else if (section == "PASSWORD") {
                if (buffer.charAt(start) == '/') {
                    result.host = result.user;
                    result.port = result.password;
                    result.user = "";
                    result.password = "";
                    section = "PATH";
                } else if (buffer.charAt(start) == '?') {
                    result.host = result.user;
                    result.port = result.password;
                    result.user = "";
                    result.password = "";
                    section = "QUERY";
                    start++;
                } else if (buffer.charAt(start) == '@') {
                    section = "HOST";
                    start++;
                } else {
                    result.password += buffer.charAt(start++);
                }
            } else if (section == "HOST") {
                if (buffer.charAt(start) == '/') {
                    section = "PATH";
                } else if (buffer.charAt(start) == ':') {
                    section = "PORT";
                    start++;
                } else if (buffer.charAt(start) == '?') {
                    section = "QUERY";
                    start++;
                } else {
                    result.host += buffer.charAt(start++);
                }
            } else if (section == "PORT") {
                if (buffer.charAt(start) = '/') {
                    section = "PATH";
                } else if (buffer.charAt(start) == '?') {
                    section = "QUERY";
                    start++;
                } else {
                    result.port += buffer.charAt(start++);
                }
            } else if (section == "PATH") {
                if (buffer.charAt(start) == '?') {
                    section = "QUERY";
                    start++;
                } else {
                    result.path += buffer.charAt(start++);
                }
            } else if (section == "QUERY") {
                result.query += buffer.charAt(start++);
            }
        }

        if (section == "PROTOCOL") {
            result.host = result.protocol;
            result.protocol = "http";
        } else if (section == "AFTER_PROTOCOL") {
            throw new ParseException("Invalid url");
        } else if (section == "USER") {
            result.host = result.user;
            result.user = "";
        } else if (section == "PASSWORD") {
            result.host = result.user;
            result.port = result.password;
            result.user = "";
            result.password = "";
        }

        return result;
    }

    function ParseException(description) {
        this.description = description;
    }

    function CountLF(s) {
        var nCR = s.match(/\n/g);
        return nCR ? nCR.length + 1 : 1;
    }

    function FilterLinearGradientForOutput(aValue, aEngine) {
        if (aEngine == "generic") {
            return aValue.substr(5);
        }

        if (aEngine == "webkit") {
            return aValue.replace(/\-moz\-/g, "-webkit-")
        }

        if (aEngine != "webkit20110101") {
            return "";
        }

        var g = CssInspector.parseBackgroundImages(aValue)[0];

        var cancelled = false;
        var str = "-webkit-gradient(linear, ";
        var position = ("position" in g.value) ? g.value.position.toLowerCase() : "";
        var angle = ("angle" in g.value) ? g.value.angle.toLowerCase() : "";
        // normalize angle
        if (angle) {
            var match = angle.match(/^([0-9\-\.\\+]+)([a-z]*)/);
            var angle = parseFloat(match[1]);
            var unit = match[2];
            switch (unit) {
                case "grad":
                    angle = angle * 90 / 100;
                    break;
                case "rad":
                    angle = angle * 180 / Math.PI;
                    break;
                default:
                    break;
            }
            while (angle < 0) {
                angle += 360;
            }
            while (angle >= 360) {
                angle -= 360;
            }
        }
        // get startpoint w/o keywords
        var startpoint = [];
        var endpoint = [];
        if (position != "") {
            if (position == "center") {
                position = "center center";
            }
            startpoint = position.split(" ");
            if (angle == "" && angle != 0) {
                // no angle, then we just turn the point 180 degrees around center
                switch (startpoint[0]) {
                    case "left":
                        endpoint.push("right");
                        break;
                    case "center":
                        endpoint.push("center");
                        break;
                    case "right":
                        endpoint.push("left");
                        break;
                    default:
                    {
                        var match = startpoint[0].match(/^([0-9\-\.\\+]+)([a-z]*)/);
                        var v = parseFloat(match[0]);
                        var unit = match[1];
                        if (unit == "%") {
                            endpoint.push((100 - v) + "%");
                        } else {
                            cancelled = true;
                        }
                    }
                        break;
                }
                if (!cancelled) {
                    switch (startpoint[1]) {
                        case "top":
                            endpoint.push("bottom");
                            break;
                        case "center":
                            endpoint.push("center");
                            break;
                        case "bottom":
                            endpoint.push("top");
                            break;
                        default:
                        {
                            var match = startpoint[1].match(/^([0-9\-\.\\+]+)([a-z]*)/);
                            var v = parseFloat(match[0]);
                            var unit = match[1];
                            if (unit == "%") {
                                endpoint.push((100 - v) + "%");
                            } else {
                                cancelled = true;
                            }
                        }
                            break;
                    }
                }
            } else {
                switch (angle) {
                    case 0:
                        endpoint.push("right");
                        endpoint.push(startpoint[1]);
                        break;
                    case 90:
                        endpoint.push(startpoint[0]);
                        endpoint.push("top");
                        break;
                    case 180:
                        endpoint.push("left");
                        endpoint.push(startpoint[1]);
                        break;
                    case 270:
                        endpoint.push(startpoint[0]);
                        endpoint.push("bottom");
                        break;
                    default:
                        cancelled = true;
                        break;
                }
            }
        } else {
            // no position defined, we accept only vertical and horizontal
            if (angle == "") {
                angle = 270;
            }
            switch (angle) {
                case 0:
                    startpoint = ["left", "center"];
                    endpoint = ["right", "center"];
                    break;
                case 90:
                    startpoint = ["center", "bottom"];
                    endpoint = ["center", "top"];
                    break;
                case 180:
                    startpoint = ["right", "center"];
                    endpoint = ["left", "center"];
                    break;
                case 270:
                    startpoint = ["center", "top"];
                    endpoint = ["center", "bottom"];
                    break;
                default:
                    cancelled = true;
                    break;
            }
        }

        if (cancelled) {
            return "";
        }

        str += startpoint.join(" ") + ", " + endpoint.join(" ");
        if (!g.value.stops[0].position) {
            g.value.stops[0].position = "0%";
        }
        if (!g.value.stops[g.value.stops.length - 1].position) {
            g.value.stops[g.value.stops.length - 1].position = "100%";
        }
        var current = 0;
        for (var i = 0; i < g.value.stops.length && !cancelled; i++) {
            var s = g.value.stops[i];
            if (s.position) {
                if (s.position.indexOf("%") == -1) {
                    cancelled = true;
                    break;
                }
            } else {
                var j = i + 1;
                while (j < g.value.stops.length && !g.value.stops[j].position) {
                    j++;
                }
                var inc = parseFloat(g.value.stops[j].position) - current;
                for (var k = i; k < j; k++) {
                    g.value.stops[k].position = (current + inc * (k - i + 1) / (j - i + 1)) + "%";
                }
            }
            current = parseFloat(s.position);
            str += ", color-stop(" + (parseFloat(current) / 100) + ", " + s.color + ")";
        }

        if (cancelled) {
            return "";
        }
        return str + ")";
    }

    function FilterRadialGradientForOutput(aValue, aEngine) {
        if (aEngine == "generic") {
            return aValue.substr(5);
        }

        else if (aEngine == "webkit") {
            return aValue.replace(/\-moz\-/g, "-webkit-")
        }

        else if (aEngine != "webkit20110101") {
            return "";
        }

        var g = CssInspector.parseBackgroundImages(aValue)[0];

        var shape = ("shape" in g.value) ? g.value.shape : "";
        var size = ("size"  in g.value) ? g.value.size : "";
        if (shape != "circle" || (size != "farthest-corner" && size != "cover")) {
            return "";
        }

        if (g.value.stops.length < 2 || !("position" in g.value.stops[0]) || !g.value.stops[g.value.stops.length - 1].position || !("position" in g.value.stops[0]) || !g.value.stops[g.value.stops.length - 1].position) {
            return "";
        }

        for (var i = 0; i < g.value.stops.length; i++) {
            var s = g.value.stops[i];
            if (("position" in s) && s.position && s.position.indexOf("px") == -1) {
                return "";
            }
        }

        var str = "-webkit-gradient(radial, ";
        var position = ("position"  in g.value) ? g.value.position : "center center";
        str += position + ", " + parseFloat(g.value.stops[0].position) + ", ";
        str += position + ", " + parseFloat(g.value.stops[g.value.stops.length - 1].position);

        // at this point we're sure to deal with pixels
        var current = parseFloat(g.value.stops[0].position);
        for (var i = 0; i < g.value.stops.length; i++) {
            var s = g.value.stops[i];
            if (!("position" in s) || !s.position) {
                var j = i + 1;
                while (j < g.value.stops.length && !g.value.stops[j].position) {
                    j++;
                }
                var inc = parseFloat(g.value.stops[j].position) - current;
                for (var k = i; k < j; k++) {
                    g.value.stops[k].position = (current + inc * (k - i + 1) / (j - i + 1)) + "px";
                }
            }
            current = parseFloat(s.position);
            var c = (current - parseFloat(g.value.stops[0].position)) / (parseFloat(g.value.stops[g.value.stops.length - 1].position) - parseFloat(g.value.stops[0].position));
            str += ", color-stop(" + c + ", " + s.color + ")";
        }
        str += ")"
        return str;
    }

    function FilterRepeatingGradientForOutput(aValue, aEngine) {
        if (aEngine == "generic") {
            return aValue.substr(5);
        }

        else if (aEngine == "webkit") {
            return aValue.replace(/\-moz\-/g, "-webkit-")
        }

        return "";
    }

    /**#nocode-*/

    /**
     * Creates a style declaration
     *
     * @param {string} property property name
     * @param {string} valueText property value
     *
     * @class CSS Property declaration
     * @name StyleDeclaration
     */
    function StyleDeclaration(property, valueText) {
        this.property = property;
        this.valueText = valueText;
    }

    StyleDeclaration.prototype = {
        /**
         * Property name
         * @type string
         */
        property:"",
        /**
         * Property value
         * @type string
         */
        valueText:"",
    };

    var cssParser, logger, CssParserInstance;

    logger = wef.logger("wef.cssParser");

    /**
     * Creates a CSS parser
     *
     * @class CSS parser
     */
    cssParser = function () {
        return new cssParser.prototype.init();
    };

    cssParser.prototype = {
        /**
         * Version number*/
        version:"0.2.0",
        /**
         * Stores callback functions. Looks like register events
         */
        callbacks:{
            /**
             * todo
             */
            parserStar:undefined,
            parserStop:undefined,
            cssRuleFound:undefined,
            propertyFound:undefined,
            error:undefined
        },
        constructor:cssParser,
        /**
         * @ignore
         */
        init:function () {
            this.callbacks = {
                parserStar:undefined,
                parserStop:undefined,
                cssRuleFound:undefined,
                propertyFound:undefined,
                error:undefined
            };
            return this;
        }
    };

    /**
     * Extension point
     */
    cssParser.fn = cssParser.prototype;

    cssParser.prototype.init.prototype = cssParser.prototype;

    wef.extend(cssParser.prototype.init.prototype,
        /**
         * @lends cssParser#
         */
               {
                   /**
                    * Reference to jscssp parser
                    */
                   backend:undefined,

                   /**
                    * Calls parserStar callback
                    * @param {Function}callback "Parser starts" callback
                    */
                   whenStart:function (callback) {
                       if (wef.isFunction(callback)) {
                           logger.debug("set parserStart callback");
                           this.callbacks.parserStar = callback;
                       }
                       return this;
                   },
                   /**
                    * Calls parserStop callback
                    * @param {Function}callback "Parser stops" callback
                    */
                   whenStop:function (callback) {
                       if (wef.isFunction(callback)) {
                           logger.debug("set parserStop callback");
                           this.callbacks.parserStop = callback;
                       }
                       return this;
                   },
                   /**
                    * Calls cssRuleFound callback
                    * @param {Function}callback "Css rule found" callback
                    */
                   whenCssRule:function (callback) {
                       if (wef.isFunction(callback)) {
                           logger.debug("set CssRuleFound callback");
                           this.callbacks.cssRuleFound = callback;
                       }
                       return this;
                   },
                   /**
                    * Calls propertyFound callback
                    * @param {Function}callback "Property found" callback
                    */
                   whenProperty:function (callback) {
                       if (wef.isFunction(callback)) {
                           logger.debug("set propertyFound callback");
                           this.callbacks.propertyFound = callback;
                       }
                       return this;
                   },
                   /**
                    * Calls error callback
                    * @param {Function}callback "Error" callback
                    */
                   whenError:function (callback) {
                       if (wef.isFunction(callback)) {
                           logger.debug("set error callback");
                           this.callbacks.error = callback;
                       }
                       return this;
                   },
                   /**
                    * Parses given text calling callbacks when registered actions happens
                    * @param {string}data CSS code
                    */
                   parse:function (data) {
                       var sheet, property, context = this;
                       try {
                           if (!data || !wef.isString(data) || data === "") {
                               var message = "InvalidArgumentException - data must be a non empty string";
                               logger.error(message);
                               throw new Error(message);
                           }
                           if (context.callbacks.parserStar) {
                               logger.debug("call parserStart callback");
                               context.callbacks.parserStar.call(context,
                                   /**
                                    * @namespace Parser start data format
                                    * @name StartCallbackData
                                    */
                                   /**
                                    * @lends StartCallbackData#
                                    */
                                                                 {
                                                                     /**
                                                                      * Start time in millisecons
                                                                      * @type Number
                                                                      */
                                                                     time:new Date().getTime()});
                           }
                           sheet = new CSSParser().parse(data, false, false);
                           //start
                           sheet.cssRules.forEach(function (cssRule) {
                               logger.debug("cssRule:", cssRule);
                               if (context.callbacks.cssRuleFound) {
                                   logger.debug("call cssRuleFound callback");
                                   context.callbacks.cssRuleFound.call(context, cssRule);
                               }
                               //ErrorRule
                               if (cssRule.type === 0) {
                                   var message = "ParserException - Error in line " + cssRule.currentLine + ": " + cssRule.parsedCssText;
                                   logger.error(message);
                                   throw new Error(message);
                               }
                               cssRule.declarations.forEach(function (declaration) {
                                   /**
                                    * @namespace CSS property found data format
                                    * @name CSSParserProperty
                                    */
                                   property =
                                   /**
                                    * @lends CSSParserProperty#
                                    */
                                   {
                                       /**
                                        * Property selector
                                        * @type string
                                        */
                                       selectorText:cssRule.selectorText(),
                                       /**
                                        * Property declaration
                                        * @type StyleDeclaration
                                        */
                                       declaration:new StyleDeclaration(declaration.property, declaration.valueText)
                                   };
                                   logger.debug("property:", property);
                                   if (context.callbacks.propertyFound) {
                                       logger.debug("call propertyFound callback");
                                       context.callbacks.propertyFound.call(context, property);
                                   }
                               });
                           });
                           //done
                           if (context.callbacks.parserStop) {
                               logger.debug("call parserStop callback");
                               context.callbacks.parserStop.call(context,
                                   /**
                                    * @namespace Parser stop data format
                                    * @name StopCallbackData
                                    */
                                   /**
                                    * @lends StopCallbackData#
                                    */
                                                                 {
                                                                     /**
                                                                      * Stop time in millisecons
                                                                      * @type Number
                                                                      */
                                                                     time:new Date().getTime()});
                           }
                       } catch (e) {
                           if (context.callbacks.error) {
                               logger.error("call error callback:", e);
                               context.callbacks.error.call(context, e.message);
                               return this;
                           } else {
                               logger.error("unhandled error call wef.error:", e);
                               wef.error(e.message);
                               return null;
                           }
                       }
                       return this;
                   }
               });

    wef.cssParser = cssParser;

    logger.info("cssParser plugged to wef.cssParser");

})(window.wef);/*!
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
})(window);/*!
 * templateLayout.compiler
 * Copyright (c) 2011 Pablo Escalada
 * MIT Licensed
 */
(function (templateLayout) {
    var compiler, log, rootTemplate;
    log = wef.logger("templateLayout.compiler");
    log.info("load compiler module");

    function parseDisplay(displayValue) {
        /*
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
        /**
         * @namespace Preprocessed template display info
         * @name DisplayMetadata
         */
        var displayMetadata =
        /**
         * @lends DisplayMetadata#
         */
        {
            /**
             * Display type. Currently unused
             * @type string
             */
            displayType:undefined,
            /**
             * Array of rows. strings are cleaned
             * @type string[]
             */
            grid:[],
            /**
             * Array of columnns widths
             * @type string[]
             */
            widths:[]
        },
            allRefExp = /\s*(none|inline)?\s*(:?(\"[A-Za-z0-9\.@ ]+\")\s*(:?\/ ?(\*|\d+(:?px|%)))?)\s*((:?(:?(:?\d+(:?px|%))|\*)\s*)*)/gi,
            found,
            displayTypeFound,
            gridNotFound,
            completed;
        //all without displayType   (:?(\"[A-Za-z0-9\.@ ]+\")\s*(:?\/(\*|\d+(:?em|px|%)))?\s*)((:?(:?(:?\d+(:?em|px|%))|\*) *)*)
        // /\s*(inline|block|list-item|inline-block|table|inline-table|table-row-group|table-header-group|table-footer-group|table-row|table-column-group|table-column|table-cell|table-caption|none)?\s*(:?(\"[A-Za-z0-9\.@ ]+\")\s*(:?\/(\*|\d+(:?em|px|%)))?\s*)((:?(:?(:?\d+(:?em|px|%))|\*) *)*)/g
        if (displayValue !== undefined) {
            while ((found = allRefExp.exec(displayValue)) !== null) {
                if (completed) {
                    log.error("Invalid template, invalid width definition");
                    throw new Error("Invalid template, width  definition");
                }
                if (found[1]) {
                    if (displayTypeFound) {
                        log.error("Invalid template, multiple display type");
                        throw new Error("Invalid template, multiple display type");
                    }
                    displayMetadata.displayType = found[1];
                    displayTypeFound = true;
                }
                if (found[3]) {
                    if (gridNotFound) {
                        log.error("Invalid template, invalid grid definition");
                        throw new Error("Invalid template, invalid grid definition");
                    }
                    displayMetadata.grid.push({rowText:found[3].replace(/"/g, "").replace(/\s*/, ""), height:undefined});
                } else {
                    gridNotFound = true;
                }
                if (found[5]) {
                    if (!displayMetadata.grid[displayMetadata.grid.length - 1]) {
                        log.error("Invalid template, invalid height definition");
                        throw new Error("Invalid template, height definition");
                    }
                    displayMetadata.grid[displayMetadata.grid.length - 1].height = found[5];
                }
                if (found[7]) {
                    displayMetadata.widths = found[7].split(/\s+/);
                    completed = true;
                }
            }
        }
        log.info("display result: ", displayMetadata);
        return displayMetadata;
    }

    /**
     * @namespace Top level template. Used as "fake page template"
     */
    rootTemplate = function () {

        var that =
        /**
         * @lends rootTemplate#
         */
        {
            /**
             * Inserts given template into TOM.
             * If template "isRoot", inserts here, else looks inside TOM and
             * inserts in place.
             *
             * @param {Template}aTemplate the template
             */
            insert:function (aTemplate) {
                log.info("add template ", aTemplate.selectorText);
                if (aTemplate.isRoot()) {
                    log.debug("insert as root", aTemplate);
                    that.rows.push(aTemplate);
                    return true;
                } else {
                    log.debug("search position :", aTemplate.position.position);
                    return that.rows.some(function (element) {
                        return element.insert(aTemplate);
                    });
                }
            },
            /**
             * Templates stored into the root template
             * @type gridRow[]
             */
            rows:[]
        };

        return that;
    }();

    function parsePosition(positionValue) {
        var positionMetadata, matched, positionRegExp;
        /*
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
        /**
         * @namespace Preprocessed template position info
         * @name PositionMetadata
         */
        positionMetadata =
        /**
         * @lends PositionMetadata#
         */
        {
            /**
             * Position string
             * @type string
             */
            position:null
        };
        positionRegExp = /^\s*(same|[a-zA-Z0-9])\s*$/i;
        if (positionValue !== undefined) {
            matched = positionValue.match(positionRegExp);
            if (matched === null) {
                log.info("Unexpected value at ", positionValue);
                //throw new Error("Unexpected value at ", positionValue);
                return positionMetadata;
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
        preProcessTemplate.display = parseDisplay(rule.declaration[templateLayout.fn.constants.DISPLAY]);
        preProcessTemplate.position = parsePosition(rule.declaration[templateLayout.fn.constants.POSITION]);
        log.info("properties result: ", preProcessTemplate);
        return preProcessTemplate;
    }

    /**
     * Creates a compiler
     *
     * @class CSS template compiler
     */
    compiler = function () {
        return new compiler.prototype.init();
    };

    /**
     * Extension point.
     * Elements added to compiler.fn extend compiler functionality
     */
    compiler.fn = compiler.prototype;

    compiler.prototype = {
        constructor:compiler,
        /**
         * @ignore
         */
        init:function () {
            return this;
        },
        /**
         * Compiles given parser data</p>
         *
         * @param {ParserBufferEntry[]}buffer parser generated data
         * @returns {rootTemplate} Template Object Model
         */
        compile:function (buffer) {
            var selectorText, preProcessTemplate, inserted, template;
            log.info("compile...");
            log.debug("buffer: ", buffer);

            for (selectorText in buffer) {
                if (buffer.hasOwnProperty(selectorText)) {
                    log.debug("next buffer element: ", selectorText);
                    log.group();
                    preProcessTemplate = parseProperties(buffer[selectorText]);
                    if (this.isEmptyDisplay(preProcessTemplate.display) && this.isEmptyPosition(preProcessTemplate.position)) {
                        log.groupEnd();
                        log.info("preProcess: empty template", preProcessTemplate);
                    } else {
                        log.debug("preProcess:", preProcessTemplate);
                        template = compiler.fn.templateBuilder(preProcessTemplate).createTemplate();
                        inserted = rootTemplate.insert(template);
                        log.groupEnd();
                        log.info("element insertion...", inserted ? "[OK]" : "ERROR!");
                    }
                }
            }
            log.debug("compile... OK");
            return rootTemplate;
        },
        /**
         * Checks if display is empty
         * @param {DisplayMetadata}display compiled display
         * @returns {boolean}true if display.grid.length === 0
         */
        isEmptyDisplay:function (display) {
            return display.grid.length === 0;
        },
        /**
         * Checks is position is empty
         * @param {PositionMetadata}position compiled position
         * @returns {boolean}true if position.position === null
         */
        isEmptyPosition:function (position) {
            return position.position === null;
        }
    };

    compiler.prototype.init.prototype = compiler.prototype;

    templateLayout.fn.compiler = compiler;

    (function (global) {
        var gridSlot;
        log.info("load gridSlot module...");

        /**
         * Creates a slot.
         *
         * @param {string}slotText slot identifier
         * @param {integer}rowIndex row index
         * @param {integer}colIndex column index
         * @param {Object}[options] optional initialization
         * @param {integer}options.rowSpan row span number
         * @param {integer}options.colSpan column span number
         * @param {boolean}options.allowDisconnected row span number
         * @param {boolean}options.allowColSpan row span number
         * @param {boolean}options.allowRowSpan row span number
         *
         * @class Template slot.
         * Features:
         * <ul>
         *     <li>column and row span</li>
         *     <li>disconnected regions</li>
         * </ul>
         */
        gridSlot = function (slotText, rowIndex, colIndex, options) {
            log.debug("slot", slotText + "...");
            return new gridSlot.prototype.init(slotText, rowIndex, colIndex, options);
        };

        gridSlot.prototype = {
            constructor:gridSlot,
            /**
             * slot identifier
             * @type string
             */
            slotText:undefined,
            /**
             * row index. If row spans, topmost row index
             * @type integer
             */
            rowIndex:undefined,
            /**
             * column index. If column spans, leftmost column index
             * @type integer
             */
            colIndex:undefined,
            /**
             * row span number
             * @type integer
             */
            rowSpan:1,
            /**
             * column span number
             * @type integer
             */
            colSpan:1,
            /**
             * Can exists more than one group of slots with the same identifier?
             * @type boolean
             */
            allowDisconnected:false,
            /**
             * is column span allowed?
             * @type boolean
             */
            allowColSpan:false,
            /**
             * is row span allowed?
             * @type boolean
             */
            allowRowSpan:false,
            /**
             * HTML node that maps the slot
             * @type HTMLElement
             */
            htmlNode:undefined,
            /**
             * Stores the sum of children heights
             * @type integer
             */
            contentHeight:0,

            /**
             * @ignore
             * see gridSlot.constructor
             */
            init:function (slotText, rowIndex, colIndex, options) {
                this.slotText = slotText;
                this.rowIndex = rowIndex;
                this.colIndex = colIndex;
                this.contentHeight = 0;
                //options
                this.rowSpan = 1;
                this.colSpan = 1;
                this.height = "auto";

                this.allowDisconnected = false;
                this.allowColSpan = true;
                this.allowRowSpan = true;
                this.htmlNode = undefined;
                wef.extend(this, options, ["rowSpan", "colSpan", "allowDisconnected", "allowColSpan", "allowRowSpan"]);
            }
        };

        /**
         * Extension point
         */
        gridSlot.fn = gridSlot.prototype;
        gridSlot.prototype.init.prototype = gridSlot.prototype;

        global.gridSlot = gridSlot;
        log.info("load gridSlot module... [OK]");
    })(compiler.fn);


    (function (global) {
        var gridRow;
        log.info("load gridRow module...");
        /**
         * Creates a row
         *
         * @param {string}rowText row slots identifiers
         * @param {integer}rowIndex row index
         * @param {gridSlot[]}slots row gridSlot elements
         * @param {Object}[options] optional initialization
         * @param {string}options.height row height as string
         *
         * @class Template row. Store {@link gridSlot} elements
         */
        gridRow = function (rowText, rowIndex, slots, options) {
            log.debug("row...");
            return new gridRow.prototype.init(rowText, rowIndex, slots, options);
        };
        gridRow.prototype = {
            constructor:gridRow,
            /**
             * Row slots identifiers
             * @type string
             */
            rowText:undefined,
            /**
             * Row index
             * @type integer
             */
            rowIndex:undefined,
            /**
             * Slots row gridSlot elements
             * @type gridSlot[]
             */
            slots:[],
            /**
             * Number of slots in row
             * @type integer
             */
            length:undefined,
            /**
             * Row height as string
             * @type string
             */
            height:undefined,
            /**
             * @ignore
             * see constructor
             */
            init:function (rowText, rowIndex, slots, options) {
                this.rowText = rowText;
                this.rowIndex = rowIndex;
                this.slots = slots;
                this.length = this.rowText.length;
                //options
                this.height = undefined;
                wef.extend(this, options, ["height"]);
            }
        };
        /**
         * Extension point
         */
        gridRow.fn = gridRow.prototype;
        gridRow.prototype.init.prototype = gridRow.prototype;

        global.gridRow = gridRow;
        log.info("load gridRow module... [OK]");
    })(compiler.fn);


    (function (global) {
        var grid;
        log.info("load grid module...");
        /**
         * Creates a template grid
         *
         * @param {gridRow[]}rows template rows
         * @param [options] optional initialization
         *
         * @class Template grid, represented as a tabular structure
         */
        grid = function (rows, options) {
            log.debug("grid...");
            return new grid.prototype.init(rows, options);
        };

        grid.prototype = {
            constructor:grid,
            /**
             * Template rows
             * @type gridRow[]
             */
            rows:undefined,
            /**
             * Hash table like structure that stores nested Template objects.
             * <ul>
             *     <li>key = template position</li>
             *     <li>value = array of template objects</li>
             * <ul>
             *
             * @type Object
             */
            filledSlots:undefined,
            /**
             * columns widths
             * @type string[]
             */
            widths:[],
            /**
             * minimums columns widths
             * @type string[]
             */
            minWidths:[],
            /**
             * preferred columns widths
             * @type string[]
             */
            preferredWidths:[],
            /**
             * Number of rows
             * @type integer
             */
            rowNumber:undefined,
            /**
             * Number of columns
             * @type integer
             */
            colNumber:undefined,
            /**
             * @ignore
             */
            init:function (rows, options) {
                this.rows = rows;
                this.filledSlots = {};
                //options
                this.widths = [];
                this.minWidths = [];
                this.preferredWidths = [];
                wef.extend(this, options, ["widths", "minWidths", "preferredWidths"]);
                this.colNumber = this.widths.length;
                this.rowNumber = rows.length;
            },
            /**
             * Checks if grid contains specified slot identifier
             *
             * @param {string}slotIdentifier slot identifier
             * @returns {boolean} true if rows[i].rowText contains slotIdentifier,
             * else if not
             */
            hasSlot:function hasSlot(slotIdentifier) {
                var result;
                result = this.rows.some(function (row) {
                    var regExp = new RegExp(slotIdentifier);
                    return regExp.exec(row.rowText);
                });
                log.debug("hasSlot " + slotIdentifier + "?", result ? "yes" : "no");
                return result;
            },
            /**
             * Gets the "@" slot OR topmost left slot
             */
            getDefaultSlot:function () {
                var firstLetterSlot, definedDefaultSlot = false;
                this.rows.forEach(function (row) {
                    if (definedDefaultSlot) {
                        return; //skip row
                    }
                    Array.prototype.some.call(row.rowText, function (slotText, slotIndex) {
                        if (slotText === "@") {
                            definedDefaultSlot = row.slots[slotIndex];
                            return true;
                        }
                        if (!firstLetterSlot && slotText !== ".") {
                            firstLetterSlot = row.slots[slotIndex];
                            return false; //continue searching @
                        }
                    });
                });
                return definedDefaultSlot || firstLetterSlot;
            },
            /**
             * Traverses this grid and its children and insert the given
             * template in place
             * @param {template}aTemplate given template
             * @returns {boolean} true if inserted, false if not
             */
            setTemplate:function (aTemplate) {
                var row, tmp, result;
                if (this.hasSlot(aTemplate.position.position)) {
                    //push template
                    tmp = this.filledSlots[aTemplate.position.position] || [];
                    tmp.push(aTemplate);
                    this.filledSlots[aTemplate.position.position] = tmp;
                    log.debug("grid [" + aTemplate.position.position + "] =", aTemplate);
                    return true;
                } else {
                    result = this.rows.some(function (row) {
                        var result;
                        result = row.slots.some(function (slotId) {
                            var result;
                            result = this.filledSlots[slotId.slotText] && this.filledSlots[slotId.slotText].some(function (currentTemplate) {
                                return !currentTemplate.isLeaf() && currentTemplate.insert(aTemplate);
                            }, this);
                            if (!result) {
                                log.debug("not found, try another slot");
                            }
                            return result;
                        }, this);
                        if (!result) {
                            log.debug("not found, try another row");
                        }
                        return result;
                    }, this);
                    if (!result) {
                        log.debug("not found, try another branch");
                    }
                    return result;
                }
            }
        };
        /**
         * Extension point
         */
        grid.fn = grid.prototype;
        grid.prototype.init.prototype = grid.prototype;

        global.grid = grid;
        log.info("load grid module... [OK]");
    })(compiler.fn);

    (function (global) {
        var template;
        log.info("load template module...");
        /**
         * Creates a template
         *
         * @param {string}selectorText CSS selector
         * @param {PositionMetadata}position raw position information
         * @param {DisplayMetadata}display raw display information
         * @param {grid}grid its physical structure
         *
         * @class A Template has a grid, the raw information generated by
         * the preprocessor and a link to the DOM reference node
         */
        template = function (selectorText, position, display, grid) {
            log.debug("template...");
            return new template.prototype.init(selectorText, position, display, grid);
        };

        template.prototype = {
            constructor:template,
            /**
             * Link to parent template. Unused
             */
            parentTemplate:undefined,
            /**
             * CSS selector
             * @type string
             */
            selectorText:undefined,
            /**
             * Raw display information
             * @type DisplayMetadata
             */
            display:undefined,
            /**
             * Raw position information
             * @type PositionMetadata
             */
            position:undefined,
            /**
             * Its grid, the physical representation
             * @type grid
             */
            grid:undefined,
            /**
             * A link to the DOM reference node
             * @type HTMLElement
             */
            htmlNode:undefined,
            /**
             * @ignore
             */
            init:function (selectorText, position, display, grid) {
                this.selectorText = selectorText;
                this.display = display;
                this.position = position;
                this.grid = grid;
                this.htmlNode = undefined;
            },
            /**
             * Checks if has parent
             *
             * @returns {boolean} true if doesn't have a position value,
             * false if not
             */
            isRoot:function () {
                return this.position.position === null;
            },
            /**
             * Checks if has children
             *
             * @returns {boolean} true if has a grid value, false if not
             */
            isLeaf:function () {
                return this.display.grid.length === 0;
            },
            /**
             * Insert given template in this template or its children.
             * Calls grid.setTemplate()
             *
             * @param aTemplate given template
             * @returns {boolean} true if inserted, false if not
             */
            insert:function (aTemplate) {
                log.debug("trying to insert into ", this);
                return this.grid.setTemplate(aTemplate);
            }
        };
        /**
         * Extension point
         */
        template.fn = template.prototype;
        template.prototype.init.prototype = template.prototype;

        global.template = template;
        log.info("load template module... [OK]");
    })(compiler.fn);

    (function (global) {
        var templateBuilder;
        log.info("load templateBuilder module...");

        /**
         * Creates a gridBuffer
         *
         * @class {@link templateBuilder} temporal data structure.
         * Only for internal use. Doesn´t check array index
         * @name GridBuffer
         */
        function GridBuffer() {
            this._rows = [];
        }

        GridBuffer.prototype =
        /**
         * @lends GridBuffer#
         */
        {
            constructor:GridBuffer,
            /**
             * Array of rows
             * @type gridRow[]
             * @public
             */
            _rows:[],
            /**
             * Add the slot to _rows
             * @param {gridSlot}slot the slot
             */
            add:function (slot) {
                if (!Array.isArray(this._rows[slot.rowIndex])) {
                    this._rows[slot.rowIndex] = [];
                }
                this._rows[slot.rowIndex][slot.colIndex] = slot;
            },
            /**
             * Gets the slot with the specified slot Text
             * @param {string}slotText slot text
             * @returns {gridSlot} the specified slot
             */
            getSlot:function (slotText) {
                var result = [];
                this._rows.forEach(function (row) {
                    row.forEach(function (slot) {
                        if (slot.slotText === slotText) {
                            result.push(slot);
                        }
                    }, this);
                }, this);
                return result;
            },
            /**
             * Gets rows
             * @returns {gridRow[]} _rows
             */
            getRows:function () {
                return this._rows;
            },
            /**
             * Gets the specified row in _rows
             * @param index row index
             * @returns {gridRow} the specified row
             */
            getRow:function (index) {
                return this._rows[index];
            }
        };

        /**
         * @class
         */
        templateBuilder = function (source) {
            log.debug("templateBuilder...");
            return new templateBuilder.prototype.init(source);
        };

        templateBuilder.prototype = {
            constructor:templateBuilder,
            buffer:undefined,
            source:undefined,
            init:function (source) {
                this.source = source;
                this.buffer = new GridBuffer();
            },
            createTemplate:function () {
                var display, grid, gridRows, gridOptions = {}, heights;
                display = this.source.display;
                grid = null;
                if (display.grid.length > 0) {
                    this._addGrid(this.source.display);

                    heights = this._normalizeHeights(this.source.display);
                    gridRows = this.buffer.getRows().map(function (row, index) {
                        return compiler.fn.gridRow(this.source.display.grid[index].rowText, index, row, {height:heights[index]});
                    }, this);

                    gridOptions.widths = this._normalizeWidths(this.source.display.widths);
                    gridOptions.minWidths = gridOptions.widths.map(function (col) {
                        return templateBuilder.fn._getMinWidth(col);
                    });
                    gridOptions.preferredWidths = gridOptions.widths.map(function (col) {
                        return templateBuilder.fn._getPreferredWidth(col);
                    });
                    grid = compiler.fn.grid(gridRows, gridOptions);
                } else {
                    //TODO:fixme
                }

                return compiler.fn.template(this.source.selectorText, this.source.position, display, grid);
            },
            _addGrid:function (display) {
                if (display.grid.length > 0) {
                    display.grid.forEach(function (row, rowIndex) {
                        this._addGridRow(row, rowIndex);
                    }, this);
                }
            },
            checkRowSpan:function (slotText, rowIndex, colIndex) {
                var previousRow, oldRowSpan, candidateRowSpan, slotGroups;
                slotGroups = this.buffer.getSlot(slotText);
                if (!slotGroups[0].allowRowSpan) {
                    log.info("Slot don't allow row span");
                    return false;
                }

                if (rowIndex > 0) {
                    return slotGroups.some(function (slot) {
                        previousRow = this.source.display.grid[rowIndex - 1];
                        if (previousRow.rowText.charAt(colIndex) === slotText) {
                            oldRowSpan = slot.rowSpan;
                            candidateRowSpan = (rowIndex - slot.rowIndex) + 1;
                            if (candidateRowSpan == oldRowSpan) {
                                //do nothing
                                log.debug("Slot row span... [OK]");
                                return true;
                            }
                            if (candidateRowSpan == oldRowSpan + 1) {
                                slot.rowSpan++;
                                this.buffer.add(slot);
                                log.debug("Slot row span... [OK]");
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    }, this);
                } else {
                    return false;
                }
            },
            checkColSpan:function (slotText, row, colIndex) {
                var slotGroups, oldColSpan, candidateColSpan;
                slotGroups = this.buffer.getSlot(slotText);
                if (!slotGroups[0].allowColSpan) {
                    log.info("Slot don't allow col span");
                    return false;
                }
                if (colIndex > 0) {
                    return slotGroups.some(function (slot) {
                        if (row.rowText[colIndex - 1] === slotText) {
                            oldColSpan = slot.colSpan;
                            candidateColSpan = (colIndex - slot.colIndex) + 1;
                            if (candidateColSpan == oldColSpan + 1) {
                                slot.colSpan++;
                                this.buffer.add(slot);
                                log.debug("Slot col span... [OK]");
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    }, this);
                } else {
                    return false;
                }
            },
            _addGridRow:function (row, rowIndex) {
                var identifiers, colSpan, rowSpan, regions;
                identifiers = Array.prototype.map.call(row.rowText, function (substring) {
                    return substring.charAt(0);
                });

                identifiers.forEach(function (slotText, colIndex) {
                    //slot doesn't exist
                    if (this.buffer.getSlot(slotText).length === 0) {
                        this._addGridSlot(slotText, rowIndex, colIndex, 1, 1);
                        return; //no span or region violations
                    }

                    if (this.buffer.getSlot(slotText)[0].allowColSpan) {
                        colSpan = this.checkColSpan(slotText, row, colIndex);
                    } else {
                        colSpan = false;
                    }

                    if (this.buffer.getSlot(slotText)[0].allowRowSpan) {
                        rowSpan = this.checkRowSpan(slotText, rowIndex, colIndex);
                    } else {
                        rowSpan = false;
                    }

                    if (this.buffer.getSlot(slotText)[0].allowDisconnected) {
                        //TODO: region check
                        log.info("Slot allow disconnected regions");
                        this._addGridSlot(slotText, rowIndex, colIndex, 1, 1);
                        regions = true;
                    } else {
                        regions = false;
                    }

                    if (!colSpan && !rowSpan && !regions) {
                        throw new Error("Invalid template definition at \"" + slotText + "\"");
                    }

                }, this);
            },
            _addGridSlot:function (slotText, rowIndex, colIndex, rowSpan, colSpan) {
                var options, allowDisconnected, allowColSpan, allowRowSpan;

                if (slotText === ".") {
                    allowDisconnected = true;
                    allowColSpan = false;
                    allowRowSpan = false;
                } else {
                    allowDisconnected = false;
                    allowColSpan = true;
                    allowRowSpan = true;
                }
                options = {
                    rowSpan:rowSpan,
                    colSpan:colSpan,
                    allowDisconnected:allowDisconnected,
                    allowColSpan:allowColSpan,
                    allowRowSpan:allowRowSpan
                };
                this.buffer.add(compiler.fn.gridSlot(slotText, rowIndex, colIndex, options));
            },
            _getMinWidth:function (width) {
                if (width === "*") {
                    return "0px";
                } else {
                    return width;
                }
            },
            _getPreferredWidth:function (width) {
                if (width === "*") {
                    return "9999px";
                } else {
                    return width;
                }
            },
            _normalizeWidths:function (widths) {
                var i, tmp = [], dotColumn;

                function checkDotColumn(row) {
                    return row.rowText.charAt(i) === ".";
                }

                for (i = 0; i < this._getMaxColNumber(this.source.display.grid); i++) {
                    if (widths[i] === undefined) {
                        tmp[i] = "*";
                    } else {
                        if (/-/.test(widths[i])) {
                            throw new Error("Invalid argument: negative width not allowed");
                        }
                    }
                    if (this.source.display.grid.every(checkDotColumn)) {
                        tmp[i] = "0px";
                    }
                    if (widths[i] !== undefined) {
                        tmp[i] = widths[i];
                    }
                }
                return tmp;
            },
            _normalizeHeights:function (display) {
                var dotLineRegExp = /^\.+$/, negativeHeight = /-/, i, tmp = [];
                for (i = 0; i < display.grid.length; i++) {
                    if (display.grid[i].height === undefined) {
                        tmp[i] = "auto";
                    } else {
                        if (negativeHeight.test(display.grid[i].rowText)) {
                            throw new Error("Invalid argument: negative height not allowed");
                        }
                    }
                    if (dotLineRegExp.test(display.grid[i].rowText)) {
                        tmp[i] = "0px";
                    }
                    //can overwrite dotLine rule
                    if (display.grid[i].height !== undefined) {
                        tmp[i] = display.grid[i].height;
                    }
                }
                return tmp;
            },
            _getMaxColNumber:function (grid) {
                if (grid.length === 0) {
                    return 0;
                }
                return grid.reduce(function (last, row) {
                    return last > row.rowText.length ? last : row.rowText.length;
                }, 0);
            }
        };

        templateBuilder.fn = templateBuilder.prototype;
        templateBuilder.prototype.init.prototype = templateBuilder.prototype;

        global.templateBuilder = templateBuilder;
        log.info("load templateBuilder module... [OK]");
    })(compiler.fn);

    log.info("compiler module load... [OK]");

})(window.templateLayout);(function (templateLayout) {

    var generator, log;
    log = wef.logger("templateLayout.generator");

    log.info("load generator module...");

    function generateRootTemplate(template) {
        var rootElement;

        function appendFreeNodes(currentNode, defaultNode) {
            var i, className, candidates = [];
            for (i = 0; i < currentNode.childNodes.length; i++) {
                className = currentNode.childNodes[i].className;
                if (className || className === "") {
                    //HTMLElementNodes
                    if (!/templateLayout/.test(className)) {
                        console.log(className, currentNode.childNodes[i].tagName);
                        candidates.push(currentNode.childNodes[i]);
                    }
                } else {
                    //TextNodes
                    console.log("text", currentNode.childNodes[i].textContent);
                    //insert in template.grid.getDefaultNode()
                    candidates.push(currentNode.childNodes[i]);
                }
            }
            while (candidates.length > 0) {
                defaultNode.appendChild(candidates.shift());
            }
        }

        function generateTemplate(template, parentHtmlNode) {
            var templateNode, gridNode, rowNode, slotNode, defaultSlot, defaultNode;
            log.info("template:", template.selectorText, "(parent:", parentHtmlNode.localName, ")");
            templateNode = generator.fn.appendTemplate(template, parentHtmlNode);
            if (!template.isLeaf()) {
                defaultSlot = template.grid.getDefaultSlot();
                gridNode = generator.fn.appendGrid(template.grid, templateNode);
                template.grid.rows.forEach(function (row) {
                    log.info("row:", row.rowText);
                    rowNode = generator.fn.appendRow(row, gridNode);
                    row.slots.forEach(function (slot) {
                        log.info("slot:", slot.slotText);
                        slotNode = generator.fn.appendSlot(slot, rowNode);
                        if (defaultSlot.slotText === slot.slotText) {
                            //mark currentNode as default
                            defaultNode = slotNode;
                        }
                        //each slot can have multiple elements or none
                        if (template.grid.filledSlots[slot.slotText]) {
                            template.grid.filledSlots[slot.slotText].forEach(function (childTemplate) {
                                log.info("slot contains:", childTemplate.selectorText);
                                generateTemplate(childTemplate, slotNode);
                            });
                        }
                    });
                });
                appendFreeNodes(templateNode, defaultNode);
            }
            log.debug("template generated: ", template);
        }

        function resizeTemplateWidth(template, parentHtmlNode) {
            var templateNode, gridNode, columnNode, rowNode, slotNode, availableWidth, computedWidths, availableHeight, computedHeights;
            log.info("resize template - parentWidth:", parentHtmlNode.clientWidth);
            templateNode = template.htmlNode;
            availableWidth = templateNode.clientWidth;

            if (!template.isLeaf()) {
                computedWidths = generator.fn.computeColWidths(availableWidth, template);

                gridNode = generator.fn.getGridNode(templateNode);
                generator.fn.setGridNodeWidth(gridNode, computedWidths);

                columnNode = generator.fn.getColumnNodes(gridNode, template.grid.colNumber);
                generator.fn.setColNodeWidth(columnNode, computedWidths);

                template.grid.rows.forEach(function (row, rowIndex) {
                    log.info("resize row:", row.rowText);
                    rowNode = generator.fn.getRowNode(gridNode, rowIndex, columnNode.length);
                    row.slots.forEach(function (slot, colIndex) {
                        log.info("resize slot:", slot.slotText);
                        if (template.grid.filledSlots[slot.slotText]) {
                            slotNode = slot.htmlNode;
                            generator.fn.setSlotNodeWidth(slotNode, computedWidths, colIndex);
                            template.grid.filledSlots[slot.slotText].forEach(function (childTemplate) {
                                resizeTemplateWidth(childTemplate, slotNode);
                            });
                        }
                    });
                });
            } else {
                log.warn("leaf - no grid");
            }
            log.debug("template resize... [OK]");
        }

        function resizeTemplateHeight(template, parentHtmlNode) {
            var templateNode, gridNode, columnNode, rowNode, slotNode, computedHeights;
            log.info("resize template - parentHeight:", parentHtmlNode.clientHeight);
            templateNode = template.htmlNode;

            if (!template.isLeaf()) {
//                computedHeights = generator.fn.computeRowHeights(template);
                gridNode = generator.fn.getGridNode(templateNode);

                columnNode = generator.fn.getColumnNodes(gridNode, template.grid.colNumber);
                template.grid.rows.forEach(function (row, rowIndex) {
                    log.info("resize row:", row.rowText);
                    rowNode = generator.fn.getRowNode(gridNode, rowIndex, columnNode.length);

                    row.slots.forEach(function (slot, colIndex) {
                        log.info("resize slot:", slot.slotText);
                        if (template.grid.filledSlots[slot.slotText]) {
                            slotNode = slot.htmlNode;

                            template.grid.filledSlots[slot.slotText].forEach(function (childTemplate) {
                                resizeTemplateHeight(childTemplate, slotNode);

                            });
                            //todo:delete
                            //generator.fn.setSlotNodeHeight(slotNode, computedHeights, rowIndex);
//                                    var zzz = slot.htmlNode.offsetHeight;
//                                    if(zzz>computedHeights.rowHeight[rowIndex]) {
//                                        computedHeights.rowHeight[rowIndex] = zzz;
//                                        generator.fn.setSlotNodeHeight(slotNode, computedHeights, rowIndex);
//                                    }
                        }
                        computedHeights = generator.fn.computeRowHeights(template);
                        generator.fn.setSlotNodeHeight(slotNode, computedHeights, rowIndex);
                    });
                    computedHeights = generator.fn.computeRowHeights(template);
                    generator.fn.setRowNodeHeight(rowNode, computedHeights, rowIndex);
                });
                computedHeights = generator.fn.computeRowHeights(template);
                generator.fn.setGridNodeHeight(gridNode, computedHeights);
            } else {
                log.warn("leaf - no grid");
            }
            log.debug("template resize... [OK]");
        }

        rootElement = document.querySelector(template.selectorText);
        generateTemplate(template, rootElement.parentNode);
        resizeTemplateWidth(template, rootElement.parentNode);
        resizeTemplateHeight(template, rootElement.parentNode);
    }

    /**
     * Creates a template compiler
     *
     * @param {r}tom Template Object Model
     *
     * @class Generates HTML code that maps generated TOM to tables, then injects
     * this code into  the page DOM.
     * This version uses the old "table layout" method.
     */
    generator = function (tom) {
        return new generator.prototype.init(tom);
    };

    generator.prototype = {
        /**
         * Local copy of given TOM
         * @type rootTemplate
         */
        tom:undefined,

        /**
         * @ignore
         * see constructor
         */
        init:function (tom) {
            this.tom = tom;
            return this;
        },
        /**
         * Generates the HTML code and injects it into the page DOM.
         * </p>
         * Code generation is done in three steps:
         * <ul>
         *     <li>Step 1: Plain object generation</li>
         *     <li>Step 2: Column width resize</li>
         *     <li>Step 3: Ror height resize</li>
         * </ul>
         */
        patchDOM:function () {
            log.info("patch DOM...");
            log.debug("TOM: ", this.tom);
            generator.fn.resetCSS();
            this.tom.rows.forEach(generateRootTemplate);
        },
        /**
         * Resets browser default CSS styles.
         */
        resetCSS:function () {
            var head = document.getElementsByTagName('head')[0],
                cssString = [
                    ".templateLayout {" +
                    "margin: 0;" +
                    "padding: 0;" +
                    "border: 0;" +
                    "font-size: 100%;" +
                    "font: inherit;" +
                    "vertical-align: baseline;" +
                    "line-height: 1;" +
                    "border-collapse: collapse;" +
                    "border-spacing: 0;" +
                    "}"
                ],
                styleTag = document.createElement('style');
            styleTag.setAttribute('type', 'text/css');
            head.appendChild(styleTag);
            styleTag.innerHTML = cssString;
        },
        /**
         * Set grid width (the TABLE node)
         *
         * @param {HTMLElement}gridNode DOM node that maps grid element
         * @param {Object}computedWidths column widths given by calculateColWidths()
         * @param {integer}computedWidths.totalWidth table width
         */
        setGridNodeWidth:function (gridNode, computedWidths) {
            gridNode.style.tableLayout = "fixed";
            gridNode.width = computedWidths.totalWidth;
        },
        /**
         * Set grid height (the TABLE node)
         *
         * @param {HTMLElement}gridNode DOM node that maps grid element
         * @param {Object}computedHeights column widths given by calculateRowHeights()
         * @param {integer}computedHeights.maxHeight table height
         */
        setGridNodeHeight:function (gridNode, computedHeights) {
            gridNode.style.height = computedHeights.totalHeight + "px";
            gridNode.style.maxHeight = computedHeights.totalHeight + "px";
        },
        /**
         * Set columns width (the COL nodes)
         *
         * @param {HTMLElement[]}colNodes array of DOM nodes that maps column nodes
         * @param {Object}computedWidths column widths given by calculateColWidths()
         * @param {integer[]}computedWidths.colWidth array of column widths
         */
        setColNodeWidth:function (colNodes, computedWidths) {
            colNodes.forEach(function (node, index) {
                node.width = computedWidths.colWidth[index];
                node.style.maxWidth = computedWidths.colWidth[index] + "px";
            });
        },
        /**
         * Set row height (the TR nodes)
         *
         * @param {HTMLElement}rowNode DOM node that maps row element
         * @param {Object}computedHeights column widths given by calculateRowHeights()
         * @param {integer[]}computedHeights.rowHeight array of row heights
         * @param {integer}rowIndex row index
         */
        setRowNodeHeight:function (rowNode, computedHeights, rowIndex) {
            rowNode.style.height = computedHeights.rowHeight[rowIndex] + "px";
            rowNode.style.maxHeight = computedHeights.rowHeight[rowIndex] + "px";
        },
        /**
         * Set slot width (the TD nodes)
         *
         * @param {HTMLElement}slotNode DOM node that maps slot element
         * @param {Object}computedWidths column widths given by calculateColWidths()
         * @param {integer[]}computedWidths.colWidth array of column widths
         * @param {integer}colIndex slot colIndex.  See {@link gridSlot#colIndex}
         */
        setSlotNodeWidth:function (slotNode, computedWidths, colIndex) {
            var i, width = 0;
            for (i = 0; i < slotNode.colSpan; i++) {
                width += computedWidths.colWidth[colIndex + i];
            }
            slotNode.style.width = width + "px";
            slotNode.style.maxWidth = width + "px";
        },
        /**
         * Set slot height (the TD nodes)
         * @param {HTMLElement}slotNode DOM node that maps slot element
         * @param {Object}computedHeights column widths given by calculateRowHeights()
         * @param {integer[]}computedHeights.rowHeight array of row heights
         * @param {integer}rowIndex slot rowIndex.  See {@link gridSlot#rowIndex}
         */
        setSlotNodeHeight:function (slotNode, computedHeights, rowIndex) {
            var i, height = 0;
            for (i = 0; i < slotNode.rowSpan; i++) {
                height += computedHeights.rowHeight[rowIndex + i];
            }
            slotNode.style.overflow = "auto";

            slotNode.childNodes[0].style.height = height + "px";
            slotNode.childNodes[0].style.maxHeight = height + "px";
            slotNode.childNodes[0].style.overflow = "auto";
        },
        /**
         * Get DOM node that maps template grid (TABLE node)
         * @param {HTMLElement}templateNode template node
         * @returns {HTMLElement} templateNode.childNodes[0]
         */
        getGridNode:function (templateNode) {
            return templateNode.childNodes[0];
        },

        /**
         * Get DOM nodes that maps template grid "columns" (COL nodes)
         * @param {HTMLElement}gridNode grid node
         * @param {integer}maxColumns number of columns in grid
         * @returns {HTMLElement[]} array of matching gridNode.childNodes[]
         */
        getColumnNodes:function (gridNode, maxColumns) {
            var i, columnNodes = [];
            for (i = 0; i < maxColumns; i++) {
                columnNodes.push(gridNode.childNodes[i]);
            }
            return columnNodes;
        },
        /**
         * Get DOM node that maps row (TR nodes)
         * @param {HTMLElement}gridNode grid node
         * @param {integer}index row index
         * @param {integer}maxColumns number of columns in grid
         * @returns {HTMLElement[]} array of matching gridNode.childNodes[]
         */
        getRowNode:function (gridNode, index, maxColumns) {
            return gridNode.childNodes[maxColumns + index];
        },
        /**
         * Get pixel size. Currently converts "px" and "%"
         * @param {string}dimension source in "75[px|%]" format
         * @param {integer}max max size in pixels. Only used relative sizes ("%")
         * @returns {integer} given size converted to pixels or Error
         */
        getPixels:function (dimension, max) {
            var found = dimension.match(/(\d+)(px|%)/);
            if (found[2] === "%") {
                return parseInt(found[1], 10) * max / 100;
            }
            if (found[2] === "px") {
                return parseInt(found[1], 10);
            }
        },
        /**
         * A lightly modified version of "compute heights" algorithm defined in
         * the draft.
         * </p>
         * The good parts, it works (thanks to native table algorithms);
         * the bad, needs further improvements
         *
         * @param {template}template the source template
         * @returns {ComputedHeight} rows height
         */
        computeRowHeights:function (template) {
            /**
             *
             * @namespace Computed template rows heights
             * @name ComputedHeight
             */
            var result =
            /**
             * @lends ComputedHeight#
             */
            {
                /**
                 * Sum of rows heights
                 * @type integer
                 */
                totalHeight:undefined,
                /**
                 * Array of row heights
                 * @type integer[]
                 */
                rowHeight:[]
            }, tmp, height = 0, fixedHeights = 0, relativeHeights = 0;

            tmp = template.grid.rows.map(function (row) {
                if (/(\d+)(px)/.test(row.height)) {
                    return generator.fn.getPixels(row.height, 0);
                }
                return row.height;
            }, this);

            template.grid.rows.forEach(function (row, rowIndex) {
                if (row.height === "*" || row.height === "auto") {
                    tmp[rowIndex] = 0;
                    row.slots.forEach(function (slot) {
                        if (slot.rowSpan === 1) {
                            var zzz = slot.htmlNode.offsetHeight;
                            if (zzz > tmp[rowIndex]) {
                                tmp[rowIndex] = zzz;
                            }
                        }
                    }, this);
                }
            }, this);

            template.grid.rows.forEach(function (row, rowIndex) {
                if (row.height === "*") {
                    if (tmp[rowIndex] > height) {
                        height = tmp[rowIndex];
                    }
                }
            }, this);
            template.grid.rows.forEach(function (row, rowIndex) {
                if (row.height === "*") {
                    tmp[rowIndex] = height;
                }
            }, this);

            tmp.forEach(function (height) {
                if (/(\d+)(%)/.test(height)) {
                    var found = height.match(/(\d+)(%)/);
                    relativeHeights += parseInt(found[1], 10);
                } else {
                    fixedHeights += height;
                }
            });
            result.totalHeight = (fixedHeights * 100) / (100 - relativeHeights);
            result.rowHeight = tmp;
            return result;
        },
        /**
         * A lightly modified version of "compute width" algorithm defined in
         * the draft.
         * </p>
         * The good parts, it works (thanks to native table algorithms);
         * the bad, needs further improvements
         *
         * @param {Number}availableWidth parent node max width
         * @param {template}template the source template
         * @returns {ComputedWidth} columns width
         */
        computeColWidths:function (availableWidth, template) {
            /**
             *
             * @namespace Computed template columns widths
             * @name ComputedWidth
             * */
            var result =
            /**
             * @lends ComputedWidth#
             */
            {
                /**
                 * Sum of columns widths
                 * @type integer
                 */
                totalWidth:undefined,
                /**
                 * Array of columns widths
                 * @type integer[]
                 */
                colWidth:[]
            }, gridMinWidth, flexibleColCounter = 0, fixedColSum = 0, flexibleWidth = 0, gridFinalWidth = 0;


            template.grid.widths.forEach(function (colWidth) {
                if (colWidth === "*") {
                    flexibleColCounter++;
                } else {
                    fixedColSum += generator.fn.getPixels(colWidth, availableWidth);
                }
            });
            flexibleWidth = (flexibleColCounter > 0) ? (availableWidth - fixedColSum) / flexibleColCounter : 0;

            gridMinWidth = template.grid.minWidths.reduce(function (previous, colMinWidth) {
                return previous + generator.fn.getPixels(colMinWidth, availableWidth);
            }, 0);

            if (gridMinWidth > availableWidth) {
                result.totalWidth = availableWidth;
                result.colWidth = template.grid.minWidths.map(function (col) {
                    return generator.fn.getPixels(col, availableWidth);
                });
            } else {
                result.colWidth = template.grid.widths.map(function (width) {
                    var tmp;
                    if (width === "*") {
                        gridFinalWidth += flexibleWidth;
                        return flexibleWidth;
                    }
                    if (/(\d+)(px|%)/.test(width)) {
                        //minWidth==width==preferredWidth
                        tmp = generator.fn.getPixels(width, availableWidth);
                        gridFinalWidth += tmp;
                        return tmp;
                    }
                    //no more use cases
                });
                result.totalWidth = gridFinalWidth;
            }
            return result;
        },
        /**
         * Create the grid node (using TABLE) and inject it into parent node.
         * Uses appendCol to create column nodes too.
         * @param {grid} grid template grid
         * @param {HTMLElement}parentNode DOM parent node
         * @returns {HTMLElement} current node
         */
        appendGrid:function (grid, parentNode) {
            var gridNode = document.createElement("table");
            gridNode.className = "templateLayout templateLayoutTable";
            parentNode.appendChild(gridNode);
            generator.fn.appendCol(gridNode, grid.colNumber);
            return gridNode;
        },
        /**
         * Create columns nodes (using COL) and inject it into parent node
         * @param {HTMLElement}parentNode DOM parent node
         * @param {integer}colNumber max number of columns
         * @returns {HTMLElement} current node
         */
        appendCol:function (parentNode, colNumber) {
            var i, colNode;
            for (i = 0; i < colNumber; i++) {
                colNode = document.createElement("col");
                colNode.className = "templateLayout templateLayoutCol";
                parentNode.appendChild(colNode);
            }
        },
        /**
         * Create a row node (using TR) and inject it into parent node
         * @param {gridRow}row template row
         * @param {HTMLElement}parentNode DOM parent node
         * @returns {HTMLElement} current node
         */
        appendRow:function (row, parentNode) {
            var rowNode = document.createElement("tr");
            rowNode.className = "templateLayout templateLayoutRow";
            parentNode.appendChild(rowNode);
            return rowNode;
        },
        /**
         * Create a slot node (using TD) and inject it into parent node
         * @param {gridSlot}slot template slot
         * @param {HTMLElement}parentNode DOM parent node
         * @returns {HTMLElement} current node
         */
        appendSlot:function (slot, parentNode) {
            //create container
            var cellNode, overflowNode;
            cellNode = document.createElement("td");
            cellNode.className = "templateLayout templateLayoutSlot";
            slot.htmlNode = cellNode;
            parentNode.appendChild(cellNode);

            if (slot.rowSpan > 1) {
                cellNode.rowSpan = slot.rowSpan;
            }
            if (slot.colSpan > 1) {
                cellNode.colSpan = slot.colSpan;
            }

            overflowNode = document.createElement("div");
            overflowNode.className = "templateLayout templateOverflow";
            cellNode.appendChild(overflowNode);
            return overflowNode;
        },
        /**
         * Create a virtual node (using DIV) and inject it into parent node.
         *
         * Virtual nodes are valid templates that doesn't match selector queries
         * because doesn´t have HTML content (used in nested templates chains).
         * </p>
         * <pre>
         *     #parent {display: "aa" "bc" "dd"}
         *     #header {position:a; display: "123"}
         *     #logo {position:1}
         *     ...
         *     &lt;div id="parent"&gt;&lt;/div&gt;
         *     &lt;img id="logo" src="logo.png"/&gt;
         *     ...
         * </pre>
         * #parent maps to DIV element and #logo to image, but #header maps
         * nothing, its a template used only to simplify layout. #header needs
         * to create a virtual node.
         *
         * @param {HTMLElement}parentNode DOM parent node
         * @returns {HTMLElement} current node
         */
        appendVirtualNode:function (parentNode) {
            var extraNode = document.createElement("div");
            extraNode.className = "templateLayout templateLayoutVirtualNode";
            parentNode.appendChild(extraNode);
            return extraNode;
        },
        /**
         * Get template node and inject it into parent node.
         * Template node is get using a CSS selector query OR if query fails calling {@link generator#appendVirtualNode}
         * @param {template}template the template
         * @param {HTMLElement}parentNode DOM parent node
         * @returns {HTMLElement} current node
         */
        appendTemplate:function (template, parentNode) {
            var templateNode = document.querySelector(template.selectorText) || generator.fn.appendVirtualNode(parentNode);
            template.htmlNode = templateNode;
            if (templateNode.parentNode !== parentNode) {
                parentNode.appendChild(templateNode);
            }
            return templateNode;
        }
    };

    generator.fn = generator.prototype;
    generator.prototype.init.prototype = generator.prototype;

    templateLayout.fn.generator = generator;

    log.info("generator module load... [OK]");

})(window.templateLayout);