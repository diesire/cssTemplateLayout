/*!
 * templateLayout tests
 * Copyright (c) 2011 Pablo Escalada
 * MIT Licensed
 */
module("templateLayout.compiler");

test("col span", function () {
    templateLayout("#parent{display: \"aa\" \"cd\"}").transform({action:"compile"});
    ok(true, "colspan");

    templateLayout("#parent{display: \"..\" \"cd\"}").transform({action:"compile"});
    ok(true, "colspan");

    raises(function () {
        templateLayout("#parent{display: \"aba\" \"def\"}").transform({action:"compile"});
    });

});

test("row span", function () {
    templateLayout("#parent{display: \"ab\" \"ac\"}").transform({action:"compile"});
    ok(true, "rowspan");

    templateLayout("#parent{display: \".b\" \".c\"}").transform({action:"compile"});
    ok(true, "rowspan");

    raises(function () {
        templateLayout("#parent{display: \"ab\" \"cd\" \"af\"}").transform({action:"compile"});
    });
});

test("col+row span", function () {
    templateLayout("#parent{display: \"aa\" \"aa\"}").transform({action:"compile"});
    ok(true, "rowspan");

    templateLayout("#parent{display: \"..\" \"..\"}").transform({action:"compile"});
    ok(true, "rowspan");
});
