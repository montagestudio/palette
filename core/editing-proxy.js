var Montage = require("montage").Montage;

exports.EditingProxy = Montage.create(Montage, {

    initWithLabelAndSerializationAndStageObject: {
        value: function (label, serialization, stageObject) {
            this.label = label;
            this._serialization = serialization;
            this._stageObject = stageObject;
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

    _stageObject: {
        value: null
    },

    stageObject: {
        get: function () {
            return this._stageObject;
        }
    },

    prototype: {
        get: function () {
            return this.serialization.prototype;
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

    setObjectProperty: {
        value: function (property, value) {

            //TODO remove properties if last property is set to undefined? for "correct" undoing especially

            if (!this.serialization.properties) {
                this.serialization.properties = {};
            }

            this.serialization.properties.setProperty(property, value);
            this.stageObject.setProperty(property, value);
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
    },

    deleteBinding: {
        value: function (sourceObjectPropertyPath) {
            delete this.serialization.bindings[sourceObjectPropertyPath];

            if (this.stageObject._bindingDescriptors) {
                Object.deleteBinding(this.stageObject, sourceObjectPropertyPath);
            }
        }
    }

});