/**
 @module "./value-type-inspector.reel"
 @requires montage
 @requires montage/ui/component
 */
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component;

/**
 Description TODO
 @class module:"./value-type-inspector.reel".ValueTypeInspector
 @extends module:montage/ui/component.Component
 */
var ValueTypeInspector = exports.ValueTypeInspector = Montage.create(Component, /** @lends module:"./value-type-inspector.reel".ValueTypeInspector# */ {

    _label:{
        value:""
    },

    label:{
        get:function () {
            return this._label;
        },
        set:function (value) {
            this._label = value;
        }
    },

    _readOnlyLabel:{
        value:true
    },

    readOnlyLabel:{
        get:function () {
            if (!this._readOnlyLabel) {
                this._readOnlyLabel = true;
            }
            return this._readOnlyLabel;
        },
        set:function (value) {
            this._readOnlyLabel = value;
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
            this._propertyBlueprint = value;
        }
    },

    _objectValue:{
        value:null
    },

    /*
     * Target value in the object
     */
    objectValue:{
        get:function () {
            return this._objectValue;
        },
        set:function (value) {
            this._objectValue = value;
        }
    }

});
