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


    collectionValue: {
        get: function () {
            if (this.propertyBlueprint && this.propertyBlueprint.isToMany && (this.propertyBlueprint.collectionValueType === "list")) {
                //                console.log("Property value list " + this.propertyBlueprint.name + " type " + this.propertyBlueprint.valueType + " collection " + this.propertyBlueprint.collectionValueType + " ", this.objectValue);
                if (!(this.objectValue instanceof Array)) {
                    if (this.objectValue && this.objectValue.forEach) {
                        this.objectValue = new Array(this.objectValue);
                    } else {
                        var temp = this.objectValue;
                        this.objectValue = new Array();
                        if (temp) {
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
    }

});
