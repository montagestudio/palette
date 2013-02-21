/**
 @module "./object-property-inspector.reel"
 @requires montage
 @requires "../value-type-property-inspector"
 */
var Montage = require("montage").Montage,
    ValueTypePropertyInspector = require("../value-type-property-inspector").ValueTypePropertyInspector;

/**
 Description TODO
 @class module:"./object-property-inspector.reel".ObjectPropertyInspector
 @extends module:"../value-type-property-inspector".ValueTypePropertyInspector
 */
exports.ObjectPropertyInspector = Montage.create(ValueTypePropertyInspector, /** @lends module:"./object-property-inspector.reel".ObjectPropertyInspector# */ {

});
