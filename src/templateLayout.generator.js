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
                currentNode = generator.fn.appendGrid(currentNode);
                template.grid.rows.forEach(function (row) {
                    log.info("row:", row.rowText);
                    currentNode = generator.fn.appendRow(currentNode);
                    row.slotIdentifier.forEach(function (slotId) {
                        log.info("slot:", slotId.slotText);
                        currentNode = generator.fn.appendCell(currentNode, {rowSpan:slotId.rowSpan, colSpan:slotId.colSpan});
                        //each slot can have multiple elements or none
                        if (template.grid.slots[slotId.slotText]) {
                            template.grid.slots[slotId.slotText].forEach(function (templateInSlot) {
                                log.info("slotELEMENT ", templateInSlot.selectorText);
                                //generate children and append to this container
                                generateTemplate(templateInSlot, currentNode);
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
            this.tom.rows.forEach(generateRootTemplate);
        },
        appendGrid:function (parentNode) {
            //create container
            var gridNode = document.createElement("table");
            gridNode.className = "templateLayoutTable";
            //append container to parent
            parentNode.appendChild(gridNode);
            return gridNode;
        },
        appendRow:function (parentNode) {
            //create container
            var rowNode = document.createElement("tr");
            rowNode.className = "templateLayoutRow";
            //append to parent
            parentNode.appendChild(rowNode);
            return rowNode;
        },
        appendCell:function (parentNode, options) {
            //create container
            var cellNode = document.createElement("td");
            if (options && options.rowSpan) {
                cellNode.rowSpan = options.rowSpan;
            }
            if (options && options.colSpan) {
                cellNode.colSpan = options.colSpan;
            }
            cellNode.className = "templateLayoutCell";
            //append to parent
            parentNode.appendChild(cellNode);
            return cellNode;
        },
        appendVirtualNode:function (parentNode) {
            var extraNode = document.createElement("div");
            extraNode.className = "templateLayoutExtra";
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