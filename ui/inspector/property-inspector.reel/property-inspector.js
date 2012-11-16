/**
    @module "ui/inspector/property-inspector.reel"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component;

var InputCheckbox = require("montage/ui/input-checkbox.reel").InputCheckbox;
var InputText = require("montage/ui/input-text.reel").InputText;



/**
    Description TODO
    @class module:"ui/inspector/property-inspector.reel".PropertyInspector
    @extends module:montage/ui/component.Component
*/
exports.PropertyInspector = Montage.create(Component, /** @lends module:"ui/inspector/property-inspector.reel".PropertyInspector# */ {

    object: {
        value: null
    },

    _propertyDescription: {
        value: null
    },
    propertyDescription: {
        get: function() {
            return this._propertyDescription;
        },
        set: function(value) {
            if (this._propertyDescription === value) {
                return;
            }
            this._propertyDescription = value;
            if (value.valueType === "boolean") {
                var component = InputCheckbox.create();

                var element = document.createElement("input");
                element.type = "checkbox";

                component.element = element;

                this.fieldComponent = component;
            } else {
                var component = InputText.create();

                var element = document.createElement("input");
                element.type = "text";

                component.element = element;

                this.fieldComponent = component;
            }
        }
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
    },

    fieldComponent: {
        value: null
    }

});
