(function (templateLayout) {

    var generator, log;
    log = wef.logger("templateLayout.generator");

    log.info("load generator module...");

    function generateRootTemplate(template) {
        //here is document
        //if template.isLeaf() creates DOM and append to parentDOM
        //else traverse TOM
        var rootElement;

        function generateLeaf(template, parentHtmlNode) {
            log.info("leaf:", template.selectorText, "(parent:", parentHtmlNode.localName, ")");
            var childElement = document.querySelector(template.selectorText);
            parentHtmlNode.appendChild(childElement);
        }

        function generateTemplate(template, parentHtmlNode) {
            var currentNode;

            if (template.isLeaf()) {
                generateLeaf(template, parentHtmlNode);
            } else {
                log.info("no leaf:", template.selectorText, "(parent:", parentHtmlNode.localName, ")");
                currentNode = document.querySelector(template.selectorText);
                parentHtmlNode.appendChild(currentNode);
                currentNode = generator.fn.generateGrid(currentNode);
                template.grid.rows.forEach(function (row) {
                    log.info("row:", row.rowText);
                    currentNode = generator.fn.generateRow(currentNode);
                    row.slotIdentifier.forEach(function (slotId, index, array) {
                        log.info("slot:", slotId.slotText);
                        currentNode = generator.fn.generateCell(currentNode, {rowSpan:slotId.rowSpan, colSpan:slotId.colSpan});
                        //each slot can have multiple elements or none
                        if (template.grid.slots[slotId.slotText]) {
                            template.grid.slots[slotId.slotText].forEach(function (templateInSlot) {
                                log.info("slotELEMENT ", templateInSlot.selectorText);
                                //generate children and append to this container
                                generateTemplate(templateInSlot, currentNode);
                            });
                        }
                        currentNode = currentNode.parentElement;
                    });
                    currentNode = currentNode.parentElement;
                });
                currentNode = currentNode.parentElement;
            }
            log.debug("template generated: ", template);
        }

        rootElement = document.querySelector(template.selectorText);
        generateTemplate(template, rootElement.parentElement);
    }

    generator = function (tom) {
        //TODO: assert(tom)
        return new generator.prototype.init(tom);
    };

    generator.prototype = {
        tom:undefined,
        init:function (tom) {
            this.tom = tom
            return this;
        },
        patchDOM:function () {
            log.info("patch DOM...");
            log.debug("TOM: ", this.tom);
            this.tom.rows.forEach(generateRootTemplate);
        },
        generateGrid:function (parentNode) {
            //create container
            var gridNode = document.createElement("table");
            gridNode.className = "templateLayoutDiv templateLayoutTable";
            //append container to parent
            parentNode.appendChild(gridNode);
            return gridNode;
        },
        generateRow:function (parentNode) {
            //create container
            var rowNode = document.createElement("tr");
            rowNode.className = "templateLayoutDiv templateLayoutRow";
            //append to parent
            parentNode.appendChild(rowNode);
            return rowNode;
        },
        generateCell:function (parentNode, options) {
            //create container
            var cellNode = document.createElement("td");
            if (options && options.rowSpan) {
                cellNode.rowSpan = options.rowSpan;
            }
            if (options && options.colSpan) {
                cellNode.colSpan = options.colSpan;
            }
            cellNode.className = "templateLayoutDiv templateLayoutCell";
            //append to parent
            parentNode.appendChild(cellNode);
            return cellNode;
        }
    };

    generator.fn = generator.prototype;
    generator.prototype.init.prototype = generator.prototype;

    templateLayout.fn.generator = generator;

    log.info("generator module load... [OK]");

})
    (window.templateLayout);
