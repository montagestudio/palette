/**
 @module "./number-property-inspector.reel"
 @requires montage
 @requires "../../value-type-inspector.reel"
 */
var Montage = require("montage").Montage,
    ValueTypeInspector = require("../../value-type-inspector.reel").ValueTypeInspector;

/**
 Description TODO
 @class module:"./number-property-inspector.reel".NumberPropertyInspector
 @extends module:"../../value-type-inspector.reel".ValueTypeInspector
 */
exports.NumberPropertyInspector = Montage.create(ValueTypeInspector, /** @lends module:"./number-property-inspector.reel".NumberPropertyInspector# */ {

});
