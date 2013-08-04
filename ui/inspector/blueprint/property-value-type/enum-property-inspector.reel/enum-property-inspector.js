/**
 @module "./enum-property-inspector.reel"
 @requires montage
 @requires "../../value-type-inspector.reel"
 */
var Montage = require("montage").Montage,
    ValueTypeInspector = require("../../value-type-inspector.reel").ValueTypeInspector;

/**
 Description TODO
 @class module:"./enum-property-inspector.reel".EnumPropertyInspector
 @extends module:"../../value-type-inspector.reel".ValueTypeInspector
 */
exports.EnumPropertyInspector = ValueTypeInspector.specialize(/** @lends module:"./enum-property-inspector.reel".EnumPropertyInspector# */ {

    constructor: {
        value: function EnumPropertyInspector() {
            this.super();
        }
    }


});
