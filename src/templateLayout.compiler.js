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
            displayType:undefined,
            grid:[],
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
                    if (this.isEmptyDisplay(preProcessTemplate.display) && this.isEmptyPosition(preProcessTemplate.position)) {
                        log.groupEnd();
                        log.info("preProcess: empty template", preProcessTemplate);
                    } else {
                        log.debug("preProcess:", preProcessTemplate);
                        template = compiler.fn.templateBuilder().createTemplate(preProcessTemplate);
                        inserted = rootTemplate.insert(template);
                        log.groupEnd();
                        log.info("element insertion...", inserted ? "[OK]" : "ERROR!");
                    }
                }
            }
            log.debug("compile... OK");
            return rootTemplate;
        },
        isEmptyDisplay:function (display) {
            return display.grid.length === 0;
        },
        isEmptyPosition:function (position) {
            return position.position === null;
        }
    };

    compiler.prototype.init.prototype = compiler.prototype;

    templateLayout.fn.compiler = compiler;

    (function (global) {
        var gridSlot;
        log.info("load gridSlot module...");
        gridSlot = function (slotText, rowIndex, colIndex, options) {
            log.debug("slot...");
            return new gridSlot.prototype.init(slotText, rowIndex, colIndex, options);
        };

        gridSlot.prototype = {
            constructor:gridSlot,
            slotText:undefined,
            rowIndex:undefined,
            colIndex:undefined,
            rowSpan:1,
            colSpan:1,
            allowDisconnected:false,
            allowColSpan:false,
            allowRowSpan:false,
            htmlNode:undefined,
            contentHeight:0,

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

        gridSlot.fn = gridSlot.prototype;
        gridSlot.prototype.init.prototype = gridSlot.prototype;

        global.gridSlot = gridSlot;
        log.info("load gridSlot module... [OK]");
    })(compiler.fn);

    (function (global) {
        var gridRow;
        log.info("load gridRow module...");
        gridRow = function (rowText, rowIndex, slots, options) {
            log.debug("row...");
            return new gridRow.prototype.init(rowText, rowIndex, slots, options);
        };
        gridRow.prototype = {
            constructor:gridRow,
            rowText:undefined,
            rowIndex:undefined,
            slots:[],
            length:undefined,
            height:undefined,
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
        gridRow.fn = gridRow.prototype;
        gridRow.prototype.init.prototype = gridRow.prototype;

        global.gridRow = gridRow;
        log.info("load gridRow module... [OK]");
    })(compiler.fn);

    (function (global) {
        var grid;
        log.info("load grid module...");
        grid = function (rows, options) {
            log.debug("grid...");
            return new grid.prototype.init(rows, options);
        };

        grid.prototype = {
            constructor:grid,
            rows:undefined,
            filledSlots:undefined,
            widths:[],
            minWidths:[],
            preferredWidths:[],
            rowNumber:undefined,
            colNumber:undefined,
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
            hasSlot:function hasSlot(slotIdentifier) {
                var result;
                result = this.rows.some(function (row) {
                    var regExp = new RegExp(slotIdentifier);
                    return regExp.exec(row.rowText);
                });
                log.debug("hasSlot " + slotIdentifier + "?", result ? "yes" : "no");
                return result;
            },
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
            display:undefined,
            position:undefined,
            grid:undefined,
            htmlNode:undefined,
            init:function (selectorText, position, display, grid) {
                this.selectorText = selectorText;
                this.display = display;
                this.position = position;
                this.grid = grid;
                this.htmlNode = undefined;
            },
            isRoot:function () {
                return this.position.position === null;
            },
            isLeaf:function () {
                return this.display.grid.length === 0;
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

        function GridBuffer() {
            this._rows = [];
        }

        GridBuffer.prototype = {
            constructor:GridBuffer,
            _rows:[],
            add:function (slot) {
                if (!Array.isArray(this._rows[slot.rowIndex])) {
                    this._rows[slot.rowIndex] = [];
                }
                this._rows[slot.rowIndex][slot.colIndex] = slot;
            },
            getSlot:function (id) {
                var result = [];
                this._rows.forEach(function (row) {
                    row.forEach(function (slot) {
                        if (slot.slotText === id) {
                            result.push(slot);
                        }
                    }, this);
                }, this);
                return result;
            },
            getRows:function () {
                return this._rows;
            },
            getRow:function (index) {
                return this._rows[index];
            }
        };

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
            createTemplate:function (source) {
                var display, grid, gridRows;

                display = source.display;
                grid = null;
                if (display.grid.length > 0) {
                    this._addGrid(source.display);
                    gridRows = this.buffer.getRows().map(function (row, index) {
                        return compiler.fn.gridRow(source.display.grid[index].rowText, index, row, {height:source.display.grid[index].height});
                    }, this);
                    grid = compiler.fn.grid(gridRows, {widths:source.display.widths});
                } else {
                }

                return compiler.fn.template(source.selectorText, source.position, display, grid);
            },
            _addGrid:function (display) {
                if (display.grid.length > 0) {
                    display.grid.forEach(function (row, rowIndex) {
                        this._addGridRow(row, rowIndex, display.widths);

                        //TODO: validate multiple groups
                    }, this);
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

})(window.templateLayout);