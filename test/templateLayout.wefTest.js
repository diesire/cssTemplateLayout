/*!
 * templateLayout tests
 * Copyright (c) 2011 Pablo Escalada
 * MIT Licensed
 */
TestCase("templateLayout", {
    "test templateLayout registration":function () {
        assertNotUndefined(wef.plugins.registered.templateLayout);
        assertEquals("templateLayout", wef.plugins.registered.templateLayout.name);
    },
    "test templateLayout namespace":function () {
        assertNotUndefined(wef.fn.templateLayout);
        assertEquals("templateLayout", wef.fn.templateLayout.name);
    },
    "test templateLayout transform":function () {
        assertNotUndefined(wef.fn.templateLayout.transform);
    },

    "test templateLayout buffer":function () {
        assertTrue(true);
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
            var result = wef.fn.templateLayout.getLastEvent().data.declaration.property;
            //console.log(result);
            assertEquals("display", result);
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
            //console.log(result);
            assertEquals({property:"display", valueText:"\"abcd\""}, result["body"]);
        })
    },
    "test templateLayout isValidProperty":function (queue) {
        //requires cssParser
        var text = "body {display: \"abcd\"; background-color: red} h1 {position: \"d\"} h2 {position: \"c\"} h3 {position: \"b\"} h4 {position: \"a\"}";
        queue.call(function (callbacks) {
            var myCallback = callbacks.add(function () {
                wef.fn.cssParser.parse(text);
            });
            window.setTimeout(myCallback, 1000);
        });

        queue.call(function () {
            var result = wef.fn.templateLayout.getBuffer();
            //console.log(result);
            assertEquals({property:"display", valueText:"\"abcd\""}, result["body"]);
            assertUndefined(result["body"]["background-color"]);
            assertEquals("\"a\"", result["h4"]["position"]);
            assertEquals("\"abcd\"", result["body"]["display"]);
        })
    }
})