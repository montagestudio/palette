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
        value: function(componentProto, tagName, valueProperty, elementAttributes, optionsProperty) {
            this.componentProto = componentProto;
            this.tagName = tagName;
            if (valueProperty) {
                this.valueProperty = valueProperty;
            }
            if (elementAttributes) {
                this.elementAttributes = elementAttributes;
            }
            if (optionsProperty) {
                 this.optionsProperty = optionsProperty;
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
     * The property of the component that contains the option to use in the
     * property
     * @type {string}
     * @default "value"
     */
    optionsProperty: {
        value: "option"
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

addPropertyTypeComponentDescriptor("enum", PropertyTypeComponentDescriptor.create().init(
    require("montage/ui/select.reel").Select,
    "select",
    "value",
    {},
    "content"
));

addPropertyTypeComponentDescriptor("url", PropertyTypeComponentDescriptor.create().init(
    require("montage/ui/input-text.reel").InputText,
    "input",
    "value",
    {type: "text"}
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

    _propertyBlueprint: {
        value: null
    },
    propertyBlueprint: {
        get: function() {
            return this._propertyBlueprint;
        },
        set: function(value) {
            if (this._propertyBlueprint === value) {
                return;
            }

            this._propertyBlueprint = value;

            if (this.propertyValueField) {
                this.propertyValueField.removePropertyChangeListener("value", this, false);
            }

            if (!value) {
                return;
            }

            var componentDescriptor;
            if (value.isToMany) {
                // We need something better that this to create list of values. We should use the value type!
                componentDescriptor = propertyTypeComponentMap["*"];
            } else {
                componentDescriptor = value.valueType in propertyTypeComponentMap ? propertyTypeComponentMap[this._propertyBlueprint.valueType] : propertyTypeComponentMap["*"];
            }

            this.propertyValueField = this._createFieldComponent(componentDescriptor);
            this._propertyValueFieldValueProperty = componentDescriptor.valueProperty;
            this._propertyOptionsFieldValueProperty = componentDescriptor.optionsProperty;

            // set field value from object
            this.propertyValueField[this._propertyValueFieldValueProperty] = this.object.properties.getPath(this._propertyBlueprint.name);

            // watch field changes and update object value
            this.propertyValueField.addOwnPropertyChangeListener(this._propertyValueFieldValueProperty, this, false);

            // Set the list of options
            this.propertyValueField[this._propertyOptionsFieldValueProperty] = this._propertyBlueprint.enumValues;

            this.needsDraw = true;
        }
    },


    /**
     * The component used to edit the value of the propertyBlueprint
     * @type {Component}
     */
    propertyValueField: {
        serializable: false,
        value: null
    },

    handlePropertyChange: {
        value: function (notification) {
            if (!(this.object && this.propertyBlueprint)) {
                return;
            }

            //TODO also pass along the object? Technically we know what the object was higher up in the inspector...
            this.dispatchEventNamed("propertyInspectorChange", true, true, {
                propertyName: this.propertyBlueprint.name,
                value: this.propertyValueField[this._propertyValueFieldValueProperty]
            });
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

    /**
     * The property of the propertyOptionsField which contains the options for
     * the object's property
     * @type {string}
     */
    _propertyOptionsFieldValueProperty: {
        value: "content"
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
            this._element.title = this._propertyBlueprint.helpKey;
        }
    }
});
