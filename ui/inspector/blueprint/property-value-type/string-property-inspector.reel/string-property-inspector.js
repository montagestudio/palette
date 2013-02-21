/**
 @module "./string-property-inspector.reel"
 @requires montage
 @requires "../value-type-property-inspector"
 */
var Montage = require("montage").Montage,
    ValueTypePropertyInspector = require("../value-type-property-inspector").ValueTypePropertyInspector;

/**
 Description TODO
 @class module:"./string-property-inspector.reel".StringPropertyInspector
 @extends module:"../value-type-property-inspector".ValueTypePropertyInspector
 */
exports.StringPropertyInspector = Montage.create(ValueTypePropertyInspector, /** @lends module:"./string-property-inspector.reel".StringPropertyInspector# */ {

});
