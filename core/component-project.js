var Montage = require("montage").Montage,
    UndoManager = require("montage/core/undo-manager").UndoManager;

exports.ComponentProject = Montage.create(Montage, {

    didCreate: {
        value: function () {
            this.undoManager = UndoManager.create();
        }
    },

    undoManager: {
        value: null
    },

    title: {
        value: "Untitled Document"
    },

    reelUrl: {
        value: null
    }

});
