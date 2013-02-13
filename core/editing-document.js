var Montage = require("montage").Montage,
    Promise = require("montage/core/promise").Promise,
    UndoManager = require("montage/core/undo-manager").UndoManager;

exports.EditingDocument = Montage.create(Montage, {

    load: {
        value: function (fileUrl) {
            var doc = this.create().init.apply(this, arguments);
            return Promise.resolve(doc);
        }
    },

    init: {
        value: function (fileUrl) {
            this.undoManager = UndoManager.create();

            var self = this;
            this.dispatchOwnPropertyChange("fileUrl", function () {
                self._fileUrl = fileUrl;
            });

            return this;
        }
    },

    title: {
        dependencies: ["title"],
        get: function () {
            return this._fileUrl.substring(this._fileUrl.lastIndexOf("/") + 1);
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
