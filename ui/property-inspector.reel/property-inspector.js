/**
    @module "ui/property-inspector.reel"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component;

/**
    Description TODO
    @class module:"ui/property-inspector.reel".PropertyInspector
    @extends module:montage/ui/component.Component
*/
exports.PropertyInspector = Montage.create(Component, /** @lends module:"ui/property-inspector.reel".PropertyInspector# */ {

    object: {
        value: null
    },

    propertyDescription: {
        value: null
    }

});
