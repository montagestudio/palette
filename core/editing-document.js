var Montage = require("montage").Montage,
    Promise = require("montage/core/promise").Promise,
    UndoManager = require("montage/core/undo-manager").UndoManager;

var EditingDocument = exports.EditingDocument = Montage.create(Montage, {

    load: {
        value: function (fileUrl, packageUrl) {
            var deferredDoc = Promise.defer(),
                documentType = this;

            require.loadPackage(packageUrl).then(function (packageRequire) {
                deferredDoc.resolve(documentType.create().init(fileUrl, packageRequire));
            });
            return deferredDoc.promise;
        }
    },

    init: {
        value: function (fileUrl, packageRequire) {
            var self = this;
            self._undoManager = UndoManager.create();

            self.dispatchBeforeOwnPropertyChange("fileUrl", self.fileUrl);
            self.dispatchBeforeOwnPropertyChange("url", self.url);
            self._fileUrl = fileUrl;
            self.dispatchOwnPropertyChange("fileUrl", self.fileUrl);
            self.dispatchOwnPropertyChange("url", self.url);

            self._packageRequire = packageRequire;

            return self;
        }
    },

    title: {
        dependencies: ["title"],
        get: function () {
            return this._fileUrl.substring(this._fileUrl.lastIndexOf("/") + 1);
        }
    },

    /*
     * Saves the data to the dataWriter. For example:<br/>
     * <code>
     *      var serializer = Serializer.create().initWithRequire(this.packageRequire);
     *      var serializedDescription = serializer.serializeObject(this.currentProxyObject.proxiedObject);
     *      return dataWriter(serializedDescription, location);
     * </code>
     * @param location of the document being saved
     * @param writer to save teh information to.
     */
    save: {
        value: function (location, dataWriter) {
            return dataWriter("", location);
        }
    },

    /*
     * Give the document an opportunity to decide if it can be closed.
     * @param location of the document being saved
     * @return null if the document can be closed, a string withe reason it cannot close otherwise
     */
    canClose: {
        value: function (location) {
            // TODO PJYF This message needs to be localized
            return (this.isDirty() ? "You have unsaved Changes" : null);
        }
    },

    isDirty: {
        value: function() {
            return this.undoManager && this.undoManager.undoCount > 0;
        }
    },

    close: {
        value: Function.noop
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

    /**
     * @deprecated
     * @see url
     */
    fileUrl: {
        get: function () {
            return this._fileUrl;
        }
    },

    url: {
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

    getOwnedObjectProperty: {
        value: function (proxy, property) {
            return proxy.getObjectProperty(property);
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
