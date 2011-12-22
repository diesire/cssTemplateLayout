/*!
 * templateLayout tests
 * Copyright (c) 2011 Pablo Escalada
 * MIT Licensed
 */
TestCase("templateLayout", {
    "test main":function () {
        assertNotUndefined(templateLayout);
    },
    "test setTemplate":function () {
        //var template = template();
        templateLayout.setTemplate("/test/test/css/template1.css");
    },
    "test xxx":function () {
        templateLayout.setTemplate("/test/test/css/template1.css");
        templateLayout.setTemplate("/test/test/css/template1.css");
    }
});

AsyncTestCase("templateLayoutAsync", {
    "test templateLayout listen cssParser events":function (queue) {
        //requires cssParser
        var text = "body {display: \"a (intrinsic), b (intrinsic)\";} div#uno {situated: a; display: \"123 (intrinsic)\";}";
        queue.call(function (callbacks) {
            var myCallback = callbacks.add(function () {
                wef.fn.cssParser.parse(text);
            });
            window.setTimeout(myCallback, 1000);
        });

        queue.call(function () {
            console.log("--", wef.fn.cssParser.events.PARSER_DONE, templateLayout.getLastEvent());
            assertEquals(wef.fn.cssParser.events.PARSER_DONE, templateLayout.getLastEvent().type);
        });
    },
    "test templateLayout buffer":function (queue) {
        //requires cssParser
        var text = "body {display: \"abcd\"} h1 {position: \"d\"} h2 {position: \"c\"} h3 {position: \"b\"} h4 {position: \"a\"}";
        queue.call(function (callbacks) {
            var myCallback = callbacks.add(function () {
                wef.fn.cssParser.parse(text);
            });
            window.setTimeout(myCallback, 1000);
        });

        queue.call(function () {
            var result = templateLayout.getBuffer();
            assertEquals({"selectorText":"body", "declaration":{"display":"\"abcd\""}}, result["body"]);
        });
    },
    "test templateLayout buffer appending":function (queue) {
        //requires cssParser
        var text = "body {display: \"ab\"} h1 {position: \"a\"; display: \"cd\"} h2 {position: \"b\"} h3 {position: \"c\"} h4 {position: \"d\"}";
        queue.call(function (callbacks) {
            var myCallback = callbacks.add(function () {
                wef.fn.cssParser.parse(text);
            });
            window.setTimeout(myCallback, 1000);
        });

        queue.call(function () {
            var result = templateLayout.getBuffer();
            assertEquals("\"cd\"", result["h1"].declaration["display"]);
            assertEquals("\"a\"", result["h1"].declaration["position"]);
        });
    }
});