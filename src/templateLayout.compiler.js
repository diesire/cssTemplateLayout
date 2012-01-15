(function (templateLayout) {

    var compiler, log, rootTemplate;
    log = wef.logger("templateLayout.compiler");

    log.info("load compiler module");

    rootTemplate = function () {
        var that = {
            insert:insert,
            rows:[]
        };

        function insert(aTemplate) {
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
        var positionMetadata, matched, positionRegExp;
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
        positionMetadata = {
            position:null
        };
        positionRegExp = /^\s*([a-zA-Z0-9]+|same)\s*/i;
        if (positionValue !== undefined) {
            matched = positionValue.match(positionRegExp);
            if (matched === null) {
                log.error("Unexpected value at ", positionValue);
                throw new Error("Unexpected value at ", positionValue);
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
            var selectorText, preProcessTemplate, inserted, template;
            log.info("compile...");
            log.debug("buffer: ", buffer);

            for (selectorText in buffer) {

                if (buffer.hasOwnProperty(selectorText)) {
                    log.debug("next buffer element: ", selectorText);
                    log.group();
                    preProcessTemplate = parseProperties(buffer[selectorText]);
                    log.debug("preProcess: ", preProcessTemplate);
                    template = compiler.fn.templateBuilder().createTemplate(preProcessTemplate);
                    inserted = rootTemplate.insert(template);
                    log.groupEnd();
                    log.info("element insertion...", inserted ? "[OK]" : "ERROR!");
                }
            }
            log.debug("compile... OK");
            return rootTemplate;

        }
    };

    compiler.prototype.init.prototype = compiler.prototype;

    templateLayout.fn.compiler = compiler;

    (function (global) {
        var gridSlot;
        log.info("load gridSlot module...");
        gridSlot = function (slotText, rowIndex, colIndex, rowSpan, colSpan) {
            log.debug("slot...");
            return new gridSlot.prototype.init(slotText, rowIndex, colIndex, rowSpan, colSpan);
        };

        gridSlot.prototype = {
            constructor:gridSlot,
            slotText:undefined,
            rowIndex:undefined,
            colIndex:undefined,
            rowSpan:undefined,
            colSpan:undefined,
            init:function (slotText, rowIndex, colIndex, rowSpan, colSpan) {
                this.slotText = slotText;
                this.rowIndex = rowIndex;
                this.colIndex = colIndex;
                this.rowSpan = rowSpan;
                this.colSpan = colSpan;

            },
            toString:function () {
                return String(this.slotText, "cols:", this.colSpan);
            }
        };

        gridSlot.fn = gridSlot.prototype;
        gridSlot.prototype.init.prototype = gridSlot.prototype;

        global.gridSlot = gridSlot;
        log.info("load gridSlot module... [OK]");
    })(compiler.fn);

    (function (global) {
        var gridRow;
        log.info("load gridRow module...");
        gridRow = function (rowText, rowIndex, slots) {
            log.debug("row...");
            return new gridRow.prototype.init(rowText, rowIndex, slots);
        };
        gridRow.prototype = {
            constructor:gridRow,
            rowText:undefined,
            rowIndex:undefined,
            slotIdentifier:[],
            length:undefined,
            init:function (rowText, rowIndex, slots) {
                this.rowText = rowText;
                this.rowIndex = rowIndex;
                this.length = this.rowText.length;
                //valid reference if slots is not reused
                this.slotIdentifier = slots;
            }
        };

        gridRow.fn = gridRow.prototype;
        gridRow.prototype.init.prototype = gridRow.prototype;

        global.gridRow = gridRow;
        log.info("load gridRow module... [OK]");
    })(compiler.fn);

    (function (global) {
        var grid;
        log.info("load grid module...");
        grid = function (rows) {
            log.debug("grid...");
            return new grid.prototype.init(rows);
        };

        grid.prototype = {
            constructor:grid,
            rows:undefined,
            slots:undefined,
            init:function (rows) {
                this.rows = rows;
                this.slots = {};
            },
            hasSlot:function hasSlot(slotIdentifier) {
                var result;
                result = this.rows.some(function (row) {
                    var regExp = new RegExp(slotIdentifier);
                    return regExp.exec(row.rowText);
                });
                log.debug("hasSlot " + slotIdentifier + "?", result ? "yes" : "no");
                return result;
            },
            setTemplate:function (aTemplate) {
                var row, tmp, result;
                if (this.hasSlot(aTemplate.position.position)) {
                    //push template
                    tmp = this.slots[aTemplate.position.position] || [];
                    tmp.push(aTemplate);
                    this.slots[aTemplate.position.position] = tmp;
                    log.debug("grid [" + aTemplate.position.position + "] =", aTemplate);
                    return true;
                } else {
                    result = this.rows.some(function (row) {
                        var result;
                        result = row.slotIdentifier.some(function (slotId) {
                            var result;
                            result = this.slots[slotId] && this.slots[slotId].some(function (currentTemplate) {
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

        grid.fn = grid.prototype;
        grid.prototype.init.prototype = grid.prototype;

        global.grid = grid;
        log.info("load grid module... [OK]");
    })(compiler.fn);

    (function (global) {
        var template;
        log.info("load template module...");
        template = function (selectorText, position, display, grid) {
            log.debug("template...");
            return new template.prototype.init(selectorText, position, display, grid);
        };

        template.prototype = {
            constructor:template,
            parentTemplate:undefined,
            selectorText:undefined,
            selector:undefined,
            display:undefined,
            position:undefined,
            grid:undefined,
            init:function (selectorText, position, display, grid) {
                this.selectorText = selectorText;
                this.display = display;
                this.position = position;
                this.grid = grid;
            },
            isRoot:function () {
                return this.position.position === null;
            },
            isLeaf:function () {
                return this.display.grid === null;
            },
            insert:function (aTemplate) {
                log.debug("trying to insert into ", this);
                return this.grid.setTemplate(aTemplate);
            }
        };

        template.fn = template.prototype;
        template.prototype.init.prototype = template.prototype;

        global.template = template;
        log.info("load template module... [OK]");
    })(compiler.fn);

    (function (global) {
        var templateBuilder;
        log.info("load templateBuilder module...");

        function Slots() {
            this.used = {};
            this.rows = [];
        }

        Slots.prototype = {
            constructor:Slots,
            used:{},
            rows:[],
            add:function (slot) {
                this.used[slot.slotText] = slot;
                if (!Array.isArray(this.rows[slot.rowIndex])) {
                    this.rows[slot.rowIndex] = [];
                }
                this.rows[slot.rowIndex][slot.colIndex] = slot;
            },
            getSlot:function (id) {
                return this.used[id];
            },
            getRows:function () {
                return this.rows;
            },
            deleteSlot:function (id) {
                delete this.used[id];
                this.rows[id.rowIndex].splice(id.colIndex, 1);
            }
        };

        templateBuilder = function () {
            log.debug("templateBuilder...");
            return new templateBuilder.prototype.init();
        };

        templateBuilder.prototype = {
            constructor:templateBuilder,
            slots:undefined,
            init:function () {
                this.slots = new Slots();
            },
            createTemplate:function (source) {
                var display, grid, gridRows;

                display = source.display;
                grid = null;
                if (display.grid !== null) {
                    this._addGrid(source.display);
                    gridRows = this.slots.getRows().map(function (row, index) {
                        return compiler.fn.gridRow(source.display.grid[index], index, row);
                    }, this);
                    grid = compiler.fn.grid(gridRows);
                }

                return compiler.fn.template(source.selectorText, source.position, display, grid);
            },
            _addGrid:function (display) {
                //TODO: grid !== null ???
                if (display.grid !== null) {
                    display.grid.forEach(function (rowText, rowIndex) {
                        this._addGridRow(rowText, rowIndex);
                    }, this);
                }
            },
            _addGridRow:function (rowText, rowIndex) {
                var identifiers;
                identifiers = Array.prototype.map.call(rowText, function (substring) {
                    return substring.charAt(0);
                });

                identifiers.forEach(function (slotText, colIndex) {
                    var slot;
                    if (!this.slots.getSlot(slotText)) {
                        this._addGridSlot(slotText, rowIndex, colIndex, 1, 1);
                    } else {
                    }

                    slot = this.slots.getSlot(slotText);
                    //validate row stub
                    //TODO: aba
                    slot.colSpan = (colIndex - slot.colIndex) + 1;
                    this.slots.add(slot);
                    //validate col stub
                    slot.rowSpan = (rowIndex - slot.rowIndex) + 1;
                    this.slots.add(slot);
                    //TODO: validate multiple
                }, this);
            },
            _addGridSlot:function (slotText, rowIndex, colIndex, rowSpan, colSpan) {
                this.slots.add(compiler.fn.gridSlot(slotText, rowIndex, colIndex, rowSpan, colSpan));
            }
        };

        templateBuilder.fn = templateBuilder.prototype;
        templateBuilder.prototype.init.prototype = templateBuilder.prototype;

        global.templateBuilder = templateBuilder;
        log.info("load templateBuilder module... [OK]");
    })(compiler.fn);

    log.info("compiler module load... [OK]");

})(window.templateLayout);
