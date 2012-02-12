(function (templateLayout) {

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