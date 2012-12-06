var Montage = require("montage").Montage,
    TestPageLoader = require("test/support/testpageloader").TestPageLoader;

var WAITSFOR_TIMEOUT = 2000;

var testPage = TestPageLoader.queueTest("editing-frame", function () {
    var test = testPage.test;

    describe("ui/editing-frame-spec", function () {
        it("should load", function () {
            expect(testPage.loaded).toBeTruthy();
        });

        describe("the editing frame", function () {

            var editingFrame = test.editingFrame,
                stageDoc = editingFrame.element.contentWindow.document,
                stageHead = editingFrame.element.contentWindow.document.head,
                stageBody = editingFrame.element.contentWindow.document.body;

            it("should have no default source loaded in the stage", function () {
                expect(editingFrame.element.src).toBeFalsy();
            });

        });

    });
});
