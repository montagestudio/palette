/**
    @module "ui/inspector/property-inspector.reel"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component;

var typeComponentMap = {
    "*": {
        component: require("montage/ui/dynamic-text.reel").DynamicText,
        element: "span",
        attributes: {},
        value: "value"
    },
    "string": {
        component: require("montage/ui/input-text.reel").InputText,
        element: "input",
        attributes: {type: "text"},
        value: "value"
    },
    "number": {
        component: require("montage/ui/input-number.reel").InputNumber,
        element: "input",
        attributes: {type: "number"},
        value: "value"
    },
    "boolean": {
        component: require("montage/ui/input-checkbox.reel").InputCheckbox,
        element: "input",
        attributes: {type: "checkbox"},
        value: "checked"
    }
};

//"string", "number", "boolean", "date", "enum", "set", "list", "map", "url", "object");

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

            if (this.propertyValueField) {
                this.propertyValueField.removePropertyChangeListener("value", this, false);
            }

            var componentDescriptor = value.valueType in typeComponentMap ? typeComponentMap[value.valueType] : typeComponentMap["*"];

            this.propertyValueField = this._createFieldComponent(componentDescriptor);
            this._propertyValueFieldValueProperty = componentDescriptor.value;

            // set field value from object
            this.propertyValueField[this._propertyValueFieldValueProperty] = this.object.getProperty(this.propertyDescription.name);

            // update object value from field
            this.propertyValueField.addPropertyChangeListener(this._propertyValueFieldValueProperty, this, false);
        }
    },


    /**
     * The component used to edit the value of the propertyDescription
     * @type {Component}
     */
    propertyValueField: {
        value: null
    },



    handleChange: {
        value: function (notification) {
            if (!(this.object && this.propertyDescription)) {
                return;
            }

            //TODO perform edit in an undoable manner montageFrame/workbench/authoringDoc.setOwnedObjectProperty(object, newValue)
            //where does this happen? how do we know about it?
            this.object.setProperty(this.propertyDescription.name, this.propertyValueField[this._propertyValueFieldValueProperty]);
        }
    },

    /**
     * The property of the propertyValueField which contains the value for
     * the object's property
     * @type {string}
     */
    _propertyValueFieldValueProperty: {
        value: "value"
    },

    _createFieldComponent: {
        value: function(descriptor) {
            var element = document.createElement(descriptor.element);
            for (var attr in descriptor.attributes) {
                element[attr] = descriptor.attributes[attr];
            }

            var component = descriptor.component.create();
            component.element = element;

            return component;
        }
    }
});
