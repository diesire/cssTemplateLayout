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
    }
});

AsyncTestCase("templateLayoutAsync", {
    "test templateLayout listen cssParser events":function (queue) {
        //requires cssParser
        var text = "body {display-model: \"a (intrinsic), b (intrinsic)\";} div#uno {situated: a; display-model: \"123 (intrinsic)\";}";
        queue.call(function (callbacks) {
            var myCallback = callbacks.add(function () {
                wef.fn.templateLayout.init();
                wef.fn.cssParser.init().parse(text);
            });
            window.setTimeout(myCallback, 5000);
        });

        queue.call(function () {
            var result = wef.fn.templateLayout.getLastEvent().property;
            //console.log(result);
            assertEquals("display-model", result);
        })
    }
})