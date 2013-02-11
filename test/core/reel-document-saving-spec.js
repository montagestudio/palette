var Montage = require("montage").Montage,
    Template = require("montage/ui/template").Template,
    mockReelDocument = require("test/mocks/reel-document-mocks").mockReelDocument;

describe("core/reel-document-saving-spec", function () {

    var reelDocument;

    describe("preparing the serialization", function () {

        it("should have all the expected labels", function () {
            reelDocument = mockReelDocument("foo/bar/mock.reel", {"owner": {}, "foo": {}});
            var serialization = JSON.parse(reelDocument.serialization);
            expect(serialization.owner).toBeTruthy();
            expect(serialization.foo).toBeTruthy();
        });

        it("must have the owner label before any other labels", function () {
            reelDocument = mockReelDocument("foo/bar/mock.reel", {"owner": {}, "alpha": {}});
            var serialization = reelDocument.serialization,
                ownerLabelIndex = serialization.indexOf('"owner":'),
                alphaLabelIndex = serialization.indexOf('"alpha":');

            expect(ownerLabelIndex < alphaLabelIndex).toBeTruthy();
        });

        it("must have the owner label before any other labels", function () {
            reelDocument = mockReelDocument("foo/bar/mock.reel", {"owner": {}, "alpha": {}});
            var serialization = reelDocument.serialization,
                ownerLabelIndex = serialization.indexOf('"owner":'),
                alphaLabelIndex = serialization.indexOf('"alpha":');

            expect(ownerLabelIndex < alphaLabelIndex).toBeTruthy();
        });

        it("should have labels in alphabetical order", function () {
            reelDocument = mockReelDocument("foo/bar/mock.reel", {"beta": {}, "owner": {}, "alpha": {}});
            var serialization = reelDocument.serialization,
                ownerLabelIndex = serialization.indexOf('"owner":'),
                alphaLabelIndex = serialization.indexOf('"alpha":'),
                betaLabelIndex = serialization.indexOf('"beta":');

            expect(ownerLabelIndex < alphaLabelIndex < betaLabelIndex).toBeTruthy();
        });

    });

});
