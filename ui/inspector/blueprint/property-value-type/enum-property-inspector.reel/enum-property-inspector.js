/**
 @module "./enum-property-inspector.reel"
 @requires montage
 @requires "../value-type-property-inspector"
 */
var Montage = require("montage").Montage,
    ValueTypePropertyInspector = require("../value-type-property-inspector").ValueTypePropertyInspector;

/**
 Description TODO
 @class module:"./enum-property-inspector.reel".EnumPropertyInspector
 @extends module:"../value-type-property-inspector".ValueTypePropertyInspector
 */
exports.EnumPropertyInspector = Montage.create(ValueTypePropertyInspector, /** @lends module:"./enum-property-inspector.reel".EnumPropertyInspector# */ {

});
