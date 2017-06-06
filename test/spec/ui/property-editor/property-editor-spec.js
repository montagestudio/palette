/* <copyright>
 </copyright> */
var TestPageLoader = require("montage-testing/testpageloader").TestPageLoader,
    Promise = require("montage/core/promise").Promise;

TestPageLoader.queueTest("property-editor-test", function (testPage) {
    var test;

    beforeAll(function () {
        test = testPage.test;
    });

    describe("property-editor/property-editor-spec", function () {
        var propertyEditor, boundPropertyEditor;

        beforeAll(function (done) {
            propertyEditor = test.propertyEditor;
            boundPropertyEditor = test.boundPropertyEditor;
            Promise.delay(1000).then(done); // wait for draw
        });

        describe("editor on an unbound property described by a property descriptor", function () {
            it("renders a standard property inspector", function () {
                var stringInspector = propertyEditor.element.querySelector(".StringPropertyInspector");
                expect(stringInspector).toBeTruthy();
            });
            it("does not have a delete button", function () {
                var deleteButton = propertyEditor.element.querySelector(".PropertyEditor-deleteButton");
                expect(deleteButton).toBeNull();
            });
            it("can be converted to a binding", function (done) {
                var defineButton = propertyEditor.element.querySelector(".PropertyEditor-defineBindingButton");
                expect(defineButton).toBeTruthy();
                propertyEditor.handleDefineBindingButtonAction();
                Promise.delay(100).then(function () { // wait for draw
                    var cancelButton = propertyEditor.element.querySelector(".PropertyEditor-cancelBindingButton");
                    expect(cancelButton).toBeTruthy();
                    var bindingTargetPaths = propertyEditor.object.bindings.map(function (bindingModel) {
                        return bindingModel.targetPath;
                    });
                    var isBindingSet = bindingTargetPaths.indexOf("propertyA") > -1;
                    expect(isBindingSet).toBeTruthy();
                    done();
                });
            });
        });

        describe("editor on a bound property described by a property descriptor", function () {
            it("renders a binding inspector", function () {
                var bindingInspector = boundPropertyEditor.element.querySelector(".BoundPropertyEditor");
                expect(bindingInspector).toBeTruthy();
            });
            it("does not have a delete button", function () {
                var deleteButton = boundPropertyEditor.element.querySelector(".PropertyEditor-deleteButton");
                expect(deleteButton).toBeNull();
            });
            it("can cancel the binding", function (done) {
                var cancelButton = boundPropertyEditor.element.querySelector(".PropertyEditor-cancelBindingButton");
                expect(cancelButton).toBeTruthy();
                boundPropertyEditor.handleCancelBindingButtonAction();
                Promise.delay(100).then(function () {
                    var defineButton = boundPropertyEditor.element.querySelector(".PropertyEditor-defineBindingButton");
                    expect(defineButton).toBeTruthy();
                    var bindingTargetPaths = boundPropertyEditor.object.bindings.map(function (bindingModel) {
                        return bindingModel.targetPath;
                    });
                    var isBindingSet = bindingTargetPaths.indexOf("propertyB") > -1;
                    expect(isBindingSet).toBeFalsy();
                    done();
                });
            });
        });
    });

});
