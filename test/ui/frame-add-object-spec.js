var Montage = require("montage").Montage,
    TestPageLoader = require("test/support/testpageloader").TestPageLoader;

var testPage = TestPageLoader.queueTest("frame", function () {
    describe("ui/frame-add-object-spec", function () {

        var test = testPage.test;

        it("should load", function () {
            expect(testPage.loaded).toBeTruthy();
        });

        describe("the montage frame", function () {

            var montageFrame = test.montageFrame,
                owner,
                done;

            beforeEach(function () {
                montageFrame.load().then(function (fufilledOwner) {
                    owner = fufilledOwner;
                });

                waitsFor(function () {
                    return owner;
                }, "MontageFrame to load owner component", 100);

                done = false;
            });

            describe("adding an object with no properties", function () {

                var addedObject;

                beforeEach(function () {
                    var objectPromise = montageFrame.addObject("montage/ui/controller/array-controller", "ArrayController");

                    objectPromise.then(function (fufilledObject) {
                        addedObject = fufilledObject;
                    });

                    waitsFor(function () {
                        return !!addedObject;
                    }, "MontageFrame to addObject", 100);
                });

                it("should create the expectedObject", function () {
                    //TODO create a matcher for this sort of test
                    expect(addedObject._montage_metadata.objectName).toBe("ArrayController");
                    expect(addedObject._montage_metadata.isInstance).toBeTruthy();
                });

                it("should provide a generated identifier for the object", function () {
                    expect(addedObject.identifier).toMatch(/ArrayController\d+/);
                });

            });

        });

    });
});
