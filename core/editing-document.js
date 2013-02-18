var Montage = require("montage").Montage,
    Promise = require("montage/core/promise").Promise,
    UndoManager = require("montage/core/undo-manager").UndoManager;

var EditingDocument = exports.EditingDocument = Montage.create(Montage, {

    load: {
        value: function (fileUrl, packageUrl) {
            var deferredDoc = Promise.defer();

            require.loadPackage(packageUrl).then(function (packageRequire) {
                deferredDoc.resolve(EditingDocument.create().init(fileUrl, packageRequire));
            });
            return deferredDoc.promise;
        }
    },

    init: {
        value: function (fileUrl, packageRequire) {
            this._undoManager = UndoManager.create();

            var self = this;
            this.dispatchPropertyChange("fileUrl", function () {
                self._fileUrl = fileUrl;
            });

            this._packageRequire = packageRequire;

            return this;
        }
    },

    title: {
        dependencies: ["title"],
        get: function () {
            return this._fileUrl.substring(this._fileUrl.lastIndexOf("/") + 1);
        }
    },

    _undoManager: {
        value: null
    },

    undoManager: {
       get: function() {
           return this._undoManager;
       }
    },

    _fileUrl: {
        value: null
    },

    fileUrl: {
        get: function () {
            return this._fileUrl;
        }
    },

    _packageRequire:{
        value:null
    },

    packageRequire:{
        get:function () {
            return this._packageRequire;
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
    },

    setOwnedObjectProperty: {
        value: function (proxy, property, value) {

            var undoManager = this.undoManager,
                undoneValue = proxy.getObjectProperty(property);

            //TODO maybe the proxy shouldn't be involved in doing this as we hand out the proxies
            // throughout the editingEnvironment, I don't want to expose accessible editing APIs
            // that do not go through the editingDocument...or do I?

            // Might be nice to have an editing API that avoids undoability and event dispatching?
            proxy.setObjectProperty(property, value);

            this.dispatchEventNamed("didSetObjectProperty", true, true, {
                object: proxy,
                property: property,
                value: value,
                undone: undoManager.isUndoing,
                redone: undoManager.isRedoing
            });

            undoManager.register("Set Property", Promise.resolve([this.setOwnedObjectProperty, this, proxy, property, undoneValue]));
        }
    }


});
