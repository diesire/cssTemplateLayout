/*!
 * TemplateLayout Wef plugin
 * Copyright (c) 2011 Pablo Escalada
 * MIT Licensed
 */

//requires: cssParser
//exports: templateLayout
(function () {
    var templateLayout = {
        name:"templateLayout",
        version:"0.0.1",
        description:"W3C CSS Template Layout Module",
        authors:["Pablo Escalada <uo1398@uniovi.es>"],
        licenses:["MIT"], //TODO: Licenses
        init:function () {

            document.addEventListener('propertyFound', function (e) {
                // e.target matches the elem from above
                lastEvent = e;
                //console.log(lastEvent.property);
            }, false);
            return templateLayout;
        },
        getLastEvent:function () {
            return lastEvent;
        }
    };
    var lastEvent = 0;

    wef.plugins.register("templateLayout", templateLayout);
})();