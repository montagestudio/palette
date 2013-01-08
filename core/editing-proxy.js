var Montage = require("montage").Montage;

exports.EditingProxy = Montage.create(Montage, {

    initWithLabelAndSerialization: {
        value: function (label, serialization) {
            this.label = label;
            this._serialization = serialization;
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

    stageObject: {
        value: null
    },

    setObjectProperty: {
        value: function (property, value) {

            if (!this.serialization.properties) {
                this.serialization.properties = {};
            }

            this.serialization.properties.setProperty(property, value);
            this.stageObject.setProperty(property, value);
        }
    }

});