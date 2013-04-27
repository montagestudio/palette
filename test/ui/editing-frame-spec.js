var TestPageLoader = require("montage-testing/testpageloader").TestPageLoader;

var WAITSFOR_TIMEOUT = 2000;

TestPageLoader.queueTest("editing-frame/editing-frame", function (testPage) {

    describe("ui/editing-frame-spec", function () {
        var editingFrame;
        beforeEach(function() {
            editingFrame = testPage.test.editingFrame;
        });

        it("should load", function () {
            expect(testPage.loaded).toBeTruthy();
        });

        describe("the editing frame", function () {
            it("should have no default source loaded in the stage", function () {
                expect(editingFrame.element.src).toBeFalsy();
            });

            describe("once loaded", function () {

                var nextDraw;
                beforeEach(function () {
                    editingFrame.reset();
                    nextDraw = testPage.nextDraw();
                });

                it("should not load without a fileUrl specified", function () {
                        expect(function () {
                            editingFrame.load();
                        }).toThrow();

                });

                it("should load the specified fileUrl", function () {
                    return nextDraw.then(function () {
                        var componentUrl = require.location + "templates/component.reel";
                        return editingFrame.load(componentUrl, require.location).then(function (editingDocument) {
                            var stageUrl = require.location + "stage/index.html?reel-location=" + encodeURIComponent(componentUrl) +
                                "&package-location=" + encodeURIComponent(require.location);
                            expect(editingFrame.iframe.src).toBe(stageUrl);
                        }).timeout(WAITSFOR_TIMEOUT);
                    });
                });

                it("should fulfill an editing document for the loaded reel", function () {
                    return nextDraw.then(function () {
                        var componentUrl = require.location + "templates/component.reel";
                        return editingFrame.load(componentUrl, require.location).then(function (editingDocument) {
                            expect(editingDocument).toBeTruthy();
                            expect(editingDocument.owner).toBeTruthy();
                        }).timeout(WAITSFOR_TIMEOUT);
                    });
                });


            });

        });

    });
});
