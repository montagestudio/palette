var Document = require("palette/core/document").Document,
    Promise = require("montage/core/promise").Promise;

function isPromiseAlike(o) {
    return o && typeof o.then === "function";
}

describe("core/document-spec", function () {

    describe("asynchronously loading a document", function () {

        it("should return a promise for the expected document", function () {
            var promisedDocument = new Document().init("myUrl").load();
            expect(isPromiseAlike(promisedDocument)).toBeTruthy();
            promisedDocument.done();
        });

        it("should resolve as a document instance with the expected url", function () {
            return new Document().init("myUrl").load().then(function (doc) {
                expect(doc.url).toBe("myUrl");
            });
        });

    });

    describe("a document", function () {

        var document;

        beforeEach(function () {
            document = new Document().init("http://example.com/foo/bar/baz.jpg");
        });

        it("should choose the last component of the url as the title", function () {
            expect(document.title).toBe("baz.jpg");
        });

        it("should provide an undoManager", function () {
            expect(document.undoManager).toBeTruthy();
        });

    });

    describe("undoManager", function () {
        var document;

        beforeEach(function () {
            document = new Document().init("http://example.com/foo/bar/baz.jpg", {
                write: Function.noop
            });
            document.a = 1;

            document.add = function (n) {
                document.a += n;
                return document.undoManager.register("Add 1", Promise.resolve([
                    document.sub,
                    document,
                    n
                ]));
            };
            document.sub = function (n) {
                document.a -= n;
                return document.undoManager.register("Subtract 1", Promise.resolve([
                    document.add,
                    document,
                    n
                ]));
            };
        });

        it("is created in init", function () {
            expect(document.undoManager).toBeDefined();
        });

        it("can be set to itself", function() {
            var undoManager = document.undoManager;
            expect(function() {
                document.undoManager = undoManager;
            }).not.toThrow();
            expect(document.undoManager).toBe(undoManager);
        });

        it("initially cannot undo or redo", function() {
            expect(document.canUndo).toBe(false);
            expect(document.canRedo).toBe(false);
        });

        it("can undo after a modification", function() {
            document.add(1).then(function() {
                expect(document.canUndo).toBe(true);
                expect(document.canRedo).toBe(false);
            });
        });

        it("can redo after an undo", function() {
            document.add(1).then(function() {
                return document.undo();
            }).then(function() {
                expect(document.canUndo).toBe(false);
                expect(document.canRedo).toBe(true);
            });
        });
    });

    describe("isDirty", function () {
        var document, promise;

        beforeEach(function () {
            document = new Document().init("http://example.com/foo/bar/baz.jpg", {
                write: Function.noop
            });
            document.a = 1;

            expect(document.isDirty).toBe(false);

            document.add = function (n) {
                document.a += n;
                return document.undoManager.register("Add 1", Promise.resolve([
                    document.sub,
                    document,
                    n
                ]));
            };
            document.sub = function (n) {
                document.a -= n;
                return document.undoManager.register("Subtract 1", Promise.resolve([
                    document.add,
                    document,
                    n
                ]));
            };

            promise = document.add(1);
        });

        it("is true after change", function () {
            return promise.then(function () {
                expect(document.isDirty).toBe(true);
            });
        });

        it("is false after undo", function () {
            return promise.then(function () {
                expect(document.isDirty).toBe(true);
                return document.undo();
            }).then(function () {
                expect(document.a).toBe(1);
                expect(document.isDirty).toBe(false);
            });
        });

        it("is true after redo", function () {
            return promise.then(function () {
                expect(document.isDirty).toBe(true);
                return document.undo();
            }).then(function () {
                expect(document.a).toBe(1);
                expect(document.isDirty).toBe(false);
                return document.redo();
            }).then(function () {
                expect(document.a).toBe(2);
                expect(document.isDirty).toBe(true);
            });
        });

        it("is false after save", function () {
            return promise.then(function () {
                expect(document.isDirty).toBe(true);
                return document.save("");
            }).then(function () {
                expect(document.isDirty).toBe(false);
            });
        });

        it("is true after save and undo", function () {
            return promise.then(function () {
                expect(document.isDirty).toBe(true);
                return document.save("");
            }).then(function () {
                expect(document.isDirty).toBe(false);
                return document.undo();
            }).then(function () {
                expect(document.isDirty).toBe(true);
            });
        });

        it("is true after save, undo and another operation", function () {
            return promise.then(function () {
                expect(document.isDirty).toBe(true);
                return document.save("");
            }).then(function () {
                expect(document.isDirty).toBe(false);
                return document.undo();
            }).then(function () {
                expect(document.isDirty).toBe(true);
                return document.add(2);
            }).then(function () {
                expect(document.a).toBe(3);
                expect(document.isDirty).toBe(true);
            });
        });

    });

    describe("canClose", function() {
        var document;

        beforeEach(function () {
            document = new Document().init("http://example.com/foo/bar/baz.jpg", {
                write: Function.noop
            });
            document.a = 1;

            document.add = function (n) {
                document.a += n;
                return document.undoManager.register("Add 1", Promise.resolve([
                    document.sub,
                    document,
                    n
                ]));
            };
            document.sub = function (n) {
                document.a -= n;
                return document.undoManager.register("Subtract 1", Promise.resolve([
                    document.add,
                    document,
                    n
                ]));
            };
        });

        it("returns null when the document is ready to be closed", function() {
            expect(document.canClose()).toBe(null);
        });

        it("returns a message when the document has unsaved changed", function() {
            document.add(1);
            expect(typeof document.canClose()).toBe("string");
        });
    });

    describe("editorType", function() {
        it("is null by default", function() {
            expect(Document.editorType).toBe(null);
        });
    });
});
