var Montage = require("montage").Montage,
    EditingProxy = require("palette/core/editing-proxy").EditingProxy;

describe("core/editing-proxy-spec", function () {

    var proxy, label, serialization, exportId, editingDocument;

    beforeEach(function () {
        exportId = "foo/bar/baz";
        label = "myObject";
        serialization = {
            prototype: exportId,
            properties: {}
        };
        editingDocument = {
            url: "palette/test",
            packageRequire: {
                location: "montage/core/promise"
            }
        }
        proxy = new EditingProxy().init(label, serialization, exportId, editingDocument);
    });

    describe("initialization", function () {

        it("should have the expected label", function () {
            expect(proxy.label).toBe(label);
        });

        it("should have the expected editingDocument", function () {
            expect(proxy.editingDocument).toBe(editingDocument);
        });

        it("should always initialize the next target to be the document", function() {
            expect(proxy.nextTarget).toBe(editingDocument);
        });

        it("should properly extract the moduleId from the exportId string", function() {
            expect(proxy.moduleId).toEqual(exportId);
        });

        it("should generate the correct export name", function() {
            expect(proxy.exportName).toEqual("Baz");
        });

    });

    describe("preserving the original serialization as a map", function () {

        beforeEach(function () {
            serialization = {
                prototype: exportId,
                properties: {},
                foo: "something",
                bar: {
                    baz: "more",
                    qux: ["a", "b", "c"]
                }
            };

            proxy = new EditingProxy().init(label, serialization, exportId, editingDocument);
        });

        it("must preserve top level properties", function () {
            expect(proxy.originalSerializationMap.get('foo')).toBe("something");
        });

        it("must preserve the entire tree of properties", function () {
            var barUnit = proxy.originalSerializationMap.get('bar');

            expect(barUnit.baz).toBe("more");
            expect(JSON.stringify(barUnit.qux)).toBe(JSON.stringify(["a", "b", "c"]));
        });
    });

    describe("bindings", function () {
        var element, serialization, proxy;

        beforeEach(function () {
            var element = {};
            var serialization = {
                "prototype": "ui/foo.reel",
                "properties": {
                    "element": element
                },
                "bindings": {
                    "oneWayBinding": {"<-": "@foo.anotherPropertyOfFoo"},
                    "twoWayBinding": {"<->": "@foo.anotherPropertyOfFoo"}
                }
            };
            proxy = new EditingProxy().init(label, serialization);
        });

        it("represents serialized binding correctly", function () {
            var oneWayBinding = proxy.getObjectBinding("oneWayBinding"),
                twoWayBinding = proxy.getObjectBinding("twoWayBinding");

            expect(oneWayBinding).toBeTruthy();
            expect(oneWayBinding.key).toBe("oneWayBinding");
            expect(oneWayBinding.oneway).toBeTruthy();
            expect(oneWayBinding.sourcePath).toBe("@foo.anotherPropertyOfFoo");

            expect(twoWayBinding).toBeTruthy();
            expect(twoWayBinding.key).toBe("twoWayBinding");
            expect(twoWayBinding.oneway).toBeFalsy();
            expect(twoWayBinding.sourcePath).toBe("@foo.anotherPropertyOfFoo");
        });

        it("defines a binding with the correct model", function () {
            proxy.defineObjectBinding("aThirdBinding", true, "@foo.bar", void 0);
            var bindingModel = proxy.getObjectBinding("aThirdBinding");
            expect(bindingModel).toBeTruthy();
            expect(bindingModel.key).toBe("aThirdBinding");
            expect(bindingModel.oneway).toBeTruthy();
            expect(bindingModel.sourcePath).toBe("@foo.bar");
        });

        it("modifies an existing binding", function () {
            var bindingModel,
                someConverter = {};
            proxy.defineObjectBinding("aThirdBinding", true, "@foo.bar", void 0);
            proxy.defineObjectBinding("aThirdBinding", false, "@baz.ban", someConverter);
            bindingModel = proxy.getObjectBinding("aThirdBinding");
            expect(proxy.bindings.length).toBe(3);
            expect(bindingModel).toBeTruthy();
            expect(bindingModel.key).toBe("aThirdBinding");
            expect(bindingModel.oneway).toBeFalsy();
            expect(bindingModel.sourcePath).toBe("@baz.ban");
            expect(bindingModel.converter).toBe(someConverter);
        });

        it("cancels an existing binding", function () {
            proxy.cancelObjectBinding("oneWayBinding");
            expect(proxy.properties.length).toBe(1);
            expect(proxy.getObjectBinding("oneWayBinding")).toBeFalsy();
        });
    });
});
