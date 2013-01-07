var Montage = require("montage").Montage,
    EditingController = require("core/controller/editing-controller").EditingController,
    UndoManager = require("montage/core/undo-manager").UndoManager,
    Template = require("montage/ui/template").Template,
    Promise = require("montage/core/promise").Promise;

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

    _editingController: {
        value: null
    },

    editingController: {
        get: function () {
            return this._editingController;
        }
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
        value: function (reelUrl, packageUrl, editingFrame, owner, ownerSerialization) {

            this._reelUrl = reelUrl;
            this._packageUrl = packageUrl;

            var editController = this._editingController = EditingController.create();
            editController.frame = editingFrame;
            editController.owner = owner;

            this.undoManager = UndoManager.create();

            this._editingModel = JSON.parse(ownerSerialization);
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
        value: function () {
            this.editingController.addComponent.apply(this.editingController, arguments);
        }
    },

    _editingModel: {
        value: null
    }

});
