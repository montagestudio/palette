var Montage = require("montage").Montage,
    Target = require("montage/core/target").Target,
    Promise = require("montage/core/promise").Promise,
    UndoManager = require("montage/core/undo-manager").UndoManager;

exports.Document = Montage.create(Target, {

    /**
     * Return a promise for a document representing the specified URL
     *
     * @param {string} url The url for which to create a representative document
     * @return {Promise} A promise that resolves to an initialized document instance
     */
    load: {
        value: function (url) {
            return Promise.resolve(this.create().init(url));
        }
    },

    constructor: {
        value: function (url) {
            this.super();
            this.defineBinding("isDirty", {
                "<-": "undoManager.undoCount > 0"
            });
        }
    },

    _url: {
        value: null
    },

    /**s
     * The URL this document represents
     */
    url: {
        get: function () {
            return this._url;
        }
    },

    /**
     * Initialize a document instance representing the specified URL
     *
     * @param {string} url The URL this document instance will represent
     */
    init: {
        value: function (url) {
            this._url = url;
            this.undoManager = UndoManager.create();
            return this;
        }
    },

    /**
     * The preferred type of component used for presenting this document
     */
    editorType: {
        get: function () {
            return null;
        }
    },

    /**
     * The actual component currently presenting this document
     */
    editor: {
        value: null
    },

    /**
     * The title of this document
     */
    title: {
        get: function () {
            return this.url.substring(this.url.lastIndexOf("/") + 1);
        }
    },

    /**
     * This document's UndoManager
     */
    undoManager: {
        value: null
    },

    /**
     * Perform the operation at the top of the undo stack
     */
    undo: {
        value: function () {
            return this.undoManager.undo();
        }
    },

    /**
     * Perform the operation at the top of the redo stack
     */
    redo: {
        value: function () {
            return this.undoManager.redo();
        }
    },

    /*
     *
     */
    canUndo: {
        get: function () {
            return this.getPath("undoManager.undoCount > 0");
        }
    },

    /*
     *
     */
    canRedo: {
        get: function () {
            return this.getPath("undoManager.redoCount > 0");
        }
    },

    /**
     * Saves the data to the specified dataWriter. For example:<br/>
     * <code>
     *      var serializer = Serializer.create().initWithRequire(this.packageRequire);
     *      var serializedDescription = serializer.serializeObject(this.currentProxyObject.proxiedObject);
     *      return dataWriter(serializedDescription, location);
     * </code>
     * @param {string} url The url to save this document's data to
     * @param {function} dataWriter The data writing function that will perform the data writing portion of the save operation
     */
    save: {
        value: function (url, dataWriter) {
            return dataWriter("", url);
        }
    },

    /**
     * Give the document an opportunity to decide if it can be closed.
     * @return null if the document can be closed, a string withe reason it cannot close otherwise
     */
    canClose: {
        value: function () {
            // TODO PJYF This message needs to be localized
            return (this.isDirty ? "You have unsaved Changes" : null);
        }
    },

    /**
     * Whether or not this document has unsaved changes and is considered dirty
     * @return {boolean} Whether or not the document has unsaved changes
     */
    isDirty: {
        value: false
    },

    close: {
        value: Function.noop
    }


});
