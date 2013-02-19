var Montage = require("montage").Montage,
    Bindings = require("montage/core/bindings").Bindings,
    EditingProxy = require("core/editing-proxy").EditingProxy,
    MontageReviver = require("montage/core/serialization/deserializer/montage-reviver").MontageReviver;

exports.ReelProxy = Montage.create(EditingProxy,  {

    //TODO have specialized proxies for different types of actual objects componentProxy, ElementProxy, etc
    init: {
        //TODO should we just treat the proxies as the editing interface, instead of the editingDocument?
        value: function (label, serialization, editingDocument) {
            var self = EditingProxy.init.call(this, label, editingDocument);

            self._serialization = serialization;

            self._exportId = self._serialization.prototype;
            if (this._exportId) {
                var exportInfo = MontageReviver.parseObjectLocationId(this._exportId);
                self._moduleId = exportInfo.moduleId;
                self._exportName = exportInfo.objectName;
            }
            return self;
        }
    },

    _serialization: {
        value: null
    },

    serialization: {
        get: function () {
            return this._serialization;
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

            this.serialization.properties.setPath(property, value);
            if (this.stageObject) {
                this.stageObject.setPath(property, value);
            }
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
