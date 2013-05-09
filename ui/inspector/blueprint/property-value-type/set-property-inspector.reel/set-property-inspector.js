/**
 @module "./set-property-inspector.reel"
 @requires montage
 @requires "../../value-type-inspector.reel"
 */
var Montage = require("montage").Montage,
    Set = require("montage/collections/set"),
    ValueTypeInspector = require("../../value-type-inspector.reel").ValueTypeInspector;

/**
 Description TODO
 @class module:"./set-property-inspector.reel".SetPropertyInspector
 @extends module:"../../value-type-inspector.reel".ValueTypeInspector
 */
exports.SetPropertyInspector = Montage.create(ValueTypeInspector, /** @lends module:"./set-property-inspector.reel".SetPropertyInspector# */ {

    collectionValue: {
        get: function () {
            if (this.propertyBlueprint && this.propertyBlueprint.isToMany && (this.propertyBlueprint.collectionValueType === "set")) {
                if (this.objectValue) {
                    if (!(this.objectValue instanceof Set)) {
                        if (this.objectValue.forEach) {
                            this.objectValue = new Set(this.objectValue);
                        } else {
                            var temp = this.objectValue;
                            this.objectValue = new Set();
                            this.objectValue.add(temp);
                        }
                    }
                }
                return this.objectValue;
            }
            return new Set();
        },
        set: function (value) {
            this.objectValue = value;
        }
    },

    handleAddButtonAction: {
        value: function (evt) {
            if (!this.objectValue) {
                this.objectValue = new Set();
            }
            this.collectionValue.add("");
        }
    },

    handleRemoveButtonAction: {
        value: function (evt) {
            var index = evt.detail.index;
            if (this.collectionValue && (index >= 0) && (index < this.collectionValue.length)) {
                this.collectionValue.splice(index, 1);
            }
        }
    }



});
