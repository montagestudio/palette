var Montage = require("montage").Montage,
    Promise = require("montage/core/promise").Promise,
    Document = require("core/document").Document;

var EditingDocument = exports.EditingDocument = Montage.create(Document, {

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
            var self = Document.init.call(this, fileUrl);
            self._packageRequire = packageRequire;
            return self;
        }
    },

    /**
     * @deprecated
     * @see url
     */
    fileUrl: {
        get: function () {
            return this._url;
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
