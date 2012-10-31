var Montage = require("montage").Montage,
    TestPageLoader = require("test/support/testpageloader").TestPageLoader;

var testPage = TestPageLoader.queueTest("frame", function () {
    describe("ui/frame-add-component-spec", function () {

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

            describe("adding a component", function () {

                var addedComponent;

                beforeEach(function () {
                    var componentPromise = montageFrame.addComponent("montage/ui/button.reel", "Button", '<button data-montage-id="myButton"></button>');

                    componentPromise.then(function (fufilledComponent) {
                        addedComponent = fufilledComponent;
                    });

                    waitsFor(function () {
                        return !!addedComponent;
                    }, "MontageFrame to addComponent", 100);
                });

                it("should add the component as belonging to the owner", function () {
                    expect(addedComponent.ownerComponent).toBe(owner);
                });

                it("should add the component as a child of the owner", function () {
                    expect(addedComponent.parentComponent).toBe(owner);
                });

                it("should add the component's element as a child of the owner's element", function () {
                    expect(addedComponent.element.parentNode).toBe(owner.element);
                });

            });

        });

    });
});
