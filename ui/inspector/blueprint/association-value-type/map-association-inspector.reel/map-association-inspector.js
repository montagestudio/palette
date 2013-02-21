/**
    @module "./map-association-inspector.reel"
    @requires montage
    @requires ../value-type-association-inspector
*/
var Montage = require("montage").Montage,
    ValueTypeAssociationInspector = require("../value-type-association-inspector").ValueTypeAssociationInspector;

/**
    Description TODO
    @class module:"./map-association-inspector.reel".MapAssociationInspector
    @extends module:../value-type-association-inspector.ValueTypeAssociationInspector
*/
exports.MapAssociationInspector = Montage.create(ValueTypeAssociationInspector, /** @lends module:"./map-association-inspector.reel".MapAssociationInspector# */ {

});
