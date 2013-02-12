var Montage = require("montage").Montage,
    Template = require("montage/ui/template").Template,
    Promise = require("montage/core/promise").Promise,
    mockReelDocument = require("test/mocks/reel-document-mocks").mockReelDocument,
    WAITSFOR_TIMEOUT = 2500;

describe("core/reel-document-stageless-editing-spec", function () {

    var reelDocument;

    beforeEach(function () {
        reelDocument = mockReelDocument("foo/bar/mock.reel", {
            "owner": {
                "properties": {
                    "element": {"#": "ownerElement"}
                }
            },
            "foo": {
                "properties": {
                    "element": {"#": "foo"}
                }
            }
        }, '<div data-montage-id="ownerElement"></div><div data-montage-id="foo"></div>');
    });

    describe("adding a component", function () {

        var labelInOwner = "myComponent",
            serialization = {prototype: "test/my-component.reel"},
            markup = '<div></div>',
            elementMontageId = "myComponentId",
            identifier = "myComponentIdentifier";

        it("should return a promise for a proxy of the added component", function () {
            var addedComponent = reelDocument.addComponent(labelInOwner, serialization, markup, elementMontageId, identifier);
            expect(Promise.isPromiseAlike(addedComponent)).toBeTruthy();
            addedComponent.timeout(WAITSFOR_TIMEOUT).done();
        });

        it("should add the proxy to the editing document", function () {
            var addedComponent = reelDocument.addComponent(labelInOwner, serialization, markup, elementMontageId, identifier);
            return addedComponent.then(function (proxy) {
                expect(proxy).toBeTruthy();
                expect(reelDocument.editingProxyMap[labelInOwner]).toBe(proxy);
                expect(reelDocument.editingProxies.indexOf(proxy) >= 0).toBeTruthy();
            }).timeout(WAITSFOR_TIMEOUT);
        });

        it("should add the component to the serialization of the editing document", function () {
            var addedComponent = reelDocument.addComponent(labelInOwner, serialization, markup, elementMontageId, identifier),
                templateSerialization;

            return addedComponent.then(function (proxy) {
                templateSerialization = JSON.parse(reelDocument.serialization);
                expect(templateSerialization[labelInOwner]).toBeTruthy();
            }).timeout(WAITSFOR_TIMEOUT);
        });
    });

    describe("removing a component", function () {

        var labelInOwner = "foo",
            proxyToRemove;

        beforeEach(function () {
            proxyToRemove = reelDocument.editingProxyMap.foo;
        });

        it("should return a promise for a removed proxy", function () {
            var removalPromise = reelDocument.removeComponent(proxyToRemove);
            expect(Promise.isPromiseAlike(removalPromise)).toBeTruthy();
            removalPromise.timeout(WAITSFOR_TIMEOUT).done();
        });

        it("should remove the proxy from the editing document", function () {
            var removalPromise = reelDocument.removeComponent(proxyToRemove);
            return removalPromise.then(function (removedProxy) {
                expect(removedProxy).toBeTruthy();
                expect(reelDocument.editingProxyMap[labelInOwner]).toBeUndefined();
                expect(reelDocument.editingProxies.indexOf(removedProxy) === -1).toBeTruthy();
            }).timeout(WAITSFOR_TIMEOUT);
        });

        it("should remove the component from the serialization of the editing document", function () {
            var removalPromise = reelDocument.removeComponent(proxyToRemove),
                templateSerialization;

            return removalPromise.then(function () {
                templateSerialization = JSON.parse(reelDocument.serialization);
                expect(templateSerialization[labelInOwner]).toBeUndefined();
            }).timeout(WAITSFOR_TIMEOUT);
        });
    });

    describe("adding an object", function () {

        var labelInOwner = "myObject",
            serialization = {prototype: "test/my-object"};

        it("should return a promise for a proxy of the added object", function () {
            var addedObject = reelDocument.addObject(labelInOwner, serialization);
            expect(Promise.isPromiseAlike(addedObject)).toBeTruthy();
            addedObject.timeout(WAITSFOR_TIMEOUT).done();
        });

        it("should add the proxy to the editing document", function () {
            var addedObject = reelDocument.addObject(labelInOwner, serialization);
            return addedObject.then(function (proxy) {
                expect(proxy).toBeTruthy();
                expect(reelDocument.editingProxyMap[labelInOwner]).toBe(proxy);
                expect(reelDocument.editingProxies.indexOf(proxy) >= 0).toBeTruthy();
            }).timeout(WAITSFOR_TIMEOUT);
        });

        it("should add the component to the serialization of the editing document", function () {
            var addedObject = reelDocument.addObject(labelInOwner, serialization),
                templateSerialization;

            return addedObject.then(function (proxy) {
                templateSerialization = JSON.parse(reelDocument.serialization);
                expect(templateSerialization[labelInOwner]).toBeTruthy();
            }).timeout(WAITSFOR_TIMEOUT);
        });

    });

    describe("adding a serialized editing payload", function () {

    });

});
