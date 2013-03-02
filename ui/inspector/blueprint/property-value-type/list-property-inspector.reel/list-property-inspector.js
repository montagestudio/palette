/**
    @module "./list-property-inspector.reel"
    @requires montage
 @requires "../../value-type-inspector.reel"
*/
var Montage = require("montage").Montage,
    ValueTypeInspector = require("../../value-type-inspector.reel").ValueTypeInspector;

/**
    Description TODO
    @class module:"./list-property-inspector.reel".ListPropertyInspector
 @extends module:"../../value-type-inspector.reel".ValueTypeInspector
*/
exports.ListPropertyInspector = Montage.create(ValueTypeInspector, /** @lends module:"./list-property-inspector.reel".ListPropertyInspector# */ {

    listObject: {
        get: function() {
            if (Array.isArray(this.objectValue)) {
                return this.objectValue;
            } else {
                return [];
            }
        },
        set: function(value) {
            this.objectValue = value;
        }
    }

});
