/**
 @module "palette/ui/editor.reel"
 @requires montage
 @requires montage/ui/component
 */
var Montage = require("montage").Montage;
var Component = require("montage/ui/component").Component;
var Promise = require("montage/core/promise").Promise;
var Map = require("montage/collections/map");

/**
 Description TODO
 @class module:"palette/ui/editor.reel".Editor
 @extends module:montage/ui/component.Component
 */
exports.Editor = Montage.create(Component, /** @lends module:"palette/ui/editor.reel".Editor# */ {

    _currentDocument:{
        value:null
    },

    currentDocument:{
        get:function () {
            return this._currentDocument;
        }
    },

    _fileUrlDocumentMap:{
        value:null
    },

    didCreate:{
        value:function () {
            Component.didCreate.call(this);
            this._fileUrlDocumentMap = new Map();
        }
    },

    /*
     * Create and load the document.<br/>
     * <b>Note:</> This must be overwritten by sub classes
     * @returns By default a rejected promise.
     */
    loadDocument:{
        value:function (fileUrl, packageUrl) {
            return Promise.reject(new Error("The loadDocument method must be overwritten by sub classes to do something useful."));
        }
    },

    /*
     * Load the document and register it so that it can be closed and tracked
     *
     */
    load:{
        value:function (fileUrl, packageUrl) {
            var self = this;
            var documentPromise = this._fileUrlDocumentMap.get(fileUrl);
            if (documentPromise) {
                // the document was already open
                return documentPromise.then(function (document) {
                    self.dispatchBeforeOwnPropertyChange("currentDocument", self._currentDocument);
                    self._currentDocument = document;
                    self.dispatchOwnPropertyChange("currentDocument", document);
                });
            }
            documentPromise = this.loadDocument(fileUrl, packageUrl);
            this._fileUrlDocumentMap.set(fileUrl, documentPromise);
            return documentPromise.then(function (document) {
                self.dispatchBeforeOwnPropertyChange("currentDocument", self._currentDocument);
                self._currentDocument = document;
                self.dispatchOwnPropertyChange("currentDocument", document);
                return document;
            }, function (error) {
                self._fileUrlDocumentMap.delete(fileUrl);
                console.log("Editor could not load document " + fileUrl, error);
                return Promise.reject(new Error("Editor could not load document " + fileUrl));
            });
        }
    },

    close:{
        value:function (fileUrl) {
            var self = this;
            var documentPromise = this._fileUrlDocumentMap.get(fileUrl);

            if (documentPromise) {
                this._fileUrlDocumentMap.delete(fileUrl);

                return documentPromise.then(function (document) {
                    if (document == self._currentDocument) {

                        var urls = self._fileUrlDocumentMap.keys;
                        var newCurrentDocumentPromise = null;
                        if (urls && (urls.length > 0)) {
                            newCurrentDocumentPromise = self._fileUrlDocumentMap.get(urls[0]);
                        }
                        if (newCurrentDocumentPromise) {
                            newCurrentDocumentPromise.then(function (newCurrentDocument) {
                                self.dispatchBeforeOwnPropertyChange("currentDocument", self._currentDocument);
                                self._currentDocument = newCurrentDocument;
                                self.dispatchOwnPropertyChange("currentDocument", newCurrentDocument);
                                self.needsDraw = true;
                                return documentPromise;
                            });
                        } else {
                            self.dispatchBeforeOwnPropertyChange("currentDocument", self._currentDocument);
                            self._currentDocument = null;
                            self.dispatchOwnPropertyChange("currentDocument", null);
                            self.needsDraw = true;
                            return documentPromise;
                        }
                    } else {
                        return documentPromise;
                    }
                });
            } else {
                console.log("We don't have an open document for " + fileUrl);
            }
            return Promise.resolve(null);
        }
    }

});
