var Montage = require("montage").Montage,
    MontageReviver = require("montage/core/serialization/deserializer/montage-reviver").MontageReviver,
    EditingProxy = require("../editing-proxy").EditingProxy;

exports.ProxyReviver = MontageReviver.specialize({

    constructor: {
        value: function ProxyReviver() {
            this.super();
        }
    },

    /*
     * Revive a montage proxied object.<br/>
     * <b>Note:</b> This need to be overwritten to make something useful
     */
    reviveMontageObject: {
        value: function (value, context, label) {

            if (context.hasUserObject(label)) {
                return context.getUserObject(label);
            }

            var exportId,
                proxyObject = new this.proxyConstructor(),
                revivedSerialization;

            context.setObjectLabel(proxyObject, label);
            revivedSerialization = this.reviveObjectLiteral(value, context);

            if (this.rootObjectLabel === label) {
                exportId = context.ownerExportId;
            }

            if (Promise.isPromise(revivedSerialization)) {
                return revivedSerialization.then(function (revivedSerialization) {
                    return proxyObject.init(label, revivedSerialization, exportId, context.editingDocument);
                });
            } else {
                return proxyObject.init(label, revivedSerialization, exportId, context.editingDocument);
            }
        }
    },

    rootObjectLabel: {
        value: "root"
    },

    proxyConstructor: {
        value: EditingProxy
    },

    // Stop MontageReviver from didReviveObjects
    didReviveObjects: {
        value: function (objects, context) {
        }
    }
});
