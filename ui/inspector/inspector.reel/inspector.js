/**
    @module "ui/inspector/inspector.reel"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component,
    Promise = require("montage/core/promise").Promise,
    RangeController = require("montage/core/range-controller").RangeController,
    MontageReviver = require("montage/core/serialization/deserializer/montage-reviver").MontageReviver;

/**
    Description TODO
    @class module:"ui/inspector/inspector.reel".Inspector
    @extends module:montage/ui/component.Component
*/
exports.Inspector = Montage.create(Component, /** @lends module:"ui/inspector/inspector.reel".Inspector# */ {

    editingDocument: {
        value: null
    },

    _hasAcceptedIdentifier: {
        value: false
    },

    templateDidLoad: {
        value: function () {
            if (this._object && this.templateObjects && this.templateObjects.title) {
                this.templateObjects.title.value = this._object.properties.identifier;
            }
        }
    },

    enterDocument: {
        value: function (firstTime) {
            if (firstTime) {
                if (this.templateObjects && this.templateObjects.title) {
                    this.templateObjects.title.addOwnPropertyChangeListener("value", this);
                }
            }
        }
    },

    _object: {
        value: null
    },
    object: {
        get: function () {
            return this._object;
        },
        set: function (value) {
            if (value === this._object) {
                return;
            }

            if (this._blueprintDeferred && !this._blueprintDeferred.promise.isFulfilled()) {
                this._blueprintDeferred.reject(new Error("Inspected Object changed before blueprint was resolved"));
            }

            this._object = value;
            this._hasAcceptedIdentifier = false;

            this.needsDraw = true;

            if (this._object && this._object.moduleId && (this._object.moduleId != "") && this._object.exportName && (this._object.exportName != "")) {

                if (this.templateObjects) {
                    this.templateObjects.title.value = this._object.getPath("properties.identifier");
                }

                this._blueprintDeferred = Promise.defer();

                var self = this;
                this._object.packageRequire.async(this._object.moduleId).get(this._object.exportName).get("blueprint")
                    .then(function (blueprint) {
                        self._blueprintDeferred.resolve(blueprint);
                        self.blueprint = blueprint;
                    }, function () {
                        self._blueprintDeferred.reject(null);
                    }).done();

            } else {
                this._blueprintDeferred = null;
                this.blueprint = null;

                if (this.templateObjects) {
                    this.templateObjects.title.value = null;
                }
            }
        }
    },

    handleValueChange: {
        value: function (value) {
            if (!this._hasAcceptedIdentifier) {
                this._hasAcceptedIdentifier = true;
            } else if (this.object) {
                this.editingDocument.setOwnedObjectProperty(this.object, "identifier", value);
            }
        }
    },

    /**
     * Used to prevent blueprint being resolved if this.object changes
     * while the blueprint is being loaded.
     *
     * Takes advantage of the fact that a promise cannot be resolved after
     * being rejected and vice versa.
     * @type {Promise}
     * @private
     */
    _blueprintDeferred: {
        value: Promise.defer()
    },

    blueprint: {
        serializable: false,
        value: null
    },

    inspectorController: {
        serializable: false,
        value: null
    },

    handleModalEditorButtonAction: {
        value: function (evt) {
            if (!(this.inspectorController && this.inspectorController.hasEditor)) {
                return;
            }

            var self = this,
                editor;

            this.inspectorController.editorComponent().then(function (Editor) {
                editor = Editor.create();
                editor.object = self._object;
                editor.editingDocument = self.editingDocument;
                self.dispatchEventNamed("enterModalEditor", true, true, {
                    modalEditor: editor
                });
            }).done();
        }
    },

    handlePropertyInspectorChange: {
        value: function (evt) {
            var detail = evt.detail;
            if (this.object) {
                this.editingDocument.setOwnedObjectProperty(this.object, detail.propertyName, detail.value);
            }
        }
    }

});
