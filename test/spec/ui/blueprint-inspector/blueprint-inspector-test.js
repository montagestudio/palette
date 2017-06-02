/* <copyright>
 </copyright> */
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component;
var TargetObject = require("./target-object").TargetObject;

exports.BlueprintInspectorTest = Component.specialize({

    constructor: {
        value: function () {
            var self = this;
            this.super();
            self.object = new TargetObject();
            self.object.blueprint.then(function(blueprint) {
                self.blueprint = blueprint;
                self.booleanPropertyBlueprint = blueprint.propertyDescriptorForName("booleanProperty");
                self.datePropertyBlueprint = blueprint.propertyDescriptorForName("dateProperty");
                self.enumPropertyBlueprint = blueprint.propertyDescriptorForName("enumProperty");
                self.listPropertyBlueprint = blueprint.propertyDescriptorForName("listProperty");
                self.mapPropertyBlueprint = blueprint.propertyDescriptorForName("mapProperty");
                self.numberPropertyBlueprint = blueprint.propertyDescriptorForName("numberProperty");
                self.objectPropertyBlueprint = blueprint.propertyDescriptorForName("objectProperty");
                self.stringPropertyBlueprint = blueprint.propertyDescriptorForName("stringProperty");
                self.urlPropertyBlueprint = blueprint.propertyDescriptorForName("urlProperty");
            }).done();
            return self;
        }
    },

    blueprintEditor: {
        value: null
    },

    booleanPropertyEditor: {
        value: null
    },

    datePropertyEditor: {
        value: null
    },

    enumPropertyEditor: {
        value: null
    },

    listPropertyEditor: {
        value: null
    },

    mapPropertyEditor: {
        value: null
    },

    numberPropertyEditor: {
        value: null
    },

    objectPropertyEditor: {
        value: null
    },

    stringPropertyEditor: {
        value: null
    },

    urlPropertyEditor: {
        value: null
    },

    booleanPropertyBlueprint: {
        value: null
    },

    datePropertyBlueprint: {
        value: null
    },

    enumPropertyBlueprint: {
        value: null
    },

    numberPropertyBlueprint: {
        value: null
    },

    objectPropertyBlueprint: {
        value: null
    },

    stringPropertyBlueprint: {
        value: null
    },

    urlPropertyBlueprint: {
        value: null
    },

    object: {
        value: null
    },

    blueprint: {
        value: null
    }

});
