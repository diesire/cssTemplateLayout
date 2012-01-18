(function (templateLayout) {

    var generator, log, lastCalculateWidths = {};
    log = wef.logger("templateLayout.generator");

    log.info("load generator module...");

    function generateRootTemplate(template) {
        var rootElement;

        function generateLeaf(template, parentHtmlNode) {
            log.info("leaf:", template.selectorText, "(parent:", parentHtmlNode.localName, ")");
            generator.fn.appendTemplate(template, parentHtmlNode);
        }

        function generateTemplate(template, parentHtmlNode) {
            var currentNode;

            if (template.isLeaf()) {
                generateLeaf(template, parentHtmlNode);
            } else {
                log.info("no leaf:", template.selectorText, "(parent:", parentHtmlNode.localName, ")");
                //if template selector not found in DOM, create new DIV???
                currentNode = generator.fn.appendTemplate(template, parentHtmlNode);
                currentNode = generator.fn.appendGrid(template.grid, currentNode);
                template.grid.rows.forEach(function (row) {
                    log.info("row:", row.rowText);
                    currentNode = generator.fn.appendRow(row, currentNode);
                    row.slots.forEach(function (slot) {
                        log.info("slot:", slot.slotText);
                        currentNode = generator.fn.appendSlot(slot, currentNode);
                        //each slot can have multiple elements or none
                        if (template.grid.filledSlots[slot.slotText]) {
                            template.grid.filledSlots[slot.slotText].forEach(function (childTemplate) {
                                log.info("slotELEMENT ", childTemplate.selectorText);
                                //generate children and append to this container
                                generateTemplate(childTemplate, currentNode);
                            });
                        }
                        currentNode = currentNode.parentNode;
                    });
                    currentNode = currentNode.parentNode;
                });
                currentNode = currentNode.parentNode;
            }
            log.debug("template generated: ", template);
        }

        rootElement = document.querySelector(template.selectorText);
        generateTemplate(template, rootElement.parentNode);
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
                cssstring = [
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
                styletag = document.createElement('style');
            styletag.setAttribute('type', 'text/css');
            head.appendChild(styletag);
            styletag.innerHTML = cssstring;
        },
        calculateWidths:function (widths, parentnode) {
            var fixedWidths = widths, parentWidth, flexibleColCounter = 0, fixedColSum = 0, found, flexibleWidth;

            if (fixedWidths && parentnode) {
                parentWidth = parentnode.offsetWidth;
                fixedWidths.forEach(function (width, index) {
                    if (width === "*") {
                        flexibleColCounter++;
                    } else {
                        found = width.match(/(\d+)(px|%)/);
                        if (found[2] !== "%") {
                            fixedColSum += parseInt(found[1], 10);
                        } else {
                            fixedWidths[index] = String(parseInt(found[1], 10) * parentWidth / 100) + "px";
                            fixedColSum += parseInt(found[1], 10) * parentWidth / 100;
                        }
                    }
                });
                flexibleWidth = (flexibleColCounter > 0) ? parseInt((parentWidth - fixedColSum) / flexibleColCounter, 10) : 0;
                lastCalculateWidths.parentWidth = parentWidth;
                lastCalculateWidths.widths = fixedWidths.map(function (width) {
                    if (width === "*") {
                        return "" + flexibleWidth + "px";
                    }
                    if (width === "auto") {
                        return "auto";
                    }
                    if (/(\d+)(px|%)/.test(width)) {
                        return width;
                    }
                    //no more use cases

                });
                return lastCalculateWidths;
            }
            if (!fixedWidths && !parentnode) {
                return lastCalculateWidths;
            }
        },
        calculateHeights:function (heights, parentnode) {
            var fixedHeights = heights, parentHeight, flexibleColCounter = 0, fixedColSum = 0, found, flexibleHeight;

            if (fixedHeights && parentnode) {
                parentHeight = parentnode.offsetHeight;
                fixedHeights.forEach(function (height, index) {
                    if (height === "*") {
                        flexibleColCounter++;
                    } else {
                        found = height.match(/(\d+)(px|%)/);
                        if (found[2] !== "%") {
                            fixedColSum += parseInt(found[1], 10);
                        } else {
                            fixedHeights[index] = String(parseInt(found[1], 10) * parentHeight / 100) + "px";
                            fixedColSum += parseInt(found[1], 10) * parentHeight / 100;
                        }
                    }
                });
                flexibleHeight = (flexibleColCounter > 0) ? parseInt((parentHeight - fixedColSum) / flexibleColCounter, 10) : 0;
                lastCalculateHeights.parentHeight = parentHeight;
                lastCalculateHeights.heights = fixedHeights.map(function (height) {
                    if (height === "*") {
                        return "" + flexibleHeight + "px";
                    }
                    if (height === "auto") {
                        return "auto";
                    }
                    if (/(\d+)(px|%)/.test(height)) {
                        return height;
                    }
                    //no more use cases

                });
                return lastCalculateHeights;
            }
            if (!fixedHeights && !parentnode) {
                return lastCalculateHeights;
            }
        },
        appendGrid:function (grid, parentNode) {
            var fixedWidths, gridNode = document.createElement("table");
            gridNode.className = "templateLayout templateLayoutTable";
            parentNode.appendChild(gridNode);

            if (grid.widths.length !== 0) {
                fixedWidths = generator.fn.calculateWidths(grid.widths, parentNode);
                gridNode.style.tableLayout = "fixed";
                gridNode.style.width = fixedWidths.parentWidth;
                generator.fn.appendCol(gridNode, {widths:fixedWidths.widths});
            } else {
                gridNode.style.width = "100%";
            }

            return gridNode;
        },
        appendCol:function (parentNode, options) {
            if (options && options.widths) {
                options.widths.forEach(function (width) {
                    var colNode = document.createElement("col");
                    colNode.className = "templateLayout templateLayoutCol";
                    colNode.style.width = width;
                    colNode.style.maxWidth = width;
                    //append to parent
                    parentNode.appendChild(colNode);
                });
            }
        },
        appendRow:function (row, parentNode) {
            var rowNode = document.createElement("tr");
            rowNode.className = "templateLayout templateLayoutRow";
            parentNode.appendChild(rowNode);

            if (row.height) {
                rowNode.style.height = row.height;
                rowNode.style.maxHeight = row.height;
            }
            return rowNode;
        },
        appendSlot:function (slot, parentNode) {
            //create container
            var width = 0,
                height = 0,
                cellNode = document.createElement("td"),
                i;
            cellNode.className = "templateLayout templateLayoutCell";
            parentNode.appendChild(cellNode);

            if (slot.rowSpan > 1) {
                cellNode.rowSpan = slot.rowSpan;
            }
            if (slot.colSpan > 1) {
                cellNode.colSpan = slot.colSpan;
            }
            if (slot.height) {
                for (i = 1; i < slot.rowSpan; i++) {
                    height += generator.fn.calculateHeigths().height[slot.rowIndex];
                }
                cellNode.style.height = height;
                cellNode.style.maxHeight = height;
                cellNode.style.overflow = "hidden";
            }
            if (slot.width) {
                for (i = 1; i < slot.colSpan; i++) {
                    width += generator.fn.calculateWidths().widths[slot.colIndex];
                }
                cellNode.style.width = width;
                cellNode.style.maxWidth = width;
                cellNode.style.overflow = "hidden";
            }

            return cellNode;
        },
        appendVirtualNode:function (parentNode) {
            var extraNode = document.createElement("div");
            extraNode.className = "templateLayout templateLayoutExtra";
            extraNode.style.width = "100%";
            parentNode.appendChild(extraNode);
            return extraNode;
        },
        appendTemplate:function (template, parentNode) {
            var templateNode = document.querySelector(template.selectorText) || generator.fn.appendVirtualNode(parentNode);
            parentNode.appendChild(templateNode);
            return templateNode;
        }
    };

    generator.fn = generator.prototype;
    generator.prototype.init.prototype = generator.prototype;

    templateLayout.fn.generator = generator;

    log.info("generator module load... [OK]");

})(window.templateLayout);