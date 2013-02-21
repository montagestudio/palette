/**
 @module "./url-property-inspector.reel"
 @requires montage
 @requires "../value-type-property-inspector"
 */
var Montage = require("montage").Montage,
    ValueTypePropertyInspector = require("../value-type-property-inspector").ValueTypePropertyInspector;

/**
 Description TODO
 @class module:"./url-property-inspector.reel".UrlPropertyInspector
 @extends module:"../value-type-property-inspector".ValueTypePropertyInspector
 */
exports.UrlPropertyInspector = Montage.create(ValueTypePropertyInspector, /** @lends module:"./url-property-inspector.reel".UrlPropertyInspector# */ {

});
