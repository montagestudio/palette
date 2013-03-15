/**
 @module "./string-property-inspector.reel"
 @requires montage
 @requires "../../value-type-inspector.reel"
 */
var Montage = require("montage").Montage,
    ValueTypeInspector = require("../../value-type-inspector.reel").ValueTypeInspector;

/**
 Description TODO
 @class module:"./string-property-inspector.reel".StringPropertyInspector
 @extends module:"../../value-type-inspector.reel".ValueTypeInspector
 */
exports.StringPropertyInspector = Montage.create(ValueTypeInspector, /** @lends module:"./string-property-inspector.reel".StringPropertyInspector# */ {

});
