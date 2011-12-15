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
            DISPLAY_MODEL:"display-model",
            SITUATED:"situated"
        },

        init:function () {
            root = new Template("", "", "");
            document.addEventListener(parser.events.PROPERTY_FOUND, function (e) {
                console.log(e.data.selectorText, e.data.declaration);
                lastEvent = e;
                //TODO populate TemplateDOM
                var model = e.data.declaration.property == this.constants.DISPLAY_MODEL ? e.data.declaration.valueText : "";
                var situation = e.data.declaration.property == this.constants.SITUATED ? e.data.declaration.valueText : "";
                this.add(e.data.selectorText, model, situation);

            }, false);
            return templateLayout;
        },
        add:function (selector, model, situated) {
            //no situated
            if (situated == "") {
                root.add(new Template(selector, model, situated));
            } else {
                throw "Operation not implemented";
                //situated
                //root.search(function (template) {}).add(new Template(selector, model, situated));
            }


        },
        getLastEvent:function () {
            return lastEvent;
        }
    };

    var lastEvent = null;
    var root = null;

    wef.plugins.register("templateLayout", templateLayout);
})();

function Template(selectorText, model, situated) {
    this.selectorText = selectorText;
    this.model = model;
    this.situated = situated;
}
Template.prototype = {
    childTemplates:{},
    model:"",
    selectorText:"",
    situated:"",
    situation:"",
    isContainer:function () {
        return true;
    },
    add:function (child) {
        this.childTemplates[child.selectorText] = child;
    }
};