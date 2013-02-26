/**
 @module "./value-type-property-inspector"
 @requires montage
 @requires montage/ui/component
 */
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component;

/**
 Description TODO
 @class module:"./value-type-property-inspector".ValueTypePropertyInspector
 @extends module:montage/ui/component.Component
 */
var ValueTypePropertyInspector = exports.ValueTypePropertyInspector = Montage.create(Component, /** @lends module:"./value-type-property-inspector.reel".ValueTypePropertyInspector# */ {

    _object:{
        value:null
    },

    /*
     * Target object proxy that is inspected with the blueprint
     */
    object:{
        get:function () {
            return this._object;
        },
        set:function (value) {
            if (this._object != value) {
                this._object = value;
                this._getObjectValue();
            }
        }
    },

    _propertyBlueprint:{
        value:null
    },

    /*
     * Property blueprint that is inspected
     */
    propertyBlueprint:{
        get:function () {
            return this._propertyBlueprint;
        },
        set:function (value) {
            if (this._propertyBlueprint != value) {
                this._propertyBlueprint = value;
                this._getObjectValue();
            }
        }
    },

    _objectValue:{
        value:null
    },

    /*
     * Target value in the object
     */
    objectValue:{
        dependencies:["object", "propertyBlueprint"],
        get:function () {
            if (!this._objectValue) {
                this._getObjectValue();
            }
            return this._objectValue;
        },
        set:function (value) {
            this._objectValue = value;
            this._setObjectValue();
        }
    },

    _getObjectValue:{
        value:function () {
            if (this.object && this.propertyBlueprint) {
                var value = this.object.editingDocument.getOwnedObjectProperty(this.object, this.propertyBlueprint.name);
                if (this._objectValue != value) {
                    this.dispatchBeforeOwnPropertyChange("objectValue", this._objectValue);
                    this._objectValue = value;
                    this.dispatchOwnPropertyChange("objectValue", value);
                }
            }
        }
    },

    _setObjectValue:{
        value:function () {
            if (this.object && this.propertyBlueprint) {
                this.object.editingDocument.setOwnedObjectProperty(this.object, this.propertyBlueprint.name, this._objectValue);
            }
        }
    }

});
