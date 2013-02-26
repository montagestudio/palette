/**
    @module "ui/ui/inspector/property-group.reel"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component,
    RangeController = require("montage/core/range-controller").RangeController;

/**
    Description TODO
    @class module:"ui/ui/inspector/property-group.reel".PropertyGroup
    @extends module:montage/ui/component.Component
*/
exports.PropertyGroup = Montage.create(Component, /** @lends module:"ui/ui/inspector/property-group.reel".PropertyGroup# */ {

    didCreate: {
        value: function() {
            this.propertiesController = RangeController.create();

            this.defineBinding("propertiesController.content", {"<-": "properties"});
        }
    },

    object: {
        value: null
    },

    name: {
        value: null
    },

    properties: {
        value: null
    },

    propertiesController: {
        serializable: false,
        value: null
    },

    _open: {
        value: false
    },
    open: {
        get: function() {
            return this._open;
        },
        set: function(value) {
            if (this._open === value) {
                return;
            }
            this._open = value;
            this.needsDraw = true;
        }
    },

    draw: {
        value: function() {
            this.element.open = this._open;
        }
    }

});
