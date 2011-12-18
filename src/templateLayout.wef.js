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

            function readFile(cssFile) {
                function html5ReadFile() {
                    var support = window.File && window.FileReader && window.FileList && window.Blob;
                    if (!support) throw "OperationNotSupportedException";

                    var file;
                    var reader = new FileReader();
                    var result;

                    document.addEventListener("change", function() {
                        file = function handleFiles(evt) {
                                                var files = evt.target.files;
                                                return files[0];
                                                /* now you can work with the file list */
                                            }
                    }, false);




                    // Closure to capture the file information.
                    reader.onload = (function (file) {
                        result = function (e) {
                            // Render thumbnail.
                            var span = document.createElement('span');
                            span.innerHTML = ['<img class="thumb" src="', e.target.result,
                                '" title="', file.name, '"/>'].join('');
                            document.getElementById('list').insertBefore(span, null);
                        };
                        return result;
                    })(file);

                    // Read in the image file as a data URL.
                    reader.readAsText(file);

                }

                function ajaxReadFile() {
                    var request = new XMLHttpRequest();
                    request.open("get", cssFile, false);
                    request.send("");
                    return request.responseText;
                }

                try {
                    return ajaxReadFile(cssFile);
                } catch (e) {
                    return html5ReadFile(cssFile);
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