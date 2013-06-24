var Montage = require("montage").Montage,
    MontageReviver = require("montage/core/serialization/deserializer/montage-reviver").MontageReviver,
    Promise = require("montage/core/promise").Promise,
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

            if (Promise.isPromise(revivedSerialization)) {
                return revivedSerialization.then(function (revivedSerialization) {
                    if (this.rootObjectLabel === label) {
                        exportId = context.ownerExportId;
                    } else {
                        exportId = revivedSerialization.prototype || revivedSerialization.object;
                    }

                    return proxyObject.init(label, revivedSerialization, exportId, context.editingDocument);
                });
            } else {
                if (this.rootObjectLabel === label) {
                    exportId = context.ownerExportId;
                } else {
                    exportId = revivedSerialization.prototype || revivedSerialization.object;
                }

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
