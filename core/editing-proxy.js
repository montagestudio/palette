var Montage = require("montage").Montage,
    parseForModuleAndName = require("montage/core/deserializer").Deserializer.parseForModuleAndName;

exports.EditingProxy = Montage.create(Montage, {

    //TODO have specialized proxies for different types of actual objects componentProxy, ElementProxy, etc
    init: {
        //TODO should we just treat the proxies as the editing interface, instead of the editingDocument?
        value: function (label, serialization, editingDocument) {
            this.label = label;
            this._serialization = serialization;

            this._exportId = this._serialization.prototype;
            if (this._exportId) {
                var exportInfo = parseForModuleAndName(this._exportId);
                this._moduleId = exportInfo.module;
                this._exportName = exportInfo.name;
            }

            this._editingDocument = editingDocument;
            return this;
        }
    },

    label: {
        value: null
    },

    _serialization: {
        value: null
    },

    serialization: {
        get: function () {
            return this._serialization;
        }
    },

    _editingDocument: {
        value: null
    },

    editingDocument: {
        get: function () {
            return this._editingDocument;
        }
    },

    packageRequire: {
        get: function () {
            return this.editingDocument.packageRequire;
        }
    },

    //TODO when setting an object, apply edits that happened while we didn't have a stageObject
    stageObject: {
        value: null
    },

    _exportId: {
        value: null
    },

    exportId: {
        get: function () {
            return this._exportId;
        }
    },

    _moduleId: {
        value: null
    },

    moduleId: {
        get: function () {
            return this._moduleId;
        }
    },

    _exportName: {
        value: null
    },

    exportName: {
        get: function () {
            return this._exportName;
        }
    },

    properties: {
        get: function () {
            return this.serialization.properties;
        }
    },

    bindings: {
        get: function () {
            return this.serialization.bindings || null;
        }
    },

    listeners: {
        get: function () {
            return this.serialization.listeners || null;
        }
    },

    element: {
        value: null
    },

    setObjectProperty: {
        value: function (property, value) {

            //TODO remove properties if last property is set to undefined? for "correct" undoing especially

            if (!this.serialization.properties) {
                this.serialization.properties = {};
            }

            this.serialization.properties.setProperty(property, value);
            if (this.stageObject) {
                this.stageObject.setProperty(property, value);
            }
        }
    },

    getObjectProperty: {
        value: function (property) {
            return this.getProperty("properties." + property);
        }
    },

    defineBinding: {
        value: function (sourceObjectPropertyPath, boundObject, boundObjectPropertyPath, oneWay, converter) {

            //TODO handle converter

            if (!this.serialization.bindings) {
                this.serialization.bindings = {};
            }

            var bindingSerialization = {},
                bindingDescriptor;

            //TODO what happenes when the labels change, we should either update or indicate they're broken...
            //TODO what happens if the serialization format changes, we shouldn't be doing this ourselves
            // we should rely on the serializer of the package's version of montage
            bindingSerialization[(oneWay ? "<-" : "<->")] = "@" + boundObject.label + "." + boundObjectPropertyPath;
            this.serialization.bindings[sourceObjectPropertyPath] = bindingSerialization;

            if (this.stageObject) {
                bindingDescriptor = {
                    boundObject: boundObject.stageObject,
                    boundObjectPropertyPath: boundObjectPropertyPath
                };

                if (oneWay) {
                    bindingDescriptor.oneWay = oneWay;
                }

                if (converter) {
                    bindingDescriptor.converter = converter;
                }

                //TODO this is a bit of a hack to workaround the fact that there is an error deleting when there are no defined bindings
                if (this.stageObject._bindingDescriptors) {
                    Object.deleteBinding(this.stageObject, sourceObjectPropertyPath);
                }
                Object.defineBinding(this.stageObject, sourceObjectPropertyPath, bindingDescriptor);
            }
        }
    },

    deleteBinding: {
        value: function (sourceObjectPropertyPath) {
            delete this.serialization.bindings[sourceObjectPropertyPath];

            if (this.stageObject && this.stageObject._bindingDescriptors) {
                Object.deleteBinding(this.stageObject, sourceObjectPropertyPath);
            }
        }
    }

});
