/**
 @module "./bound-property-editor.reel"
 @requires montage
 @requires montage/ui/component
 */
var Component = require("montage/ui/component").Component;

/**
 Description TODO
 @class module:"./bound-property-editor.reel".BoundPropertyEditor
 @extends module:montage/ui/component.Component
 */
exports.BoundPropertyEditor = Component.specialize(/** @lends module:"./bound-property-editor.reel".BoundPropertyEditor# */ {

    /**
     * @event editBindingForObject
     * Dispatched when the user clicks the bound property editor. Event detail
     * contains the bindingModel and the existing binding. Should be
     * used to bring up a modal for binding customization.
     */

    constructor: {
        value: function BoundPropertyEditor() {
            this.super();
        }
    },

    object: {
        value: null
    },

    binding: {
        value: null
    },

    label: {
        value: ""
    },

    handlePress: {
        value: function(evt) {
            if (this.object && this.binding) {
                var bindingModel = Object.create(null);
                bindingModel.bound = true;
                bindingModel.targetObject = this.object;
                bindingModel.key = this.binding.key;
                bindingModel.oneway = this.binding.oneway;
                bindingModel.sourcePath = this.binding.sourcePath;
                bindingModel.converter = this.binding.converter;

                this.dispatchEventNamed("addBinding", true, false, {
                    bindingModel: bindingModel,
                    existingBinding: this.binding
                });
            }
        }
    }

});
