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
            }
        }
    }

});
