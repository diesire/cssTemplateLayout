/*!
 * TemplateLayout Wef plugin
 * Copyright (c) 2011 Pablo Escalada
 * MIT Licensed
 */

//requires: cssParser
var parser = wef.fn.cssParser; //TODO: loader
//exports: templateLayout


(function () {
    var templateLayout = {
        name:"templateLayout",
        version:"0.0.1",
        description:"W3C CSS Template Layout Module",
        authors:["Pablo Escalada <uo1398@uniovies>"],
        licenses:["MIT"], //TODO: Licenses
        constants:{
            DISPLAY:"display-model",
            SITUATION:"situated"
        },

        init:function () {
            root = new Template("", "", "");
            document.addEventListener(parser.events.PROPERTY_FOUND, function (e) {
                console.log(e.data.selectorText, e.data.declaration);
                lastEvent = e;
                //TODO store them
                //buffer.add(e.data.selectorText, e.data.declaration);
                //TODO populate TemplateDOM
                //var model = e.data.declaration.property == this.constants.DISPLAY ? e.data.declaration.valueText : "";
                //var situation = e.data.declaration.property == this.constants.SITUATION ? e.data.declaration.valueText : "";
                //this.add(e.data.selectorText, model, situation);

            }, false);
            return templateLayout;
        },

        transform:function (cssFile) {

            function readFile(url) {
                function ajaxReadFile() {
                    var request = new XMLHttpRequest();
                    request.open("get", url, false);
                    request.send("");
                    return request.responseText;
                }

                try {
                    return ajaxReadFile(url);
                } catch (e) {
                    //TODO: chrome workaround
                    throw "OperationNotSupportedException";
                }

            }

            parser.parse(readFile(cssFile));

        },

        //testing purposes
        getLastEvent:function () {
            return lastEvent;
        }
    };

    var lastEvent = null;

    wef.plugins.register("templateLayout", templateLayout);
})();

function Template(selectorText, model, situated) {
    this.selectorText = selectorText;
    this.model = model;
    this.situated = situated;
}
Template.prototype = {
    model:"",
    selectorText:"",
    situated:""
};