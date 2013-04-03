/**
 @module "./property-editor.reel"
 @requires montage
 @requires montage/ui/component
 */
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component;

/**
 Description TODO
 @class module:"./property-editor.reel".PropertyEditor
 @extends module:montage/ui/component.Component
 */
exports.PropertyEditor = Montage.create(Component, /** @lends module:"./property-editor.reel".PropertyEditor# */ {

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
                this._object = value;
                this.__objectValueNeedsPull = true;
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
                this._propertyBlueprint = value;
                this.__objectValueNeedsPull = true;
            }
        }
    },

    __objectValueNeedsPull: {
        value: true
    },

    _objectValue: {
        value: null
    },

    /*
     * Target value in the object
     */
    objectValue: {
        dependencies: ["object", "propertyBlueprint"],
        get: function () {
            if (this.__objectValueNeedsPull) {
                if (this._object && this._propertyBlueprint) {
//                    console.log("Get value for " + this._propertyBlueprint.name)
                    this._objectValue = this._object.editingDocument.getOwnedObjectProperty(this._object, this._propertyBlueprint.name);
                    this.__objectValueNeedsPull = false;
                }
            }
            return this._objectValue;
        },
        set: function (value) {
            if (!this.__objectValueNeedsPull) {
                 if ((this._objectValue !== value) && this._object && this._propertyBlueprint) {
                    if (typeof value !== "undefined" && !this._propertyBlueprint.readOnly) {
//                        console.log("Set value for " + this._propertyBlueprint.name + " ", value)
                        this._object.editingDocument.setOwnedObjectProperty(this._object, this._propertyBlueprint.name, value);
                    }
                }
                this._objectValue = value;
            }
        }
    }

});
