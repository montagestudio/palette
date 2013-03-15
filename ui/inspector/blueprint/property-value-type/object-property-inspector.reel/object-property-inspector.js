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

});
