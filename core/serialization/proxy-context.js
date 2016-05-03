var Montage = require("montage").Montage,
    MontageContext = require("montage/core/serialization/deserializer/montage-interpreter").MontageContext;

exports.ProxyContext = MontageContext.specialize({

    constructor: {
        value: function ProxyContext() {
            this.super();
        }
    },

    init: {
        value: function (serialization, reviver, objects) {
            // TODO: MontageContext.init also takes an "element" and "_require" parameter. Should these be included?
            // The old Context, i.e. Mousse's Context, did not have these parameters.
            MontageContext.prototype.init.call(this, serialization, reviver, objects);

            return this;
        }
    },

    editingDocument: {
        value: null
    },

    ownerExportId: {
        value: void 0
    },

    getObjects: {
        value: function () {
            var results = [],
                serialization = this._serialization,
                object;

            for (var label in serialization) {
                if (serialization.hasOwnProperty(label)) {
                    object = this.getObject(label);
                    results.push(object);
                }
            }

            return results;
        }
    },

    getObject: {
        value: function (label) {
            var serialization = this._serialization,
                reviver = this._reviver,
                objects = this._objects,
                object;

            if (label in objects) {
                return objects[label];
            } else if (label in serialization) {
                object = reviver.reviveRootObject(serialization[label], this, label);
                // If no object has been set by the reviver we safe its
                // return, it could be a value or a promise, we need to
                // make sure the object won't be revived twice.
                if (!(label in objects)) {
                    objects[label] = object;
                }

                return object;
            } else {
                throw new Error("Object with label '" + label + "' was not found.");
            }
        }
    }
});
