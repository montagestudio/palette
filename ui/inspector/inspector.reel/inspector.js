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
            this.propertyGroupsController = ArrayController.create();
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
                this._object.description.then(this._objectDescriptionDeferred.resolve, this._objectDescriptionDeferred.reject);

                this._objectDescriptionDeferred.promise.then(function (description) {
                    self.objectDescription = description;

                    // we could create a binding to the componentPropertyDescriptionGroups,
                    // but at the moment I'm not expecting the component description
                    // to change at runtime
                    self.propertyGroupsController.content = description.componentPropertyDescriptionGroups.map(function(groupName, index) {
                        return {
                            name: groupName,
                            properties: description.componentPropertyDescriptionGroupForName(groupName),
                            open: index === 0
                        };
                    });
                }, function() {
                    self.propertyGroupsController.content = [];
                });
            } else {
                this.objectDescription = null;
            }
        }
    },

    handleChange: {
        value: function(change) {
            var self = this;

        }
    },

    propertyGroupsController: {
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
