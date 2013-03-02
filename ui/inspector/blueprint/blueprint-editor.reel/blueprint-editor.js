/**
 @module "./blueprint-editor.reel"
 @requires montage
 @requires montage/ui/component
 */
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component,
    RangeController = require("montage/core/range-controller").RangeController;

/**
 Description TODO
 @class module:"./blueprint-editor.reel".BlueprintEditor
 @extends module:montage/ui/component.Component
 */
exports.BlueprintEditor = Montage.create(Component, /** @lends module:"./blueprint-editor.reel".BlueprintEditor# */ {

    didCreate:{
        value:function () {
            Component.didCreate.call(this);
            this.propertyGroupsController = RangeController.create();
        }
    },

    _object:{
        value:null
    },

    /*
     * Target object proxy that is inspected with the blueprint
     */
    object:{
        get:function () {
            return this._object;
        },
        set:function (value) {
            if (this._object != value) {
                this._object = value;
            }
        }
    },

    _blueprint:{
        value:null
    },

    /*
     * Property blueprint that is inspected
     */
    blueprint:{
        get:function () {
            return this._blueprint;
        },
        set:function (value) {
            if (this._blueprint != value) {
                this._blueprint = value;
                if (value != null) {
                    // we could create a binding to the propertyBlueprintGroups,
                    // but at the moment I'm not expecting the component blueprint
                    // to change at runtime
                    this.propertyGroupsController.content = value.propertyBlueprintGroups.map(function (groupName, index) {
                        return {
                            name:groupName,
                            properties:value.propertyBlueprintGroupForName(groupName),
                            open:index === 0
                        };
                    });
                }
            }
        }
    },

    propertyGroupsController:{
        serializable:false,
        value:null
    }

});
