/**
 @module "./property-editor.reel"
 @requires montage
 @requires montage/ui/component
 */
var Component = require("montage/ui/component").Component,
    Gate = require("montage/core/gate").Gate;

/**
 Description TODO
 @class module:"./property-editor.reel".PropertyEditor
 @extends module:montage/ui/component.Component
 */
exports.PropertyEditor = Component.specialize(/** @lends module:"./property-editor.reel".PropertyEditor# */ {

    constructor: {
        value: function PropertyEditor () {
            this.super();

            this.defineBinding("_propertyIsBound", {
                "<-": "object.bindings.some{targetPath == this.propertyBlueprint.name}"
            });

            this.addPathChangeListener("object.properties.get(propertyBlueprint.name)", this, "_valueChanged");
            this.addPathChangeListener("_propertyIsBound", this, "handlePropertyTypeDependencyChange");
            this.addPathChangeListener("propertyBlueprint.isAssociationBlueprint", this, "handlePropertyTypeDependencyChange");
            this.addPathChangeListener("propertyBlueprint.isToMany", this, "handlePropertyTypeDependencyChange");
            this.addPathChangeListener("propertyBlueprint.collectionValueType", this, "handlePropertyTypeDependencyChange");
            this.addPathChangeListener("propertyBlueprint.valueType", this, "handlePropertyTypeDependencyChange");
        }
    },

    _propertyIsBound: {
        value: null
    },

    _propertyType: {
        value: null
    },

    editingDocument: {
        value: null
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
                this._updateGate = Gate.create().initWithDelegate(this);
                this._updateGate.setField("object", false);
                this._updateGate.setField("propertyBlueprint", false);
            }
            return this._updateGate;
        }
    },

    _object: {
        value: null
    },

    /*
     * Target object proxy that is inspected with the blueprint
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

    _propertyBlueprint: {
        value: null
    },

    /*
     * Property blueprint that is inspected
     */
    propertyBlueprint: {
        get: function () {
            return this._propertyBlueprint;
        },
        set: function (value) {
            if (this._propertyBlueprint !== value) {
                if (this.updateGate.getField("propertyBlueprint")) {
                    this.updateGate.setField("propertyBlueprint", false);
                }
                this._propertyBlueprint = value;
                if (value) {
                    this.updateGate.setField("propertyBlueprint", true);
                }
            }
        }
    },

    _objectValue: {
        value: null
    },

    _valueChanged: {
        value: function (value) {
            this.objectValue = value;
        }
    },

    /*
     * Target value in the object
     */
    objectValue: {
        dependencies: ["object", "propertyBlueprint"],
        get: function () {
            return this._objectValue;
        },
        set: function (value) {
            if ((this._objectValue !== value) && this._object && this._propertyBlueprint) {
                if (typeof value !== "undefined" && !this._propertyBlueprint.readOnly) {
                    this._object.editingDocument.setOwnedObjectProperty(this._object, this._propertyBlueprint.name, value);
                }
            }
            this._objectValue = value;
        }
    },

    gateDidBecomeTrue: {
        value: function (gate) {
            if (gate === this._updateGate) {
                if (this._object && this._propertyBlueprint) {
                    var value = this._object.getObjectProperty(this._propertyBlueprint.name);
                    if (this._objectValue !== value) {
                        this.dispatchBeforeOwnPropertyChange("objectValue", this._objectValue);
                        this._objectValue = value;
                        this.dispatchOwnPropertyChange("objectValue", value);
                    }
                }
            } else if (Component.gateDidBecomeTrue) {
                Component.gateDidBecomeTrue.call(this, gate);
            }
        }
    },

    gateDidBecomeFalse: {
        value: function (gate) {
            if (gate === this._updateGate) {
                this.dispatchBeforeOwnPropertyChange("objectValue", this._objectValue);
                this._objectValue = null;
                this.dispatchOwnPropertyChange("objectValue", null);
            } else if (Component.gateDidBecomeFalse) {
                Component.gateDidBecomeFalse.call(this, gate);
            }
        }
    },

    //jshint -W074
    handlePropertyTypeDependencyChange: {
        value: function() {
            var blueprint = this.propertyBlueprint;

            if (!blueprint) {
                return;
            }

            if (this._propertyIsBound) {
                this._propertyType = "binding";
            } else if (blueprint.isAssociationBlueprint) {
                if (blueprint.isToMany) {
                    if (blueprint.collectionValueType === "list") {
                        this._propertyType = "list-association";
                    } else if (blueprint.collectionValueType === "set") {
                        this._propertyType = "set-association";
                    } else if (blueprint.collectionValueType === "map") {
                        this._propertyType = "map-association";
                    }
                } else {
                    this._propertyType = "object-association";
                }
            } else {
                if (blueprint.isToMany) {
                    if (blueprint.collectionValueType === "list") {
                        this._propertyType = "list-property";
                    } else if (blueprint.collectionValueType === "set") {
                        this._propertyType = "set-property";
                    } else if (blueprint.collectionValueType === "map") {
                        this._propertyType = "map-property";
                    }
                } else {
                    if (blueprint.valueType === "boolean") {
                        this._propertyType = "boolean-property";
                    } else if (blueprint.valueType === "date") {
                        this._propertyType = "date-property";
                    } else if (blueprint.valueType === "enum") {
                        this._propertyType = "enum-property";
                    } else if (blueprint.valueType === "number") {
                        this._propertyType = "number-property";
                    } else if (blueprint.valueType === "object") {
                        this._propertyType = "object-property";
                    } else if (blueprint.valueType === "string") {
                        this._propertyType = "string-property";
                    } else if (blueprint.valueType === "url") {
                        this._propertyType = "url-property";
                    } else if (blueprint.valueType === "resource") {
                        this._propertyType = "resource-property";
                    } else if (blueprint.valueType === "range") {
                        this._propertyType = "range-property";
                    }
                }
            }
        }
    }
    //jshint +W074
});
