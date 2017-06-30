var Target = require("montage/core/target").Target,
    MontageReviver = require("montage/core/serialization/deserializer/montage-reviver").MontageReviver,
    Map = require("montage/collections/map");

/**
 @class module:palette/coreediting-proxy.EditingProxy
 This the abstract class far all editor proxies.
 */
exports.EditingProxy = Target.specialize( /** @lends module:palette/coreediting-proxy.EditingProxy# */  {

    constructor: {
        value: function EditingProxy() {
            this.super();
        }
    },

    destroy: {
        value: function() {
            this.cancelBindings();
            this._editingDocument = null;
        }
    },

    nextTarget: {
        get: function() {
            return this.editingDocument;
        }
    },

    proxyType: {
        get: function() {
            return "ProxyObject";
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

    _exportId: {
        value: null
    },

    /**
     * The exportId of the object this proxy represents
     * @note An exportId is comprised of a moduleId and either an explicit or implicit exportName
     * @example "foo/bar/baz[Baz]"
     */
    exportId: {
        get: function () {
            return this._exportId;
        }
    },

    _moduleId: {
        value: null
    },

    /**
     * The moduleId portion of the exportId string
     * @example "foo/bar/baz"
     */
    moduleId: {
        get: function () {
            if (!this._moduleId && this._exportId) {
                var fileUrl = this.editingDocument.url;
                var packageUrl = this.editingDocument.packageRequire.location;
                var baseModuleId = "";
                if (fileUrl.indexOf(packageUrl) > -1) {
                    baseModuleId = fileUrl.substring(packageUrl.length);
                }

                var moduleId = MontageReviver.parseObjectLocationId(this._exportId).moduleId;
                if (moduleId[0] === "." && (moduleId[1] === "." || moduleId[1] === "/")) {
                    moduleId = this.editingDocument.packageRequire.resolve(baseModuleId + "/" + moduleId, baseModuleId);
                }
                this._moduleId = moduleId;
            }
            return this._moduleId;
        }
    },

    _exportName: {
        value: null
    },

    /**
     * The exportName portion of the exportId
     */
    exportName: {
        get: function () {
            if (!this._exportName && this._exportId) {
                this._exportName = MontageReviver.parseObjectLocationId(this._exportId).objectName;
            }
            return this._exportName;
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
            self._exportId = exportId;
            self._editingDocument = editingDocument;

            self._populateWithSerialization(serialization);

            return self;
        }
    },

    _originalSerializationMap: {
        value: null
    },

    /**
     * A map of the original serialization used to create this proxy
     */
    originalSerializationMap: {
        get: function () {
            return this._originalSerializationMap;
        }
    },

    _properties: {
        value: null
    },

    /**
     * The map of properties that should be applied to the object this proxy represents
     *
     * @type {Map}
     */
    properties: {
        get: function () {
            return this._properties;
        }
    },

    _bindings: {
        value: null
    },

    /**
     * The collection of bindings associated with the object this proxy represents
     */
    bindings: {
        get: function () {
            return this._bindings;
        }
    },

    _populateWithSerialization: {
        value: function (serialization) {
            var serializationBindings;

            this._originalSerializationMap = Map.from(serialization);

            // We specifically surface the properties as a top level API
            this._properties = Map.from(serialization.properties);

            serializationBindings = serialization.bindings || {};
            this._bindings = Object.keys(serializationBindings).map(function (key) {
                var bindingEntry = serialization.bindings[key];
                var bindingDescriptor = Object.create(null);

                bindingDescriptor.bound = true;
                bindingDescriptor.key = key;
                bindingDescriptor.oneway = ("<-" in bindingEntry);
                bindingDescriptor.sourcePath = bindingDescriptor.oneway ? bindingEntry["<-"] : bindingEntry["<->"];
                /* TODO the converter seems to be maintaining state */
                if (bindingEntry.converter) {
                    bindingDescriptor.converter = bindingEntry.converter;
                }

                return bindingDescriptor;
            });
        }
    },

    // Properties API

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

    setObjectProperties: {
        value: function (values) {
            for (var name in values) {
                if (values.hasOwnProperty(name)) {
                    this.setObjectProperty(name, values[name]);
                }
            }
        }
    },

    getObjectProperties: {
        value: function (values) {
            var result = {},
                entries,
                entry;

            if (values) {
                // We have a values object only returmn the required values
                for (var name in values) {
                    if (values.hasOwnProperty(name)) {
                        result[name] = this.getObjectProperty(name);
                    }
                }
            } else {
                // return all properties
                entries = this.properties.entries();

                while (entry = entries.next().value) {
                    result[entry[0]] = entry[1];
                }
            }
            return result;
        }
    },

    // Bindings API

    /**
     * Creates a new binding, or updates an existing binding (that matches the
     * given key parameter).
     *
     * @param {string} key
     * @param {boolean} oneway
     * @param {string} sourcePath
     * @param {Object} converter
     * @return {Object} The binding model
     */
    defineObjectBinding: {
        value: function (key, oneway, sourcePath, converter) {
            var binding = this.getObjectBinding(key);

            if (!binding) {
                binding = Object.create(null);
                binding.key = key;
                this.bindings.push(binding);
            }

            binding.bound = true;
            binding.oneway = oneway;
            binding.sourcePath = sourcePath;
            binding.converter = converter;

            return binding;
        }
    },

    /**
     * Returns the binding model for the binding with the given target path.
     *
     * @param {string} key
     * @return {Object?}
     */
    getObjectBinding: {
        value: function (key) {
            return this.bindings.filter(function (binding) {
                return binding.key === key;
            })[0];
        }
    },

    /**
     * Remove the binding with the given key from the set of active bindings on this proxy.
     *
     * @param {string} key
     * @return {Object} the removed binding model
     */
    cancelObjectBinding: {
        value: function (key) {
            var i,
                bindingsLength = this.bindings.length,
                binding;
            for (i = 0; i < bindingsLength; ++i) {
                binding = this.bindings[i];
                if (binding.key === key) {
                    this.bindings.splice(i, 1);
                    return binding;
                }
            }
        }
    }
});
