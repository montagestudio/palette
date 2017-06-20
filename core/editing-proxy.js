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

    /**
     * @param {string} targetPath
     * @param {boolean} oneway
     * @param {string} sourcePath
     * @param {Object} converter
     * @return {Object} The binding model
     */
    defineObjectBinding: {
        value: function (targetPath, oneway, sourcePath, converter) {
            var binding = Object.create(null);

            // TODO guard against binding to the exact same targetPath twice
            binding.bound = true;
            binding.key = targetPath;
            binding.oneway = oneway;
            binding.sourcePath = sourcePath;
            binding.converter = converter;

            this.bindings.push(binding);

            return binding;
        }
    },

    /**
     * Add a a specified binding object to the proxy at a specific index
     * in the bindings collection
     */
    addBinding: {
        value: function (binding, insertionIndex) {
            var bindingIndex = this.bindings.indexOf(binding);

            if (-1 === bindingIndex) {
                if (isNaN(insertionIndex)) {
                    this.bindings.push(binding);
                } else {
                    this.bindings.splice(insertionIndex, 0, binding);
                }
            } else {
                //TODO guard against adding exact same binding to multiple proxies
                throw new Error("Cannot add the same binding to a proxy more than once");
            }

            return binding;
        }
    },

    /**
     * Update an existing binding with new parameters
     *
     * All parameters are required, currently you cannot update a single
     * property of the existing binding without affecting the others.
     *
     * @param {Object} binding The existing binding to update
     * @param {string} targetPath The targetPath to set on the binding
     * @param {boolean} oneway Whether or not to set the binding as being oneway
     * @param {string} sourcePath The sourcePath to set on the binding
     * @param {string} converter The converter to set on the binding
     */
    updateObjectBinding: {
        value: function (binding, targetPath, oneway, sourcePath, converter) {
            var bindingIndex = this.bindings.indexOf(binding);

            if (bindingIndex === -1) {
                throw new Error("Cannot update a binding that's not associated with this proxy.");
            }

            binding.bound = true;
            binding.key = targetPath;
            binding.oneway = oneway;
            binding.sourcePath = sourcePath;
            binding.converter = converter;

            return binding;
        }
    },

    /**
     * Remove the specific binding from the set of active bindings on this proxy
     *
     * @param {Object} binding The binding model
     * @return {Object} an object with two keys index and removedBinding
     */
    cancelObjectBinding: {
        value: function (binding) {
            var bindingIndex = this.bindings.indexOf(binding);

            if (bindingIndex > -1) {
                this.bindings.splice(bindingIndex, 1);
                return {index: bindingIndex, removedBinding: binding};
            } else {
                throw new Error("Cannot cancel a binding that's not associated with this proxy");
            }
        }
    }

});
