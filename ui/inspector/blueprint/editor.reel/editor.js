/**
    @module "./editor.reel"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component,
    RangeController = require("montage/core/range-controller").RangeController;

/**
    Description TODO
    @class module:"./editor.reel".Editor
    @extends module:montage/ui/component.Component
*/
exports.Editor = Montage.create(Component, /** @lends module:"./editor.reel".Editor# */ {

    editingDocument: {
        value: null
    },

    didCreate: {
        value: function () {
            this.propertyGroupsController = RangeController.create();
        }
    },

    title: {
        dependencies:["blueprint"],
        get: function() {
            return this.blueprint ? this.blueprint.name : "";
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
            var self = this;

            if (this._object) {
                // We have a proxy object
                if (this._object.proxiedObject) {
                    this._object.proxiedObject.blueprint.then(function(blueprint) {

                        self.dispatchBeforeOwnPropertyChange("blueprint", self.blueprint);
                        self.blueprint = blueprint;
                        self.dispatchOwnPropertyChange("blueprint", blueprint);

                        // we could create a binding to the propertyBlueprintGroups,
                        // but at the moment I'm not expecting the component blueprint
                        // to change at runtime
                        self.propertyGroupsController.content = blueprint.propertyBlueprintGroups.map(function (groupName, index) {
                            return {
                                name: groupName,
                                properties: blueprint.propertyBlueprintGroupForName(groupName),
                                open: index === 0
                            };
                        });


                    }).done;
                } else {
                    console.log("We have a proxy object without any object !!!!", this._object);
                    this.blueprint = null;
                }
            } else {
                this.blueprint = null;
            }
        }
    },

    propertyGroupsController: {
        serializable: false,
        value: null
    },

    blueprint: {
        serializable: false,
        value: null
    }

});
