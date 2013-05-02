var Montage = require("montage").Montage,
    MontageReviver = require("montage/core/serialization/deserializer/montage-reviver").MontageReviver,
    EditingProxy = require("../editing-proxy").EditingProxy;

exports.ProxyReviver = Montage.create(MontageReviver, {

    /*
    * Revive a montage proxied object.<br/>
    * <b>Note:</b> This need to be overwritten to make something useful
     */
    reviveMontageObject: {
        value: function(value, context, label) {
            return void 0;
        }
    },

    // Stop MontageReviver from didReviveObjects
    didReviveObjects: {
        value: function(objects, context) {
        }
    }
});
