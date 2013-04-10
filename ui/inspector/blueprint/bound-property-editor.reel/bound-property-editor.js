/**
 @module "./bound-property-editor.reel"
 @requires montage
 @requires montage/ui/component
 */
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component;

/**
 Description TODO
 @class module:"./bound-property-editor.reel".BoundPropertyEditor
 @extends module:montage/ui/component.Component
 */
exports.BoundPropertyEditor = Montage.create(Component, /** @lends module:"./bound-property-editor.reel".BoundPropertyEditor# */ {

    object: {
        value: null
    },

    binding: {
        value: null
    },

    label: {
        value: ""
    },

    handleRemoveButtonAction: {
        value: function (evt) {
            if (this.object && this.binding) {
                var index = this.object.bindings.indexOf(this.binding);
                if (index >= 0) {
                    this.object.bindings.splice(index, 1);
                }
            }
        }
    }


});
