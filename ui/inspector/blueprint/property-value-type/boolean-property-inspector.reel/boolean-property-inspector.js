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

});
