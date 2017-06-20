/**
 * @module "ui/inspector/blueprint/property-editor.reel"
 * @requires montage/ui/component
 */
var Component = require("montage/ui/component").Component,
    Gate = require("montage/core/gate").Gate;

/**
 * An editor for a single property on an editing proxy. Displays an appropriate
 * editor for the property's type (if the target object has an ObjectDescriptor),
 * and displays a binding inspector if needed, as well as buttons for creating/
 * reverting bindings.
 * @class PropertyEditor
 * @extends module:montage/ui/component.Component
 */
exports.PropertyEditor = Component.specialize(/** @lends PropertyEditor# */ {

    _object: {
        value: null
    },

    /**
     * Target object proxy that is inspected.
     *
     * @type {EditingProxy}
     */
    object: {
        get: function () {
            return this._object;
        },
        set: function (value) {
            if (this._object !== value) {
                if (this.updateGate.getField("object")) {
                    this.updateGate.setField("object", false);
                }
                this._object = value;
                if (value) {
                    this.updateGate.setField("object", true);
                }
            }
        }
    },

    _propertyKey: {
        value: null
    },

    /**
     * The name of the property to inspect.
     *
     * @type {String}
     */
    propertyKey: {
        get: function () {
            return this._propertyKey;
        },
        set: function (value) {
            if (this._propertyKey !== value) {
                this._propertyKey = value;
            }
        }
    },

    _propertyDescriptor: {
        value: null
    },

    propertyDescriptor: {
        get: function () {
            return this._propertyDescriptor;
        },
        set: function (value) {
            this._propertyDescriptor = value;
        }
    },

    constructor: {
        value: function PropertyEditor () {
            var self = this;
            this.super();

            this.defineBinding("_key", {
                "<-": "propertyDescriptor.defined() ? propertyDescriptor.name : propertyKey"
            });
            this.defineBinding("isPropertyCustom", {
                "<-": "!propertyDescriptor"
            });
            this.defineBinding("_bindingModel", {
                "<-": "object.bindings.filter{key == ^_key}[0]"
            });
            this.defineBinding("_propertyIsBound", {
                "<-": "!!_bindingModel"
            });

            this.addPathChangeListener("object.properties.get(_key)", this, "_valueChanged");
            this.addPathChangeListener("_propertyIsBound", this, "handlePropertyTypeDependencyChange");
            this.addPathChangeListener("_key", function () {
                self.dispatchOwnPropertyChange("_isBindingComplex", self._isBindingComplex, void 0);
            });
            this.addPathChangeListener("_propertyDescriptor.isAssociationBlueprint", this, "handlePropertyTypeDependencyChange");
            this.addPathChangeListener("_propertyDescriptor.isToMany", this, "handlePropertyTypeDependencyChange");
            this.addPathChangeListener("_propertyDescriptor.collectionValueType", this, "handlePropertyTypeDependencyChange");
            this.addPathChangeListener("_propertyDescriptor.valueType", this, "handlePropertyTypeDependencyChange");
        }
    },

    enterDocument: {
        value: function (firstTime) {
            var self = this;
            if (firstTime) {
                this.element.addEventListener("mouseenter", function () {
                    self.classList.add("mouseOver");
                });
                this.element.addEventListener("mouseleave", function () {
                    self.classList.remove("mouseOver");
                });
            }
        }
    },

    /**
     * The true key of the property, calculated using both the propertyDescriptor
     * and the propertyKey public APIs.
     *
     * @private
     * @readonly
     * @type {string}
     */
    _key: {
        value: null
    },

    isPropertyCustom: {
        value: null
    },

    _bindingModel: {
        value: null
    },

    _propertyIsBound: {
        value: null
    },

    /**
     * Whether the targetPath of the binding is complex, i.e. is not just a
     * simple (valid) property key. This includes property chains (with .),
     * FRB functions, arithmetic, concatenation, higher order functions,
     * boolean operators, scope operators (^), etc.
     * A property editor that is inspecting a complex binding will not allow
     * the user to revert the binding into a property.
     *
     * @private
     * @readonly
     * @type {boolean}
     */
    _isBindingComplex: {
        get: function () {
            return !(/^[A-Za-z]+\w*$/.test(this._key));
        }
    },

    _propertyType: {
        value: null
    },

    _objectValue: {
        value: null
    },

    /*
     * Target value in the object
     */
    objectValue: {
        dependencies: ["object", "_propertyDescriptor"],
        get: function () {
            return this._objectValue;
        },
        set: function (value) {
            if (this._objectValue !== value && typeof value !== "undefined" && this._object && this._key) {
                if (!(this._propertyDescriptor && this._propertyDescriptor.readOnly)) {
                    this._object.editingDocument.setOwnedObjectProperty(this._object, this._key, value);
                }
            }
            this._objectValue = value;
        }
    },

    _valueChanged: {
        value: function (value) {
            this.objectValue = value;
        }
    },

    _updateGate: {
        value: null
    },
    /**
     Description TODO
     @function
     @returns this._blockDrawGate
     */
    updateGate: {
        enumerable: false,
        get: function () {
            if (!this._updateGate) {
                this._updateGate = new Gate().initWithDelegate(this);
                this._updateGate.setField("object", false);
            }
            return this._updateGate;
        }
    },

    gateDidBecomeTrue: {
        value: function (gate) {
            if (gate === this._updateGate) {
                if (this._object && this._propertyDescriptor) {
                    var value = this._object.getObjectProperty(this._propertyDescriptor.name);
                    if (this._objectValue !== value) {
                        this.dispatchBeforeOwnPropertyChange("objectValue", this._objectValue);
                        this._objectValue = value;
                        this.dispatchOwnPropertyChange("objectValue", value);
                    }
                }
            } else if (Component.prototype.gateDidBecomeTrue) {
                Component.prototype.gateDidBecomeTrue.call(this, gate);
            }
        }
    },

    gateDidBecomeFalse: {
        value: function (gate) {
            if (gate === this._updateGate) {
                this.dispatchBeforeOwnPropertyChange("objectValue", this._objectValue);
                this._objectValue = null;
                this.dispatchOwnPropertyChange("objectValue", null);
            } else if (Component.prototype.gateDidBecomeFalse) {
                Component.prototype.gateDidBecomeFalse.call(this, gate);
            }
        }
    },

    handlePropertyTypeDependencyChange: {
        value: function() {
            var descriptor = this._propertyDescriptor;

            if (this._propertyIsBound) {
                this._propertyType = "binding";
            } else if (!descriptor) {
                // TODO: Could do something smarter here, infer the type from the value
                this._propertyType = "string-property";
            } else if (descriptor.isAssociationBlueprint) {
                this._propertyType = (descriptor.isToMany ? descriptor.collectionValueType : "object") + "-association";
            } else {
                this._propertyType = (descriptor.isToMany ? descriptor.collectionValueType : descriptor.valueType) + "-property";
            }
        }
    },

    handleDefineBindingButtonAction: {
        value: function () {
            var bindingModel = Object.create(null);
            bindingModel.bound = true;
            bindingModel.targetObject = this._object;
            bindingModel.key = this._key;
            bindingModel.oneway = true;
            bindingModel.sourcePath = "";
            this.dispatchEventNamed("addBinding", true, false, {
                bindingModel: bindingModel
            });
        }
    },

    handleCancelBindingButtonAction: {
        value: function () {
            this.object.cancelObjectBinding(this._bindingModel);
            this._propertyIsBound = false;
        }
    },

    handleDeleteButtonAction: {
        value: function () {
            this.object.deleteObjectProperty(this._key);
        }
    }
});
