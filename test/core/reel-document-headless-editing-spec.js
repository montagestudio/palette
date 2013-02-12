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
            }
        }, '<div data-montage-id="ownerElement"></div>');
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

    describe("adding a serialized editing payload", function () {

    });

});
