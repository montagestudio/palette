/**
 @module "./list-property-inspector.reel"
 @requires montage
 @requires "../../value-type-inspector.reel"
 */
var Montage = require("montage").Montage,
    shim = require("montage/collections/shim"),
    ValueTypeInspector = require("../../value-type-inspector.reel").ValueTypeInspector;

/**
 Description TODO
 @class module:"./list-property-inspector.reel".ListPropertyInspector
 @extends module:"../../value-type-inspector.reel".ValueTypeInspector
 */
exports.ListPropertyInspector = Montage.create(ValueTypeInspector, /** @lends module:"./list-property-inspector.reel".ListPropertyInspector# */ {

    //jshint -W009
    collectionValue: {
        get: function () {
            if (this.propertyBlueprint && this.propertyBlueprint.isToMany && (this.propertyBlueprint.collectionValueType === "list")) {
                if (this.objectValue) {
                    if (!(this.objectValue instanceof Array)) {
                        if (this.objectValue.forEach) {
                            this.objectValue = new Array(this.objectValue);
                        } else {
                            var temp = this.objectValue;
                            this.objectValue = new Array();
                            this.objectValue.add(temp);
                        }
                    }
                }
                return this.objectValue;
            }
            return new Array();
        },
        set: function (value) {
            this.objectValue = value;
        }
    },

    handleAddButtonAction: {
        value: function (evt) {
            if (!this.objectValue) {
                this.objectValue = new Array();
            }
            this.collectionValue.add("");
        }
    },
    //jshint +W009

    handleRemoveButtonAction: {
        value: function (evt) {
            var index = evt.detail.index;
            if (this.collectionValue && (index >= 0) && (index < this.collectionValue.length)) {
                this.collectionValue.splice(index, 1);
            }
        }
    }


});
