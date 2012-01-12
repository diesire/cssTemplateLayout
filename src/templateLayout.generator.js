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
            var currentNode, tableDiv, rowDiv, cellDiv;

            if (template.isLeaf()) {
                generateLeaf(template, parentHtmlNode);
            } else {
                log.info("no leaf:", template.selectorText, "(parent:", parentHtmlNode.localName, ")");
                currentNode = document.querySelector(template.selectorText);
                parentHtmlNode.appendChild(currentNode);

                //create container
                tableDiv = document.createElement("table");
                tableDiv.className = "templateLayoutDiv templateLayoutTable";
                //append container to parent
                currentNode.appendChild(tableDiv);

                template.grid.rows.forEach(function (row) {
                    log.info("row:", row.rowText);

                    //create container
                    rowDiv = document.createElement("tr");
                    rowDiv.className = "templateLayoutDiv templateLayoutRow";
                    //append to parent
                    tableDiv.appendChild(rowDiv);

                    row.slotIdentifier.forEach(function (slotId) {
                        log.info("slot:", slotId.slotText);
                        //each slot can have multiple elements or none
                        //create container
                        cellDiv = document.createElement("td");
                        cellDiv.className = "templateLayoutDiv templateLayoutCell";
                        rowDiv.appendChild(cellDiv);
                        if (template.grid.slots[slotId.slotText]) {
                            template.grid.slots[slotId.slotText].forEach(function (templateInSlot) {
                                log.info("slotELEMENT ", templateInSlot.selectorText);
                                //generate children and append to this container
                                generateTemplate(templateInSlot, cellDiv);
                            });
                        }
                    });
                });
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
        tom: undefined,
        init: function(tom) {
            this.tom = tom
            return this;
        },
        patchDOM:function () {
            log.info("patch DOM...");
            log.debug("TOM: ", this.tom);
            this.tom.rows.forEach(generateRootTemplate);
        }
    };

    generator.fn = generator.prototype;
    generator.prototype.init.prototype = generator.prototype;

    templateLayout.fn.generator = generator;

    log.info("generator module load... [OK]");

})(window.templateLayout);
