/**
 @module "./object-property-inspector.reel"
 @requires montage
 @requires "../../value-type-inspector.reel"
 */
var Montage = require("montage").Montage,
    ValueTypeInspector = require("../../value-type-inspector.reel").ValueTypeInspector;

/**
 Description TODO
 @class module:"./object-property-inspector.reel".ObjectPropertyInspector
 @extends module:"../../value-type-inspector.reel".ValueTypeInspector
 */
exports.ObjectPropertyInspector = Montage.create(ValueTypeInspector, /** @lends module:"./object-property-inspector.reel".ObjectPropertyInspector# */ {

    objectReferenceValue: {
        get: function () {
            if (this.propertyBlueprint && this.objectValue && (this.propertyBlueprint.valueType === "object")) {
                return "@" + this.objectValue.label;
            }
            return this.objectValue;
        },
        set: function (value) {
            if (typeof value === "string" && this.editingDocument) {
                if (value[0] === "@") {
                    var label = value.substring(1);
                    var target = this.editingDocument.editingProxyMap[label];
                    console.log("setting target ", target);
                    if (target) {
                        this.objectValue = target
                    }
                } else if (value.length === 0) {
                    this.objectValue = null;
                }
            }
        }
    }



});
