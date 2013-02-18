/**
    @module "ui/inspector/inspector.reel"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component,
    Promise = require("montage/core/promise").Promise,
    ArrayController = require("montage/ui/controller/array-controller").ArrayController,
    parseForModuleAndName = require("montage/core/deserializer").Deserializer.parseForModuleAndName;

/**
    Description TODO
    @class module:"ui/inspector/inspector.reel".Inspector
    @extends module:montage/ui/component.Component
*/
exports.Inspector = Montage.create(Component, /** @lends module:"ui/inspector/inspector.reel".Inspector# */ {

    editingDocument: {
        value: null
    },

    didCreate: {
        value: function () {
            this.propertyGroupsController = ArrayController.create();
        }
    },

    _hasAcceptedIdentifier: {
        value: false
    },

    templateDidLoad: {
        value: function () {
            if (this._object) {
                this.templateObjects.title.value = this._object.properties.identifier;
            }
        }
    },

    prepareForDraw: {
        value: function () {
            this.templateObjects.title.addPropertyChangeListener("value", this);
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
                    this.templateObjects.title.value = this._object.getProperty("properties.identifier");
                }

                this._blueprintDeferred = Promise.defer();

                var self = this;
                this._object.packageRequire.async(this._object.moduleId).get(this._object.exportName).get("blueprint")
                    .then(function (blueprint) {
                        self._blueprintDeferred.resolve(blueprint);
                        self.blueprint = blueprint;

                        // we could create a binding to the propertyBlueprintGroups,
                        // but at the moment I'm not expecting the component blueprint
                        // to change at runtime
                        self.propertyGroupsController.content = blueprint.propertyBlueprintGroups.map(function (groupName, index) {
                            return {
                                name: groupName,
                                properties: blueprint.propertyBlueprintGroupForName(groupName),
                                open: index === 0
                            };
                        });
                    }, function () {
                        self._blueprintDeferred.reject(null);
                        self.propertyGroupsController.content = [];
                    }).done();

            } else {
                this.blueprint = null;

                if (this.templateObjects) {
                    this.templateObjects.title.value = null;
                }
            }
        }
    },

    handleChange: {
        value: function (notification) {

            if ("value" === notification.propertyPath && notification.target === this.templateObjects.title) {

                if (!this._hasAcceptedIdentifier) {
                    this._hasAcceptedIdentifier = true;
                } else {
                    this.editingDocument.setOwnedObjectProperty(this.object, "identifier", notification.plus);
                }
            }

        }
    },

    propertyGroupsController: {
        serializable: false,
        value: null
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
            this.editingDocument.setOwnedObjectProperty(this.object, detail.propertyName, detail.value);
        }
    }

});
