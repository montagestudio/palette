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

    editingDocument:{
        value:null
    },

    title:{
        dependencies:["objectBlueprint"],
        get:function () {
            return this.objectBlueprint ? this.objectBlueprint.name : "";
        }
    },

    _object:{
        value:null
    },
    object:{
        get:function () {
            return this._object;
        },
        set:function (value) {
            if (value === this._object) {
                return;
            }
            this._object = value;
            var self = this;

            if (this._object) {
                // We have a proxy object
                if (this._object.proxiedObject) {
                    this._object.proxiedObject.blueprint.then(function (blueprint) {

                        self.dispatchBeforeOwnPropertyChange("objectBlueprint", self.objectBlueprint);
                        self.objectBlueprint = blueprint;
                        self.dispatchOwnPropertyChange("objectBlueprint", blueprint);

                    }).done();
                } else {
                    console.log("We have a proxy object without any object !!!!", this._object);
                    this.objectBlueprint = null;
                }
            } else {
                this.objectBlueprint = null;
            }
        }
    },

    objectBlueprint:{
        serializable:false,
        value:null
    }

});
