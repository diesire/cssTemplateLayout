/*!
 * templateLayout tests
 * Copyright (c) 2011 Pablo Escalada
 * MIT Licensed
 */
var isChrome = /chrome/i.exec(navigator.appVersion);
var defaultTemplate = "body {display: \"ab\"} h1 {position: a} h2 {position: b}";

module("CSSTemplateLayout");

test("namespace", function () {
    notEqual(templateLayout, undefined, "is templateLayout namespace defined?");
    equal(typeof templateLayout, "function", "is templateLayout a function?");
});

test("templateLayout.fn", function () {
    notEqual(typeof templateLayout.fn, undefined, "is templateLayout.fn defined ?");
});

test("constructor", function () {
    var templateSource = "body {display: \"ab\"} h1 {position: a} h2 {position: b}";

    //can't load remote files from local ones
    //equal(templateLayout("http://www.uniovi.es/TemaUniovi2010/css/layout.css").templateSources[0].type, "http", "loading remote css file");
    //equal(templateLayout("https://example.com/template.css").templateSources[0].type, "http", "loading remote css file");
    //equal(templateLayout("file://localhost/template.css").templateSources[0].type, "file", "loading local css file");

    if (!isChrome) {
        //Chrome can't load local files from local files
        var aux  = templateLayout().templateSources[0].type;
        ok(aux === "file"||aux === "http", "calling empty constructor");
        equal(templateLayout("template.css").templateSources[0].type, "file", "loading local css file");
        equal(templateLayout("css/template.css").templateSources[0].type, "file", "loading local css file");
        equal(templateLayout("./css/template.css").templateSources[0].type, "file", "loading local css file");
        equal(templateLayout("../test/css/template.css").templateSources[0].type, "file", "loading local css file");
    }
    equal(templateLayout(templateSource).templateSources[0].type, "css", "loading css string");

    equal(templateLayout(templateSource, templateSource, templateSource).templateSources[0].type, "css", "loading multiple css string");
    //equal(templateLayout(templateSource, "../css/template.css", "https://example.com/template.css").templateSources[0].type, "mixed", "loading multiple css string");
});

test("public properties", function () {
    equal(typeof templateLayout.fn.version, "string", "tl().version");
});

test("public methods", function () {
    //old ones, deleted
    equal(templateLayout(defaultTemplate).setTemplate, undefined, "setTemplate no longer supported");
    equal(templateLayout(defaultTemplate).insertTemplate, undefined, "insertTemplate no longer supported");
    equal(templateLayout(defaultTemplate).preprocess, undefined, "preprocess no longer supported");
    equal(templateLayout(defaultTemplate).compile, undefined, "compile no longer supported");

    //testing
    notEqual(templateLayout(defaultTemplate).getBuffer, undefined, "getBuffer");

    //new ones
    notEqual(templateLayout(defaultTemplate).transform, undefined, "transform is a public method");
});

test("transform options", function () {
    var templateSource = "body {display: \"ab\"} h1 {position: a} h2 {position: b}",
        result;
    templateLayout(templateSource).transform({action:"none"});
    result = templateLayout(templateSource).transform({action:"parse"}).getBuffer();
    wef.logger().info("buffer: ", result);
    result = templateLayout(templateSource).transform({action:"compile"}).getTOM();
    wef.logger().info("TOM: ", result);
});