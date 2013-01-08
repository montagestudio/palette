/**
    @module "ui/inspector/inspector.reel"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component,
    Promise = require("montage/core/promise").Promise,
    ArrayController = require("montage/ui/controller/array-controller").ArrayController;

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

            if (this._objectDescriptionDeferred && !this._objectDescriptionDeferred.promise.isFulfilled()) {
                this._objectDescriptionDeferred.reject("object changed before description was resolved");
            }

            this._object = value;
            this._hasAcceptedIdentifier = false;

            this.needsDraw = true;

            if (this._object) {

                this.templateObjects.title.value = this._object.properties.identifier;

                var self = this,
                    stageObject = this._object.stageObject;

                this._objectDescriptionDeferred = Promise.defer();
                // Fetch the description, but ignore whether we find it or not
                stageObject.description.then(this._objectDescriptionDeferred.resolve, this._objectDescriptionDeferred.reject);

                this._objectDescriptionDeferred.promise.then(function (description) {
                    self.objectDescription = description;

                    // we could create a binding to the componentPropertyDescriptionGroups,
                    // but at the moment I'm not expecting the component description
                    // to change at runtime
                    self.propertyGroupsController.content = description.componentPropertyDescriptionGroups.map(function (groupName, index) {
                        return {
                            name: groupName,
                            properties: description.componentPropertyDescriptionGroupForName(groupName),
                            open: index === 0
                        };
                    });
                }, function () {
                    self.propertyGroupsController.content = [];
                });
            } else {
                this.objectDescription = null;
                this.templateObjects.title.value = null;
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
     * Used to prevent objectDescription being resolved if this.object changes
     * while the description is being loaded.
     *
     * Takes advantage of the fact that a promise cannot be resolved after
     * being rejected and vice versa.
     * @type {Promise}
     * @private
     */
    _objectDescriptionDeferred: {
        value: Promise.defer()
    },

    objectDescription: {
        serializable: false,
        value: null
    },

    inspectorController: {
        serializable: false,
        value: null
    },

    handleEditorButtonAction: {
        value: function (evt) {
            if (!(this.inspectorController && this.inspectorController.hasEditor)) {
                return;
            }

            var self = this;
            this.inspectorController.editorComponent().then(function (Editor) {
                var editor = Editor.create();
                //TODO the editors should work with the editing proxies exactly the same as the rest of filament
                editor.object = self._object.stageObject;
                self.dispatchEventNamed("enterEditor", true, true, {
                    component: editor
                });
            });
        }
    },

    handlePropertyInspectorChange: {
        value: function (evt) {
            var detail = evt.detail;
            this.editingDocument.setOwnedObjectProperty(this.object, detail.propertyName, detail.value);
        }
    }

});
