var Montage = require("montage").Montage,
    MontageReviver = require("montage/core/serialization/deserializer/montage-reviver").MontageReviver;

/**
 @class module:palette/coreediting-proxy.EditingProxy
 This the abstract class far all editor proxies.
 */
exports.EditingProxy = Montage.create(Montage, /** @lends module:palette/coreediting-proxy.EditingProxy# */  {

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
        value: function (label, editingDocument) {
            this.label = label;
            this._editingDocument = editingDocument;
            return this;
        }
    },

    setObjectProperty: {
        value: function (property, value) {
            this.setPath("properties." + property, value);
        }
    },

    getObjectProperty: {
        value: function (property) {
            return this.getPath("properties." + property);
        }
    }

});
