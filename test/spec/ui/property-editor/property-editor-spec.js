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
        var propertyEditor, boundPropertyEditor, customPropertyEditor,
            boundCustomPropertyEditor, complexBindingEditor;

        beforeAll(function (done) {
            propertyEditor = test.propertyEditor;
            boundPropertyEditor = test.boundPropertyEditor;
            customPropertyEditor = test.customPropertyEditor;
            boundCustomPropertyEditor = test.boundCustomPropertyEditor;
            complexBindingEditor = test.complexBindingEditor;
            Promise.delay(1000).then(done); // wait for draw
        });

        describe("editor on an unbound property described by a property descriptor", function () {
            it("renders a standard property inspector", function () {
                var stringInspector = propertyEditor.element.querySelector(".StringPropertyInspector");
                expect(stringInspector).toBeTruthy();
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
            it("does not have a delete button", function () {
                var deleteButton = propertyEditor.element.querySelector(".PropertyEditor-deleteButton");
                expect(deleteButton).toBeNull();
            });
        });

        describe("editor on a bound property described by a property descriptor", function () {
            it("renders a binding inspector", function () {
                var bindingInspector = boundPropertyEditor.element.querySelector(".BoundPropertyEditor");
                expect(bindingInspector).toBeTruthy();
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
            it("does not have a delete button", function () {
                var deleteButton = boundPropertyEditor.element.querySelector(".PropertyEditor-deleteButton");
                expect(deleteButton).toBeNull();
            });
        });

        describe("editor on an unbound custom property", function () {
            it("renders a standard property inspector", function () {
                var stringInspector = customPropertyEditor.element.querySelector(".StringPropertyInspector");
                expect(stringInspector).toBeTruthy();
            });
            it("can be converted to a binding", function (done) {
                var defineButton = customPropertyEditor.element.querySelector(".PropertyEditor-defineBindingButton");
                expect(defineButton).toBeTruthy();
                customPropertyEditor.handleDefineBindingButtonAction();
                Promise.delay(100).then(function () { // wait for draw
                    var cancelButton = customPropertyEditor.element.querySelector(".PropertyEditor-cancelBindingButton");
                    expect(cancelButton).toBeTruthy();
                    var bindingTargetPaths = customPropertyEditor.object.bindings.map(function (bindingModel) {
                        return bindingModel.targetPath;
                    });
                    var isBindingSet = bindingTargetPaths.indexOf("propertyA") > -1;
                    expect(isBindingSet).toBeTruthy();
                    done();
                });
            });
            it("can be deleted", function (done) {
                var deleteButton = customPropertyEditor.element.querySelector(".PropertyEditor-deleteButton"),
                    object = boundPropertyEditor.object;
                expect(deleteButton).toBeTruthy();
                customPropertyEditor.handleDeleteButtonAction();
                Promise.delay(100).then(function () {
                    expect(object.properties.has("customPropertyA")).toBeFalsy();
                    done();
                });
            });
        });

        describe("editor on an bound custom property", function () {
            it("renders a binding inspector", function () {
                var bindingInspector = boundCustomPropertyEditor.element.querySelector(".BoundPropertyEditor");
                expect(bindingInspector).toBeTruthy();
            });
            it("can cancel the binding", function (done) {
                var cancelButton = boundCustomPropertyEditor.element.querySelector(".PropertyEditor-cancelBindingButton");
                expect(cancelButton).toBeTruthy();
                boundCustomPropertyEditor.handleCancelBindingButtonAction();
                Promise.delay(100).then(function () {
                    var defineButton = boundCustomPropertyEditor.element.querySelector(".PropertyEditor-defineBindingButton");
                    expect(defineButton).toBeTruthy();
                    var bindingTargetPaths = boundCustomPropertyEditor.object.bindings.map(function (bindingModel) {
                        return bindingModel.targetPath;
                    });
                    var isBindingSet = bindingTargetPaths.indexOf("propertyB") > -1;
                    expect(isBindingSet).toBeFalsy();
                    done();
                });
            });
            it("can be deleted", function (done) {
                var deleteButton = boundCustomPropertyEditor.element.querySelector(".PropertyEditor-deleteButton"),
                    object = boundPropertyEditor.object;
                expect(deleteButton).toBeTruthy();
                boundCustomPropertyEditor.handleDeleteButtonAction();
                Promise.delay(100).then(function () {
                    expect(object.properties.has("customPropertyA")).toBeFalsy();
                    done();
                });
            });
        });

        describe("editor on a complex custom binding", function () {
            it("renders a binding inspector", function () {
                var bindingInspector = complexBindingEditor.element.querySelector(".BoundPropertyEditor");
                expect(bindingInspector).toBeTruthy();
            });
            it("does not have a defineBinding or cancelBinding button", function () {
                var defineButton = complexBindingEditor.element.querySelector(".PropertyEditor-defineBindingButton"),
                    cancelButton = complexBindingEditor.element.querySelector(".PropertyEditor-cancelBindingButton");
                expect(defineButton).toBeNull();
                expect(cancelButton).toBeNull();
            });
            it("can be deleted", function (done) {
                var deleteButton = complexBindingEditor.element.querySelector(".PropertyEditor-deleteButton"),
                    object = boundPropertyEditor.object;
                expect(deleteButton).toBeTruthy();
                complexBindingEditor.handleDeleteButtonAction();
                Promise.delay(100).then(function () {
                    expect(object.properties.has("customPropertyA")).toBeFalsy();
                    done();
                });
            });
        });
    });

});