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

        it("should correctly represent a one-way binding", function () {
            var element = {};
            var serialization = {
                "prototype": "ui/foo.reel",
                "properties": {
                    "element": element
                },
                "bindings": {
                    "propertyOfFoo": {"<-": "@foo.anotherPropertyOfFoo"}
                }
            };

            proxy = new EditingProxy().init(label, serialization);
            var bindingEntry = proxy.bindings[0];

            expect(bindingEntry).toBeTruthy();
            expect(bindingEntry.key).toBe("propertyOfFoo");
            expect(bindingEntry.twoWay).toBeFalsy();
            expect(bindingEntry.sourcePath).toBe("@foo.anotherPropertyOfFoo");
        });

        it("should correctly represent a two-way binding", function () {
            var element = {};
            var serialization = {
                "prototype": "ui/foo.reel",
                "properties": {
                    "element": element
                },
                "bindings": {
                    "propertyOfFoo": {"<->": "@foo.anotherPropertyOfFoo"}
                }
            };

            proxy = new EditingProxy().init(label, serialization);
            var bindingEntry = proxy.bindings[0];

            expect(bindingEntry).toBeTruthy();
            expect(bindingEntry.key).toBe("propertyOfFoo");
            expect(bindingEntry.oneway).toBeFalsy();
            expect(bindingEntry.sourcePath).toBe("@foo.anotherPropertyOfFoo");
        });

    });
});
