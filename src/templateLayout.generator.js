(function (templateLayout) {

    var generator, log;
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
        appendGrid:function (grid, parentNode) {
            var gridNode = document.createElement("table");
            gridNode.className = "templateLayout templateLayoutTable";
            parentNode.appendChild(gridNode);

            if (grid.widths) {
                gridNode.style.tableLayout = "fixed";
                generator.fn.appendCol(gridNode, {widths:grid.widths});
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
            var cellNode = document.createElement("td");
            cellNode.className = "templateLayout templateLayoutCell";
            parentNode.appendChild(cellNode);

            if (slot.rowSpan > 1) {
                cellNode.rowSpan = slot.rowSpan;
            }
            if (slot.colSpan > 1) {
                cellNode.colSpan = slot.colSpan;
            }
            if (slot.height) {
                cellNode.style.height = slot.height;
                cellNode.style.maxHeight = slot.height;
                cellNode.style.overflow = "hidden";
            }
            if (slot.width) {
                cellNode.style.width = slot.width;
                cellNode.style.maxWidth = slot.width;
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