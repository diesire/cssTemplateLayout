/*!
 * templateLayout tests
 * Copyright (c) 2011 Pablo Escalada
 * MIT Licensed
 */
TestCase("templateLayout", {
    "test registration":function () {
        assertNotUndefined(wef.plugins.registered.templateLayout);
        assertEquals("templateLayout", wef.plugins.registered.templateLayout.name);
    },
    "test namespace":function () {
        assertNotUndefined(wef.fn.templateLayout);
        assertEquals("templateLayout", wef.fn.templateLayout.name);
    },
    "test transform":function () {
        assertNotUndefined(wef.fn.templateLayout.setTemplate);
    },

    "test setTemplate":function () {
        wef.fn.templateLayout.setTemplate("/test/plugins/templateLayout/test/css/template1.css");
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
            assertEquals(wef.fn.cssParser.events.PARSER_DONE, wef.fn.templateLayout.getLastEvent().type);
        })
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
            var result = wef.fn.templateLayout.getBuffer();
            assertEquals({"selectorText":"body","declaration":{"display":"\"abcd\""}}, result["body"]);
        })
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
            var result = wef.fn.templateLayout.getBuffer();
            assertEquals("\"cd\"", result["h1"].declaration["display"]);
            assertEquals("\"a\"", result["h1"].declaration["position"]);
        })
    }
})