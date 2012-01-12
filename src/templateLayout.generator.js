(function (templateLayout) {

    var generator, log;
    log = wef.logger("templateLayout.generator");

    log.info("load generator module");

    function generateRootTemplate(template) {
        //here is document
        //if template.isLeaf() creates DOM and append to parentDOM
        //else traverse TOM

        function generateLeaf(template, parentHtmlNode) {
            log.info("leaf:", template.selectorText, "(parent:", parentHtmlNode.localName, ")");
            var childElement = document.querySelector(template.selectorText);
            parentHtmlNode.appendChild(childElement);
        }

        function generateTemplate(template, parentHtmlNode) {
            var rootElement, tableDiv, rowDiv, cellDiv;

            if (template.isLeaf()) {
                generateLeaf(template, parentHtmlNode);
            } else {
                log.info("no leaf:", template.selectorText, "(parent:", parentHtmlNode.localName, ")");
                rootElement = document.querySelector(template.selectorText);
                parentHtmlNode.appendChild(rootElement);

                //create container
                tableDiv = document.createElement("div");
                tableDiv.className = "templateLayoutDiv templateLayoutTable";
                tableDiv.style.display = "table";
                //append container to parent
                rootElement.appendChild(tableDiv);

                template.grid.rows.forEach(function (row) {
                    log.info("row:", row.rowText);

                    //create container
                    rowDiv = document.createElement("div");
                    rowDiv.className = "templateLayoutDiv templateLayoutRow";
                    rowDiv.style.display = "table-row";
                    //append to parent
                    tableDiv.appendChild(rowDiv);

                    row.slotIdentifier.forEach(function (slotId) {
                        log.info("slot:", slotId.slotText);
                        //each slot can have multiple elements
                        template.grid.slots[slotId.slotText].forEach(function (templateInSlot) {
                            log.info("slotELEMENT ", templateInSlot.selectorText);

                            //create container
                            cellDiv = document.createElement("div");
                            cellDiv.className = "templateLayoutDiv templateLayoutCell";
                            cellDiv.style.display = "table-cell";
                            rowDiv.appendChild(cellDiv);
                            //generate children and append to this container
                            generateTemplate(templateInSlot, cellDiv);
                        });
                    });
                });
            }
            log.debug("template generated: ", template);
        }

        var rootElement = document.querySelector(template.selectorText);
        generateTemplate(template, rootElement.parentElement);
    }

    generator = function () {
        return this;
    };

    generator.prototype = {
        patchDOM:function (tom) {
            log.info("patch DOM...");
            log.debug("TOM: ", tom);
            tom.rows.forEach(generateRootTemplate);
        }
    };

    templateLayout.fn.generator = new generator();

    log.info("generator module load... [OK]");

})(window.templateLayout);
