(function (templateLayout) {

    var generator, log, lastCalculateWidths = {};
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
        calculateWidths:function (widths, parentNode) {
            var fixedWidths = widths, parentWidth, flexibleColCounter = 0, fixedColSum = 0, found, flexibleWidth;

            if (fixedWidths && parentNode) {
                parentWidth = parentNode.offsetWidth;
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
            if (!fixedWidths && !parentNode) {
                return lastCalculateWidths;
            }
        },
        calculateHeights:function (heights, parentNode) {
            var fixedHeights = heights, parentHeight, flexibleRowCounter = 0, fixedRowSum = 0, found, flexibleHeight;

            if (fixedHeights && parentNode) {
                parentHeight = parentNode.offsetHeight;
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
            if (!fixedHeights && !parentNode) {
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
                for (i = 0; i < slot.colSpan; i++) {
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