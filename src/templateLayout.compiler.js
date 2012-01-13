(function (templateLayout) {

    var compiler, log, rootTemplate;
    log = wef.logger("templateLayout.compiler");

    log.info("load compiler module");

    function template(preProcessTemplate) {
        function gridSlot(slotText) {
            log.debug("slot...");

            var that = {
                slotText:slotText,
                colspan:1,
                toString:function () {
                    return slotText;
                }
            };

            log.debug("slot " + that + "... [OK]");
            return that;
        }

        function gridRow(rowText) {
            log.debug("row...");

            function markColSpan(id) {
                id.slotText = "+";
                return id;
            }

            var that = {
                rowText:rowText,
                slotIdentifier:[],
                length:rowText.length
            };

            (function init() {
                var lastId = {}, currentId, colspan = 1;

                Array.prototype.forEach.call(rowText, function (slot, index, array) {
                    currentId = gridSlot(slot.charAt(0));
                    if (lastId && lastId.slotText === currentId.slotText) {
                        colspan++;
                        that.slotIdentifier.push(markColSpan(currentId));
                        that.slotIdentifier[index-(colspan-1)].colspan++;
                        return;
                    }
                    colspan = 1;
                    lastId.slotText = currentId.slotText;
                    that.slotIdentifier.push(currentId);
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
                        return !currentTemplate.isLeaf() && currentTemplate.insert(aTemplate);
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

    rootTemplate = function () {
        var that = {
            insert:insert,
            rows:[]
        };

        function insert(preProcessTemplate) {
            log.info("inserting ", preProcessTemplate.selectorText);
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

    compiler = function () {
        return new compiler.prototype.init();
    };

    compiler.fn = compiler.prototype;

    compiler.prototype = {
        constructor:compiler,
        init:function () {
            return this;
        },
        compile:function (buffer) {
            var selectorText, preProcessTemplate, inserted;
            log.info("compile...");
            log.debug("buffer: ", buffer);

            for (selectorText in buffer) {
                log.debug("next buffer element: ", selectorText);
                log.group();
                preProcessTemplate = parseProperties(buffer[selectorText]);
                log.debug("preProcess: ", preProcessTemplate);
                inserted = rootTemplate.insert(preProcessTemplate);
                log.groupEnd();
                log.info("element insertion...", inserted ? "[OK]" : "ERROR!");
            }
            log.debug("compile... OK");
            return rootTemplate;

        }
    };

    compiler.prototype.init.prototype = compiler.prototype;

    templateLayout.fn.compiler = compiler;

    log.info("compiler module load... [OK]");

})(window.templateLayout);
