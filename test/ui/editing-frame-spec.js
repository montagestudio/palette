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

            describe("once loaded", function () {

                var nextDraw;

                beforeEach(function () {
                    editingFrame.reset();
                    nextDraw = testPage.nextComponentDraw(editingFrame);
                });

                it("should not load without a fileUrl specified", function () {
                    return nextDraw.then(function () {
                        expect(function () {
                            editingFrame.load();
                        }).toThrow();
                    });
                });

                it("should load the specified fileUrl", function () {
                    return nextDraw.then(function () {
                        var componentUrl = require.location + "templates/component.reel";
                        return editingFrame.load(componentUrl).then(function (editingDocument) {
                            var stageUrl = require.location + "stage/index.html?reel-location=" + encodeURIComponent(componentUrl);
                            expect(editingFrame.element.src).toBe(stageUrl);
                        }).timeout(WAITSFOR_TIMEOUT);
                    });
                });

                it("should fulfill an editing document for the loaded reel", function () {
                    return nextDraw.then(function () {
                        var componentUrl = require.location + "templates/component.reel";
                        return editingFrame.load(componentUrl).then(function (editingDocument) {
                            expect(editingDocument).toBeTruthy();
                            expect(editingDocument.fileUrl).toBe(componentUrl);
                        }).timeout(WAITSFOR_TIMEOUT);
                    });
                });


            });

        });

    });
});
