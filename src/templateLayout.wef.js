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
        authors:["Pablo Escalada <uo1398@uniovi.es>"],
        licenses:["MIT"], //TODO: Licenses

        init:function () {
            document.addEventListener(parser.events.PROPERTY_FOUND, function (e) {
                //console.log(e.data.selectorText, e.data.declaration);
                lastEvent = e;
                //TODO populate TemplateDOM

            }, false);
            return templateLayout;
        },

        getLastEvent:function () {
            return lastEvent;
        }
    };

    var lastEvent = null;

    wef.plugins.register("templateLayout", templateLayout);
})();