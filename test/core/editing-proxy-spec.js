var Montage = require("montage").Montage,
    Promise = require("montage/core/promise").Promise,
    mockReelDocument = require("test/mocks/reel-document-mocks").mockReelDocument,
    EditingProxy = require("core/editing-proxy").EditingProxy,
    WAITSFOR_TIMEOUT = 2500;

describe("core/editing-proxy-spec", function () {

    var proxy, label, doc;

    beforeEach(function () {
        label = "myObject";
        doc = Montage.create();
        proxy = EditingProxy.create().init(label, doc);
    });

    describe("initialization", function () {

        it("should have the expected label", function () {
            expect(proxy.label).toBe(label);
        });

        it("should have the expected editingDocument", function () {
            expect(proxy.editingDocument).toBe(doc);
        });

    });

});
