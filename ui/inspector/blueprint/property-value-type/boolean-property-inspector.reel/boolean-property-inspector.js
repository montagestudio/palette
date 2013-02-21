/**
 @module "./boolean-property-inspector.reel"
 @requires montage
 @requires "../value-type-property-inspector"
 */
var Montage = require("montage").Montage,
    ValueTypePropertyInspector = require("../value-type-property-inspector").ValueTypePropertyInspector;

/**
 Description TODO
 @class module:"./boolean-property-inspector.reel".BooleanPropertyInspector
 @extends module:"../value-type-property-inspector".ValueTypePropertyInspector
 */
exports.BooleanPropertyInspector = Montage.create(ValueTypePropertyInspector, /** @lends module:"./boolean-property-inspector.reel".BooleanPropertyInspector# */ {

});
