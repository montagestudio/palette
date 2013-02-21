/**
    @module "./set-association-inspector.reel"
    @requires montage
    @requires ../value-type-association-inspector
*/
var Montage = require("montage").Montage,
    ValueTypeAssociationInspector = require("../value-type-association-inspector").ValueTypeAssociationInspector;

/**
    Description TODO
    @class module:"./set-association-inspector.reel".SetAssociationInspector
    @extends module:../value-type-association-inspector.ValueTypeAssociationInspector
*/
exports.SetAssociationInspector = Montage.create(ValueTypeAssociationInspector, /** @lends module:"./set-association-inspector.reel".SetAssociationInspector# */ {

});
