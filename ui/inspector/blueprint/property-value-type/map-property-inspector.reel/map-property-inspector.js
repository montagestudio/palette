/**
 @module "./map-property-inspector.reel"
 @requires montage
 @requires "../../value-type-inspector.reel"
 */
var Montage = require("montage").Montage,
    Map = require("montage/collections/map"),
    ValueTypeInspector = require("../../value-type-inspector.reel").ValueTypeInspector;

/**
 Description TODO
 @class module:"./map-property-inspector.reel".MapPropertyInspector
 @extends module:"../../value-type-inspector.reel".ValueTypeInspector
 */
exports.MapPropertyInspector = Montage.create(ValueTypeInspector, /** @lends module:"./map-property-inspector.reel".MapPropertyInspector# */ {

    collectionValue: {
        get: function() {
            if (this.propertyBlueprint && this.propertyBlueprint.isToMany && (this.propertyBlueprint.collectionValueType === "map")) {
                if (this.objectValue) {
                    if (!(this.objectValue instanceof Map)) {
                        if (this.objectValue.forEach) {
                            this.objectValue = new Map(this.objectValue);
                        } else {
                            var temp = this.objectValue;
                            this.objectValue = new Map();
                            this.objectValue.add(temp);
                        }
                    }
                }
                return this.objectValue;
            }
            return new Map();
        },
        set: function(value) {
            this.objectValue = value;
        }
    },

    handleAddButtonAction: {
        value: function (evt) {
            if (!this.objectValue) {
                this.objectValue = new Map();
            }
            console.log("handleAddButtonAction");
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
