var Montage = require("montage").Montage,
    Document = require("core/document").Document,
    Promise = require("montage/core/promise").Promise,
    WAITSFOR_TIMEOUT = 2500;

describe("core/document-spec", function () {

    describe("asynchronously loading a document", function () {

        it("should return a promise for the expected document", function () {
            var promisedDocument = Document.load("myUrl");
            expect(Promise.isPromiseAlike(promisedDocument)).toBeTruthy();
            promisedDocument.done();
        });

        it("should resolve as a document instance with the expected url", function () {
            return Document.load("myUrl").then(function (doc) {
                expect(doc.url).toBe("myUrl");
            });
        });

    });

    describe("a document", function () {

        var document;

        beforeEach(function () {
            document = Document.create().init("http://example.com/foo/bar/baz.jpg");
        });

        it("should choose the last component of the url as the title", function () {
            expect(document.title).toBe("baz.jpg");
        });

        it("should provide an undoManager", function () {
            expect(document.undoManager).toBeTruthy();
        });

    });

});
