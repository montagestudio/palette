/* <copyright>
 </copyright> */
var Component = require("montage/ui/component").Component,
    TargetObject = require("./target-object").TargetObject,
    EditingProxy = require("palette/core/editing-proxy").EditingProxy;

exports.PropertyEditorTest = Component.specialize({

    constructor: {
        value: function () {
            var self = this,
                object = new TargetObject();
            this.super();
            this.proxy = new EditingProxy().init("target", {
                "prototype": "spec/ui/property-editor/target-object",
                "bindings": {
                    "propertyB": {"<-": "'abc'"},
                    "customPropertyB": {"<-": "'def'"},
                    "complex.binding": {"<-": "'ghi'"}
                }
            }, "spec/ui/property-editor/target-object", {});
            object.blueprint.then(function (blueprint) {
                self.propertyDescriptorA = blueprint.propertyDescriptorForName("propertyA");
                self.propertyDescriptorB = blueprint.propertyDescriptorForName("propertyB");
            });
            return this;
        }
    },

    propertyEditor: {
        value: null
    },

    boundPropertyEditor: {
        value: null
    },

    customPropertyEditor: {
        value: null
    },

    boundCustomPropertyEditor: {
        value: null
    },

    complexBindingEditor: {
        value: null
    },

    propertyDescriptorA: {
        value: null
    },

    propertyDescriptorB: {
        value: null
    },

    proxy: {
        value: null
    }

});
