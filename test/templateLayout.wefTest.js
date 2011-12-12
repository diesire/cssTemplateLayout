/*!
 * templateLayout tests
 * Copyright (c) 2011 Pablo Escalada
 * MIT Licensed
 */
TestCase("templateLayout", {
    "test templateLayout registration":function () {
        assertNotUndefined(wef.plugins.registered.templateLayout);
        assertEquals("templateLayout", wef.plugins.registered["templateLayout"].name);
    },
    "test templateLayout namespace":function () {
        assertNotUndefined(wef.plugins.templateLayout);
        assertEquals("templateLayout", wef.plugins.templateLayout.name);
    }
});

AsyncTestCase("templateLayoutAsync", {
    "test templateLayout listen cssParser events":function (queue) {
        //requires cssParser
        var text = "body {display-model: \"a (intrinsic), b (intrinsic)\";} div#uno {situated: a; display-model: \"123 (intrinsic)\";}";
        queue.call(function (callbacks) {
            var myCallback = callbacks.add(function () {
                wef.plugins.registered.templateLayout.templateLayout();
                wef.plugins.registered.cssParser.cssParser().parse(text);
            });
            window.setTimeout(myCallback, 5000);
        });

        queue.call(function () {
            var result = wef.plugins.registered.templateLayout.getLastEvent().property;
            //console.log(result);
            assertEquals("display-model", result);
        })
    }
})