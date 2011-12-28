/*!
 * templateLayout tests
 * Copyright (c) 2011 Pablo Escalada
 * MIT Licensed
 */

module("CSSTemplateLayout");

test("namespace", function() {
    notEqual(templateLayout, undefined);
});

test("public methods", function() {
    notEqual(templateLayout.setTemplate, undefined);
    notEqual(templateLayout.insertTemplate, undefined);
    notEqual(templateLayout.getLastEvent, undefined);
    notEqual(templateLayout.getBuffer, undefined);
    notEqual(templateLayout.preprocess, undefined);
    notEqual(templateLayout.compile, undefined);
});

test("", function() {
    var templateSource = "body {display: \"ab\"} h1 {position: a; display: \"cd\"} h2 {position: b} h3 {position: c} h4 {position: d}";
    templateLayout.insertTemplate(templateSource);
});