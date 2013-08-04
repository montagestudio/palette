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
var ValueTypeInspector = exports.ValueTypeInspector = Component.specialize(/** @lends module:"./value-type-inspector.reel".ValueTypeInspector# */ {

    constructor: {
        value: function ValueTypeInspector() {
            this.super();
        }
    },

    label: {
        value: ""
    },

    _readOnlyLabel: {
        value: true
    },

    readOnlyLabel: {
        get: function () {
            if (!this._readOnlyLabel) {
                this._readOnlyLabel = true;
            }
            return this._readOnlyLabel;
        },
        set: function (value) {
            this._readOnlyLabel = value;
        }
    },

    /*
     * Property blueprint that is inspected
     */
    propertyBlueprint: {
        value: null
    },

    objectValue: {
        value: null
    },

    editingDocument: {
        value: null
    }

});
