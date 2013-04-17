/**
 @module "./boolean-property-inspector.reel"
 @requires montage
 @requires "../../value-type-inspector.reel"
 */
var Montage = require("montage").Montage,
    ValueTypeInspector = require("../../value-type-inspector.reel").ValueTypeInspector;

/**
 Description TODO
 @class module:"./boolean-property-inspector.reel".BooleanPropertyInspector
 @extends module:"../../value-type-inspector.reel".ValueTypeInspector
 */
exports.BooleanPropertyInspector = Montage.create(ValueTypeInspector, /** @lends module:"./boolean-property-inspector.reel".BooleanPropertyInspector# */ {

    booleanValue: {
        get: function() {
            return !! this.objectValue;
        },
        set: function(value) {
            if (value) {
                this.objectValue = true;
            } else if (this.objectValue) {
                this.objectValue = false;
            }
        }
    }

});
