var Montage = require("montage").Montage,
    UndoManager = require("montage/core/undo-manager").UndoManager;

exports.EditingDocument = Montage.create(Montage, {

    title: {
        dependencies: ["fileUrl"],
        get: function () {
            return this.fileUrl.substring(this.fileUrl.lastIndexOf("/") + 1);
        }
    },

    undoManager: {
        value: null
    },

    _fileUrl: {
        value: null
    },

    fileUrl: {
        get: function () {
            return this._fileUrl;
        }
    },

    init: {
        value: function (fileUrl) {

            this._fileUrl = fileUrl;
            this.undoManager = UndoManager.create();

            return this;
        }
    },

    undo: {
        value: function () {
            this.undoManager.undo();
        }
    },

    redo: {
        value: function () {
            this.undoManager.redo();
        }
    }

});
