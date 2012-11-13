/**
    @module "ui/inspector.reel"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component,
    ArrayController = require("montage/ui/controller/array-controller").ArrayController;

/**
    Description TODO
    @class module:"ui/inspector.reel".Inspector
    @extends module:montage/ui/component.Component
*/
exports.Inspector = Montage.create(Component, /** @lends module:"ui/inspector.reel".Inspector# */ {

    didCreate: {
        value: function () {
            this.propertyDescriptionController = ArrayController.create();
            Object.defineBinding(this.propertyDescriptionController, "content", {
                boundObject: this,
                boundObjectPropertyPath: "objectDescription.componentPropertyDescriptions",
                oneway: true
            });
        }
    },

    _object: {
        value: null
    },

    object: {
        get: function () {
            return this._object;
        },
        set: function (value) {
            if (value === this._object) {
                return;
            }

            this._object = value;

            // TODO if object changes before promise resolved ignore the old promise
            if (this._object) {
                var self = this;
                this._object.description.then(function (description) {
                    self.objectDescription = description;
                });
            } else {
                this.objectDescription = null;
            }
        }
    },

    propertyDescriptionController: {
        serializable: false,
        value: null
    },

    objectDescription: {
        serializable: false,
        value: null
    }

});
