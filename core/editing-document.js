var Montage = require("montage").Montage,
    EditingController = require("core/controller/editing-controller").EditingController,
    UndoManager = require("montage/core/undo-manager").UndoManager;

exports.EditingDocument = Montage.create(Montage, {

    title: {
        dependencies: ["reelUrl"],
        get: function () {
            return this.reelUrl.substring(this.reelUrl.lastIndexOf("/") + 1);
        }
    },

    undoManager: {
        value: null
    },

    editingController: {
        value: null
    },

    _reelUrl: {
        value: null
    },

    _packageUrl: {
        value: null
    },

    reelUrl: {
        get: function () {
            return this._reelUrl;
        }
    },

    packageUrl: {
        get: function () {
            return this._packageUrl;
        }
    },

    init: {
        value: function (reelUrl, packageUrl, editingFrame, owner) {

            this._reelUrl = reelUrl;
            this._packageUrl = packageUrl;

            this.editingController = EditingController.create();
            this.editingController.frame = editingFrame;
            this.editingController.owner = owner;

            this.undoManager = UndoManager.create();

            return this;
        }
    },

    //TODO this is still somewhat mid-refactoring, probably could be cleaned up
    template: {
        get: function () {
            return this.editingController.template;
        }
    },

    // Editing Document APIs
    addComponent: {
        value: function() {
            this.editingController.addComponent.apply(this.editingController, arguments);
        }
    }

});
