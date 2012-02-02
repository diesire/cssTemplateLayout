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

    generator = function (tom) {
        //TODO: assert(tom)
        return new generator.prototype.init(tom);
    };

    generator.prototype = {
        tom:undefined,
        init:function (tom) {
            this.tom = tom;
            return this;
        },
        patchDOM:function () {
            log.info("patch DOM...");
            log.debug("TOM: ", this.tom);
            generator.fn.resetCSS();
            this.tom.rows.forEach(generateRootTemplate);
        },
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
        setGridNodeWidth:function (gridNode, computedWidths) {
            gridNode.style.tableLayout = "fixed";
            gridNode.width = computedWidths.totalWidth;
        },
        setGridNodeHeight:function (gridNode, computedHeights) {
            gridNode.style.height = computedHeights.totalHeight + "px";
            gridNode.style.maxHeight = computedHeights.totalHeight + "px";
        },
        setColNodeWidth:function (colNode, computedWidths) {
            colNode.forEach(function (node, index) {
                node.width = computedWidths.colWidth[index];
                node.style.maxWidth = computedWidths.colWidth[index] + "px";
            });
        },
        setRowNodeHeight:function (rowNode, computedHeights, rowIndex) {
            rowNode.style.height = computedHeights.rowHeight[rowIndex] + "px";
            rowNode.style.maxHeight = computedHeights.rowHeight[rowIndex] + "px";
        },
        setSlotNodeWidth:function (slotNode, computedWidths, colIndex) {
            var i, width = 0;
            for (i = 0; i < slotNode.colSpan; i++) {
                width += computedWidths.colWidth[colIndex + i];
            }
            slotNode.style.width = width + "px";
            slotNode.style.maxWidth = width + "px";
        },
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
        getGridNode:function (templateNode) {
            return templateNode.childNodes[0];
        },
        getColumnNodes:function (gridNode, columns) {
            var i, columnNodes = [];
            for (i = 0; i < columns; i++) {
                columnNodes.push(gridNode.childNodes[i]);
            }
            return columnNodes;
        },
        getRowNode:function (gridNode, index, columns) {
            return gridNode.childNodes[columns + index];
        },
        getPixels:function (dimension, max) {
            var found = dimension.match(/(\d+)(px|%)/);
            if (found[2] === "%") {
                return parseInt(found[1], 10) * max / 100;
            }
            if (found[2] === "px") {
                return parseInt(found[1], 10);
            }
        },
        computeRowHeights:function (template) {
            var result = {
                totalHeight:undefined,
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
            //            result.totalHeight = tmp.reduce(function (previous, height) {
            //                return previous + height;
            //            }, 0);
            result.totalHeight = (fixedHeights * 100) / (100 - relativeHeights);
            result.rowHeight = tmp;
            return result;
        },
        computeColWidths:function (availableWidth, template) {
            var result = {
                totalWidth:undefined,
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
        appendGrid:function (grid, parentNode) {
            var gridNode = document.createElement("table");
            gridNode.className = "templateLayout templateLayoutTable";
            parentNode.appendChild(gridNode);
            generator.fn.appendCol(gridNode, grid.colNumber);
            return gridNode;
        },
        appendCol:function (parentNode, colNumber) {
            var i, colNode;
            for (i = 0; i < colNumber; i++) {
                colNode = document.createElement("col");
                colNode.className = "templateLayout templateLayoutCol";
                parentNode.appendChild(colNode);
            }
        },
        appendRow:function (row, parentNode) {
            var rowNode = document.createElement("tr");
            rowNode.className = "templateLayout templateLayoutRow";
            parentNode.appendChild(rowNode);
            return rowNode;
        },
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
        appendVirtualNode:function (parentNode) {
            var extraNode = document.createElement("div");
            extraNode.className = "templateLayout templateLayoutVirtualNode";
            parentNode.appendChild(extraNode);
            return extraNode;
        },
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