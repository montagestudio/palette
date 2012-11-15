/**
    @module "ui/inspector/property-inspector.reel"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component;

/**
    Description TODO
    @class module:"ui/inspector/property-inspector.reel".PropertyInspector
    @extends module:montage/ui/component.Component
*/
exports.PropertyInspector = Montage.create(Component, /** @lends module:"ui/inspector/property-inspector.reel".PropertyInspector# */ {

    object: {
        value: null
    },

    propertyDescription: {
        value: null
    },

    propertyValueField: {
        value: null
    },

    prepareForDraw: {
        value: function () {
            this.propertyValueField.addPropertyChangeListener("value", this, false);
        }
    },

    handleChange: {
        value: function (notification) {
            if (!(this.object && this.propertyDescription)) {
                return;
            }

            //TODO perform edit in an undoable manner montageFrame/workbench/authoringDoc.setOwnedObjectProperty(object, newValue)
            //where does this happen? how do we know about it?
            this.object.setProperty(this.propertyDescription.name, this.propertyValueField.value);
        }
    }

});
