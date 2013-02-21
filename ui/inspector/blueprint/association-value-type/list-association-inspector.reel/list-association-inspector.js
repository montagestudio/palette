/**
    @module "./list-association-inspector.reel"
    @requires montage
    @requires ../value-type-association-inspector
*/
var Montage = require("montage").Montage,
    ValueTypeAssociationInspector = require("../value-type-association-inspector").ValueTypeAssociationInspector;

/**
    Description TODO
    @class module:"./list-association-inspector.reel".ListAssociationInspector
    @extends module:../value-type-association-inspector.ValueTypeAssociationInspector
*/
exports.ListAssociationInspector = Montage.create(ValueTypeAssociationInspector, /** @lends module:"./list-association-inspector.reel".ListAssociationInspector# */ {

});
