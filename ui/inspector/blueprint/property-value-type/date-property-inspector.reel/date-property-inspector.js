/**
 @module "./date-property-inspector.reel"
 @requires montage
 @requires "../value-type-property-inspector"
 */
var Montage = require("montage").Montage,
    ValueTypePropertyInspector = require("../value-type-property-inspector").ValueTypePropertyInspector;

/**
 Description TODO
 @class module:"./date-property-inspector.reel".DatePropertyInspector
 @extends module:"../value-type-property-inspector".ValueTypePropertyInspector
 */
exports.DatePropertyInspector = Montage.create(ValueTypePropertyInspector, /** @lends module:"./date-property-inspector.reel".DatePropertyInspector# */ {

});
