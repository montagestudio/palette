var Montage = require("montage").Montage,
    MontageReviver = require("montage/core/serialization/deserializer/montage-reviver").MontageReviver,
    Map = require("montage/collections/map");

/**
 @class module:palette/coreediting-proxy.EditingProxy
 This the abstract class far all editor proxies.
 */
exports.EditingProxy = Montage.create(Montage, /** @lends module:palette/coreediting-proxy.EditingProxy# */  {

    proxyType: {
        get: function() {
            return "ProxyObject"
        }
    },

    /**
     * The label for this object within the EditingDocument's template
     */
    label: {
        value: null
    },

    _editingDocument: {
        value: null
    },

    /**
     * The editingDocument that owns this editingObject
     */
    editingDocument: {
        get: function () {
            return this._editingDocument;
        }
    },

    /**
     * Initialize an EditingProxy suitable for editing through an EditingDocument
     *
     * @param {string} label The label for this object within the EditingDocument
     * @param {EditingDocument} editingDocument The editingDocument that owns this editingObject
     */
    init: {
        value: function (label, serialization, exportId, editingDocument) {
            var self = this;
            self.label = label;
            self._editingDocument = editingDocument;

            self._populateWithSerialization(serialization);

            return self;
        }
    },

    _properties: {
        value: null
    },

    /**
     * The map of properties that should be applied to the object this proxy represents
     */
    properties: {
        get: function () {
            return this._properties;
        }
    },

    _populateWithSerialization: {
        value: function (serialization) {
            this._properties = new Map(serialization.properties);

            if (serialization.lumieres) {
                this.comment = serialization.lumieres.comment;
                this.x = serialization.lumieres.x;
                this.y = serialization.lumieres.y;
            }
        }
    },

    setObjectProperty: {
        value: function (property, value) {
            this.properties.set(property, value);
        }
    },

    getObjectProperty: {
        value: function (property) {
            return this.properties.get(property);
        }
    },

    deleteObjectProperty: {
        value: function (property) {
            this.properties.delete(property);
        }
    },

    // Schematic Information
    x: {
        value: null
    },

    y: {
        value: null
    },

    comment: {
        value: null
    }

});
