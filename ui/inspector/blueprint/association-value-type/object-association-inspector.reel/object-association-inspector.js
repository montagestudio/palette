/**
    @module "./object-association-inspector.reel"
    @requires montage
    @requires ../value-type-association-inspector
*/
var Montage = require("montage").Montage,
    ValueTypeAssociationInspector = require("../value-type-association-inspector").ValueTypeAssociationInspector;

/**
    Description TODO
    @class module:"./object-association-inspector.reel".ObjectAssociationInspector
    @extends module:../value-type-association-inspector.ValueTypeAssociationInspector
*/
exports.ObjectAssociationInspector = Montage.create(ValueTypeAssociationInspector, /** @lends module:"./object-association-inspector.reel".ObjectAssociationInspector# */ {

});
