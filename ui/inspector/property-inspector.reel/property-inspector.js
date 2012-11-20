/**
    @module "ui/inspector/property-inspector.reel"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component;

var propertyTypeComponentMap = Object.create(null);

var PropertyTypeComponentDescriptor = exports.PropertyTypeComponentDescriptor = Montage.create(Montage, {

    init: {
        value: function(componentProto, tagName, valueProperty, elementAttributes) {
            this.componentProto = componentProto;
            this.tagName = tagName;
            if (valueProperty) {
                this.valueProperty = valueProperty;
            }
            if (elementAttributes) {
                this.elementAttributes = elementAttributes;
            }

            return this;
        }
    },

    /**
     * A Component prototype to use to represent the value.
     * @type {Object}
     */
    componentProto: {
        value: null
    },

    // TODO: use the descriptor of the component to work this out?
    /**
     * The tag name of the element to create for the component.
     * @type {string}
     */
    tagName: {
        value: null
    },

    /**
     * The property of the component that contains the value to use in the
     * object
     * @type {string}
     * @default "value"
     */
    valueProperty: {
        value: "value"
    },

    /**
     * Object of properties to set on the created element.
     * @type {Object}
     * @default {}
     */
    elementAttributes: {
        distinct: true,
        value: {}
    }
});

/**
 * Add a component descriptor for the given type.
 *
 * All objects that have a property of the given type will be rendered with
 * the component given in the descriptor.
 * @param {string} type       The type to use the descriptor for.
 * @param {PropertyTypeComponentDescriptor} descriptor The descriptor for the
 * component that should be used.
 * @return {boolean} true if the descriptor was added, false if a descriptor
 * for the type already exists.
 */
var addPropertyTypeComponentDescriptor = exports.addPropertyTypeComponentDescriptor = function(type, descriptor) {
    // Maybe add another argument to allow types to be replaced?
    if (type in propertyTypeComponentMap) {
        return false;
    }

    propertyTypeComponentMap[type] = descriptor;
    return true;
};

addPropertyTypeComponentDescriptor("*", PropertyTypeComponentDescriptor.create().init(
    require("montage/ui/dynamic-text.reel").DynamicText,
    "span",
    "value"
));

addPropertyTypeComponentDescriptor("string", PropertyTypeComponentDescriptor.create().init(
    require("montage/ui/input-text.reel").InputText,
    "input",
    "value",
    {type: "text"}
));

addPropertyTypeComponentDescriptor("number", PropertyTypeComponentDescriptor.create().init(
    require("montage/ui/input-number.reel").InputNumber,
    "input",
    "value",
    {type: "number"}
));

addPropertyTypeComponentDescriptor("boolean", PropertyTypeComponentDescriptor.create().init(
    require("montage/ui/input-checkbox.reel").InputCheckbox,
    "input",
    "checked",
    {type: "checkbox"}
));

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

            var componentDescriptor = value.valueType in propertyTypeComponentMap ? propertyTypeComponentMap[value.valueType] : propertyTypeComponentMap["*"];

            this.propertyValueField = this._createFieldComponent(componentDescriptor);
            this._propertyValueFieldValueProperty = componentDescriptor.valueProperty;

            // set field value from object
            this.propertyValueField[this._propertyValueFieldValueProperty] = this.object.getProperty(this.propertyDescription.name);

            // watch field changes and update object value
            this.propertyValueField.addPropertyChangeListener(this._propertyValueFieldValueProperty, this, false);

            this.needsDraw = true;
        }
    },


    /**
     * The component used to edit the value of the propertyDescription
     * @type {Component}
     */
    propertyValueField: {
        serializable: false,
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
            var element = document.createElement(descriptor.tagName);
            for (var attr in descriptor.elementAttributes) {
                if (descriptor.elementAttributes.hasOwnProperty(attr)) {
                    element[attr] = descriptor.elementAttributes[attr];
                }
            }

            var component = descriptor.componentProto.create();
            component.element = element;

            return component;
        }
    },

    draw: {
        value: function() {
            this._element.title = this._propertyDescription.helpString;
        }
    }
});
