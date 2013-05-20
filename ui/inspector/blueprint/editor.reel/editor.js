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

    title:{
        dependencies:["objectBlueprint"],
        get:function () {
            return this.objectBlueprint ? this.objectBlueprint.name : "";
        }
    },

    object:{
        value:null
    },

    objectBlueprint:{
        value:null
    },

    editingDocument:{
        value:null
    }

});
