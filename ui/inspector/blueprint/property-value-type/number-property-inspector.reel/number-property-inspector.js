/**
 @module "./number-property-inspector.reel"
 @requires montage
 @requires "../value-type-property-inspector"
 */
var Montage = require("montage").Montage,
    ValueTypePropertyInspector = require("../value-type-property-inspector").ValueTypePropertyInspector;

/**
 Description TODO
 @class module:"./number-property-inspector.reel".NumberPropertyInspector
 @extends module:"../value-type-property-inspector".ValueTypePropertyInspector
 */
exports.NumberPropertyInspector = Montage.create(ValueTypePropertyInspector, /** @lends module:"./number-property-inspector.reel".NumberPropertyInspector# */ {

});
