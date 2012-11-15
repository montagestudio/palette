/**
    @module "ui/inspector/inspector.reel"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component,
    Promise = require("montage/core/promise").Promise,
    ArrayController = require("montage/ui/controller/array-controller").ArrayController;

/**
    Description TODO
    @class module:"ui/inspector/inspector.reel".Inspector
    @extends module:montage/ui/component.Component
*/
exports.Inspector = Montage.create(Component, /** @lends module:"ui/inspector/inspector.reel".Inspector# */ {

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
            this._objectDescriptionDeferred.reject("object changed before description was resolved");

            this._object = value;

            if (this._object) {
                var self = this;

                this._objectDescriptionDeferred = Promise.defer();
                this._object.description.then(this._objectDescriptionDeferred.resolve);

                this._objectDescriptionDeferred.promise.then(function (description) {
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

    /**
     * Used to prevent objectDescription being resolved if this.object changes
     * while the description is being loaded.
     *
     * Takes advantage of the fact that a promise cannot be resolved after
     * being rejected and vice versa.
     * @type {Promise}
     * @private
     */
    _objectDescriptionDeferred: {
        value: Promise.defer()
    },

    objectDescription: {
        serializable: false,
        value: null
    }

});
