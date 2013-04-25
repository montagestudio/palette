/**
    @module "./list-association-inspector.reel"
    @requires montage
    @requires "../../value-type-inspector.reel"
*/
var Montage = require("montage").Montage,
    ValueTypeInspector = require("../../value-type-inspector.reel").ValueTypeInspector;

/**
    Description TODO
    @class module:"./list-association-inspector.reel".ListAssociationInspector
 @extends module:"../../value-type-inspector.reel".ValueTypeInspector
*/
exports.ListAssociationInspector = Montage.create(ValueTypeInspector, /** @lends module:"./list-association-inspector.reel".ListAssociationInspector# */ {

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
        set: function () {
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

    handleRemoveButtonAction: {
        value: function (evt) {
            var index = evt.detail.index;
            if (this.collectionValue && (index >= 0) && (index < this.collectionValue.length)) {
                this.collectionValue.splice(index, 1);
            }
        }
    }

});
