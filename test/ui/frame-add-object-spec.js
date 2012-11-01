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
                owner;

            beforeEach(function () {
                montageFrame.load().then(function (fufilledOwner) {
                    owner = fufilledOwner;
                });

                waitsFor(function () {
                    return owner;
                }, "MontageFrame to load owner component", 100);
            });

            describe("adding an object with no properties", function () {

                var addedObject;

                beforeEach(function () {
                    var objectPromise = montageFrame.addObject("montage/ui/controller/array-controller", "ArrayController");

                    objectPromise.then(function (fulfilledObject) {
                        addedObject = fulfilledObject;
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

            describe("adding an object with initial properties", function () {

                var addedObject,
                    identifier = "peopleController";

                beforeEach(function () {
                    var objectPromise = montageFrame.addObject("montage/ui/controller/array-controller", "ArrayController", {
                        identifier: identifier
                    });

                    objectPromise.then(function (fulfilledObject) {
                        addedObject = fulfilledObject;
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
                    expect(addedObject.identifier).toBe(identifier);
                });

            });

            describe("adding multiple objects", function () {

                var addedObject1, addedObject2;

                beforeEach(function () {
                    montageFrame.addObject("montage/ui/controller/array-controller", "ArrayController", {
                        identifier: "firstController"
                    }).then(function (fulfilledObject) {
                        addedObject1 = fulfilledObject;
                    });

                    montageFrame.addObject("montage/ui/controller/array-controller", "ArrayController", {
                        identifier: "secondController"
                    }).then(function (fulfilledObject) {
                        addedObject2 = fulfilledObject;
                    });

                    waitsFor(function () {
                        return addedObject1 && addedObject2;
                    }, "MontageFrame to addObjects", 100);
                });

                it("should create the expectedObjects", function () {
                    expect(addedObject1._montage_metadata.objectName).toBe("ArrayController");
                    expect(addedObject1._montage_metadata.isInstance).toBeTruthy();

                    expect(addedObject2._montage_metadata.objectName).toBe("ArrayController");
                    expect(addedObject2._montage_metadata.isInstance).toBeTruthy();
                });

                it("should have the expected properties", function () {
                    expect(addedObject1.identifier).toBe("firstController");
                    expect(addedObject2.identifier).toBe("secondController");
                });

            });


        });

    });
});
