var Montage = require("montage").Montage,
    ReelDocument = require("core/reel-document").ReelDocument,
    Template = require("montage/ui/template").Template;

exports.mockReelDocument = function (fileUrl, serialization, bodyMarkup) {

    var mockDocument = document.implementation.createHTMLDocument(),
        serializationNode = mockDocument.createElement("script");

    serializationNode.setAttribute("type", "text/montage-serialization");
    serializationNode.innerHTML = JSON.stringify(serialization);
    mockDocument.getElementsByTagName("head")[0].appendChild(serializationNode);

    //TODO insert bodyMarkup

    return ReelDocument.create().init(fileUrl, Template.initWithDocument(mockDocument), require);
};
