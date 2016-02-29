var EditingDocument = require("core/editing-document").EditingDocument,
    EditingProxy = require("core/editing-proxy").EditingProxy;

describe("core/editing-document-spec", function () {

    var editingDocument,
        originalLabel,
        aProxy,
        anotherProxy,
        packageRequire,
        aSerialization;

    beforeEach(function () {
        packageRequire = {};
        editingDocument = new EditingDocument().init("fileUrl", {
            write: function() {}
        }, packageRequire);

        originalLabel = "foo";
        var exportId = "foo/bar/baz";
        aSerialization = {
            prototype: exportId,
            properties: {
                baz: "ban"
            }
        };

        aProxy = new EditingProxy().init(originalLabel, aSerialization, exportId, editingDocument);
        editingDocument.__addProxy(aProxy);

        anotherProxy = new EditingProxy().init("baz", aSerialization, exportId, editingDocument);
        editingDocument.__addProxy(anotherProxy);
    });

    describe("initialization", function () {

        it ("should have a proxy with the expected label within the proxy map", function () {
            expect(editingDocument.editingProxyMap[originalLabel]).toBe(aProxy);
        });

        it("should have the correct packageRequire", function() {
            expect(editingDocument.packageRequire).toEqual(packageRequire);
        });

    });

    describe("serializationForProxy", function() {
        it("should return an appropriate serialization object", function() {
            var serialization = editingDocument.serializationForProxy(aProxy);
            expect(serialization).toBeTruthy();
            expect(serialization.prototype).toEqual(aSerialization.prototype);
        });
    });

    describe("getting owned object properties", function() {
        it("should return the correct single property", function() {
            expect(editingDocument.getOwnedObjectProperty(aProxy, "baz")).toEqual("ban");
            expect(editingDocument.getOwnedObjectProperty(aProxy, "foo")).toBeFalsy();
        });

        it("should return the correct properties", function() {
            var props = editingDocument.getOwnedObjectProperties(aProxy, {baz: null, foo: null});
            expect(props["baz"]).toBe("ban");
            expect(props["foo"]).toBe(void 0);
        });
    });

    describe("changing proxy labels", function () {

        var newLabel;

        beforeEach(function () {
            newLabel = "bar";
        });

        it("should find the same proxy at the new label within the proxy map", function () {
            editingDocument.setOwnedObjectLabel(aProxy, newLabel);
            expect(editingDocument.editingProxyMap[newLabel]).toBe(aProxy);
        });

        it("must not have an entry for the old label within the proxy map", function () {
            editingDocument.setOwnedObjectLabel(aProxy, newLabel);
            expect(editingDocument.editingProxyMap[originalLabel]).toBeUndefined();
        });

        it("should change the label of the proxy itself", function () {
            editingDocument.setOwnedObjectLabel(aProxy, newLabel);
            expect(aProxy.label).toBe(newLabel);
        });

        it("must not perform the change if there is a existing proxy with the specified label", function () {
            var anotherLabel = anotherProxy.label;
            editingDocument.setOwnedObjectLabel(aProxy, anotherLabel);

            expect(editingDocument.editingProxyMap[originalLabel]).toBe(aProxy);
            expect(editingDocument.editingProxyMap[anotherLabel]).toBe(anotherProxy);
        });

        it("must not perform the change if no new label was specified", function () {
            newLabel = "";
            editingDocument.setOwnedObjectLabel(aProxy, newLabel);

            expect(editingDocument.editingProxyMap[originalLabel]).toBe(aProxy);
            expect(editingDocument.editingProxyMap[newLabel]).toBeUndefined();
        });

        it("should register an undo operation for the label change", function () {
            editingDocument.setOwnedObjectLabel(aProxy, newLabel);
            expect(editingDocument.undoManager.undoCount).toBe(1);
            expect(editingDocument.undoManager.redoCount).toBe(0);
        });

        it("should revert back to the previous label upon undoing the label change", function () {
            editingDocument.setOwnedObjectLabel(aProxy, newLabel);
            return editingDocument.undoManager.undo().then(function () {
                expect(editingDocument.editingProxyMap[originalLabel]).toBe(aProxy);
                expect(editingDocument.editingProxyMap[newLabel]).toBeUndefined();
            });
        });

        it("should register a redo operation upon undoing the label change", function () {
            editingDocument.setOwnedObjectLabel(aProxy, newLabel);
            return editingDocument.undoManager.undo().then(function () {
                expect(editingDocument.undoManager.undoCount).toBe(0);
                expect(editingDocument.undoManager.redoCount).toBe(1);
            });
        });

        it("should have the new label upon redoing the label change", function () {
            editingDocument.setOwnedObjectLabel(aProxy, newLabel);
            return editingDocument.undoManager.undo().then(function () {
                return editingDocument.undoManager.redo();
            }).then(function () {
                expect(editingDocument.editingProxyMap[newLabel]).toBe(aProxy);
                expect(editingDocument.editingProxyMap[originalLabel]).toBeUndefined();
            });
        });

        it("should should dispatch a didSetOwnedObjectLabel", function () {
            var event;
            var listener = {
                handleEvent: function(){}
            };
            spyOn(listener, "handleEvent");

            editingDocument.addEventListener("didSetOwnedObjectLabel", listener);
            editingDocument.setOwnedObjectLabel(aProxy, newLabel);

            expect(listener.handleEvent.callCount).toBe(1);
            event = listener.handleEvent.mostRecentCall.args[0];
            expect(event.detail.proxy).toBe(aProxy);
            expect(event.detail.newLabel).toBe(newLabel);
            expect(event.detail.oldLabel).toBe(originalLabel);
        });

    });

    describe("deleting an owned object property", function() {
        it("should delete the property", function() {
            editingDocument.deleteOwnedObjectProperty(aProxy, "baz");
            expect(editingDocument.getOwnedObjectProperty(aProxy, "baz")).toBe(void 0);
        });
    });

    describe("getting proxies", function() {
         it("should return each proxy", function() {
             var proxies = editingDocument.editingProxies;
             expect(proxies.length).toBe(2);
             expect(proxies[0].label).toBe("foo");
             expect(proxies[1].label).toBe("baz");
         });
    });

    describe("selection API", function() {
        describe("selection", function() {
            it("can select an object", function() {
                editingDocument.selectObject(aProxy);
                expect(editingDocument.selectedObjects).toContain(aProxy);
            });

            it("can deselect an object", function() {
                editingDocument.selectObject(aProxy);
                editingDocument.deselectObject(aProxy);
                expect(editingDocument.selectedObjects.length).toBe(0);
            });

            it("does nothing when deselecting an object that is not selected", function() {
                editingDocument.selectObject(aProxy);
                editingDocument.deselectObject(anotherProxy);
                expect(editingDocument.selectedObjects.length).toBe(1);
            });

            it("can clear selected objects", function() {
                editingDocument.selectObject(aProxy);
                editingDocument.clearSelectedObjects();
                expect(editingDocument.selectedObjects.length).toBe(0);
            });
        });

        describe("highlighting", function() {
            it("can highlight an element", function() {
                editingDocument.highlightElement(aProxy);
                expect(editingDocument.highlightedElements).toContain(aProxy);
            });

            it("can de-highlight an element", function() {
                editingDocument.highlightElement(aProxy);
                editingDocument.deHighlightElement(aProxy);
                expect(editingDocument.highlightedElements.length).toBe(0);
            });

            it("does nothing when de-highlighting an object that is not selected", function() {
                editingDocument.highlightElement(aProxy);
                editingDocument.deHighlightElement(anotherProxy);
                expect(editingDocument.highlightedElements.length).toBe(1);
            });

            it("can clear highlighted elements", function() {
                editingDocument.highlightElement(aProxy);
                editingDocument.clearHighlightedElements();
                expect(editingDocument.highlightedElements.length).toBe(0);
            });
        });
    });

    describe("event dispatching", function() {

        describe("didSetOwnedObjectProperty", function () {
            var yetAnotherProxy;

            beforeEach(function () {
                var serialization;
                var exportId = "foo/bar/baz";

                serialization = {
                    prototype: exportId,
                    properties: {
                        foo: "a string",
                        bar: 42
                    }
                };

                yetAnotherProxy = new EditingProxy().init("yetAnotherLabel", serialization, exportId, editingDocument);
                editingDocument.__addProxy(yetAnotherProxy);
            });

            it("should dispatch when a property changes", function () {
                var listener = {
                    handleEvent: function () {
                    }
                };
                spyOn(listener, "handleEvent");

                editingDocument.addEventListener("didSetOwnedObjectProperty", listener);
                editingDocument.setOwnedObjectProperty(yetAnotherProxy, "foo", "another string");

                expect(listener.handleEvent.callCount).toBe(1);
            });
        });

        describe("didDeleteOwnedObjectProperty", function () {
            var yetAnotherProxy;

            beforeEach(function () {
                var serialization;
                var exportId = "foo/bar/baz";

                serialization = {
                    prototype: exportId,
                    properties: {
                        foo: "a string",
                        bar: 42
                    }
                };

                yetAnotherProxy = new EditingProxy().init("yetAnotherLabel", serialization, exportId, editingDocument);
                editingDocument.__addProxy(yetAnotherProxy);
            });

            it("should dispatch when properties are deleted", function () {
                var listener = {
                    handleEvent: function () {
                    }
                };
                spyOn(listener, "handleEvent");

                editingDocument.addEventListener("didDeleteOwnedObjectProperty", listener);
                editingDocument.deleteOwnedObjectProperty(yetAnotherProxy, "foo");

                expect(listener.handleEvent.callCount).toBe(1);
            });

            it("should not dispatch didSetOwnedObjectProperty or didSetOwnedObjectProperties", function () {
                var listener = {
                    handleEvent: function () {
                    }
                };
                spyOn(listener, "handleEvent");

                editingDocument.addEventListener("didSetOwnedObjectProperty", listener);
                editingDocument.addEventListener("didSetOwnedObjectProperties", listener);
                editingDocument.deleteOwnedObjectProperty(yetAnotherProxy, "foo");

                expect(listener.handleEvent).not.toHaveBeenCalled();
            });
        });

        describe("didSetOwnedObjectProperties", function () {
            var yetAnotherProxy;

            beforeEach(function () {
                var serialization;
                var exportId = "foo/bar/baz";

                serialization = {
                    prototype: exportId,
                    properties: {
                        foo: "a string",
                        bar: 42
                    }
                };

                yetAnotherProxy = new EditingProxy().init("yetAnotherLabel", serialization, exportId, editingDocument);
                editingDocument.__addProxy(yetAnotherProxy);
            });

            it("should dispatch when properties change", function () {
                var listener = {
                    handleEvent: function () {
                    }
                };
                spyOn(listener, "handleEvent");

                editingDocument.addEventListener("didSetOwnedObjectProperties", listener);
                editingDocument.setOwnedObjectProperties(yetAnotherProxy, {
                    foo: "another string",
                    bar: 1
                });

                expect(listener.handleEvent.callCount).toBe(1);
            });

            it("should not dispatch didSetOwnedObjectProperty", function () {
                var listener = {
                    handleEvent: function () {
                    }
                };
                spyOn(listener, "handleEvent");

                editingDocument.addEventListener("didSetOwnedObjectProperty", listener);
                editingDocument.setOwnedObjectProperties(yetAnotherProxy, {
                    foo: "another string",
                    bar: 1
                });

                expect(listener.handleEvent).not.toHaveBeenCalled();
            });
        });

        describe("propertyChangesDispatchingEnabled", function () {
            var yetAnotherProxy;

            beforeEach(function () {
                var serialization;
                var exportId = "foo/bar/baz";

                serialization = {
                    prototype: exportId,
                    properties: {
                        foo: "a string",
                        bar: 42
                    }
                };

                yetAnotherProxy = new EditingProxy().init("yetAnotherLabel", serialization, exportId, editingDocument);
                editingDocument.__addProxy(yetAnotherProxy);
            });

            it("should not dispatch didSetOwnedObjectProperty when propertyChangeDispatchingEnabled is false", function () {
                var listener = {
                    handleEvent: function () {
                    }
                };
                spyOn(listener, "handleEvent");

                editingDocument.addEventListener("didSetOwnedObjectProperty", listener);
                editingDocument.propertyChangesDispatchingEnabled = false;
                editingDocument.setOwnedObjectProperty(yetAnotherProxy, "foo", "another string");

                expect(listener.handleEvent).not.toHaveBeenCalled();
            });

            it("should not dispatch didDeleteOwnedObjectProperty when propertyChangeDispatchingEnabled is false", function () {
                var listener = {
                    handleEvent: function () {
                    }
                };
                spyOn(listener, "handleEvent");

                editingDocument.addEventListener("didDeleteOwnedObjectProperty", listener);
                editingDocument.propertyChangesDispatchingEnabled = false;
                editingDocument.deleteOwnedObjectProperty(yetAnotherProxy, "foo");

                expect(listener.handleEvent).not.toHaveBeenCalled();
            });

            it("should not dispatch didChangeObjectProperties when propertyChangeDispatchingEnabled is false", function () {
                var listener = {
                    handleEvent: function () {
                    }
                };
                spyOn(listener, "handleEvent");

                editingDocument.addEventListener("didChangeObjectProperties", listener);
                editingDocument.propertyChangesDispatchingEnabled = false;
                editingDocument.setOwnedObjectProperties(yetAnotherProxy, {
                    foo: "another string",
                    bar: 1
                });

                expect(listener.handleEvent).not.toHaveBeenCalled();
            });

            it("should not dispatch didSetOwnedObjectLabel when propertyChangesDispatchingEnabled is false", function() {
                var event;
                var listener = {
                    handleEvent: function(){}
                };
                spyOn(listener, "handleEvent");

                editingDocument.addEventListener("didSetOwnedObjectLabel", listener);
                editingDocument.propertyChangesDispatchingEnabled = false;
                editingDocument.setOwnedObjectLabel(aProxy, "newLabel");

                expect(listener.handleEvent).not.toHaveBeenCalled();
            });
        });

    });
});
