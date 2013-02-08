var Montage = require("montage").Montage,
    Promise = require("montage/core/promise").Promise,
    ReelDocument = require("core/reel-document").ReelDocument,
    Template = require("montage/ui/template").Template,
    WAITSFOR_TIMEOUT = 2500;

describe("core/reel-document-spec", function () {

    var reelDocument;

    describe("loading a data model given a locationId", function () {

        beforeEach(function () {
            reelDocument = ReelDocument.load("test/mocks/ui/simple.reel", require.location);
        });

        it("should return a promise for the populated document", function () {
            expect(Promise.isPromiseAlike(reelDocument)).toBeTruthy();
            reelDocument.timeout(WAITSFOR_TIMEOUT).done();
        });

        it("should resolve as a populated document", function () {
            return reelDocument.then(function (doc) {
                expect(doc).toBeTruthy();
                expect(doc.editingProxies).toBeTruthy();
                expect(doc.editingProxies.length).toBe(1);
            }).timeout(WAITSFOR_TIMEOUT);
        });

    });

    describe("once initialized", function () {

        var mockDocument, mockTemplate, serialization;

        beforeEach(function () {
            mockDocument = document.implementation.createHTMLDocument();

            serialization = '{"owner": {}, "foo": {}}';

            var serializationNode = mockDocument.createElement("script");
            serializationNode.setAttribute("type", "text/montage-serialization");
            serializationNode.innerHTML = serialization;
            mockDocument.getElementsByTagName("head")[0].appendChild(serializationNode);

            mockTemplate = Template.initWithDocument(mockDocument);
            reelDocument = ReelDocument.create().init("test/mocks/ui/simple.reel", mockTemplate);
        });

        it("should have a proxy object for each serialization label", function () {
            expect(reelDocument.editingProxyMap.owner.label).toBe("owner");
            expect(reelDocument.editingProxyMap.foo.label).toBe("foo");
        });

        it("should have a title that is the last path component and extension of the fileUrl", function () {
            expect(reelDocument.title).toBe("simple.reel");
        });

    });

});
