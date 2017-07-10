/**
 @module "./enum-property-inspector.reel"
 @requires montage
 @requires "../../value-type-inspector.reel"
 */
var ValueTypeInspector = require("../../value-type-inspector.reel").ValueTypeInspector;

/**
 Description TODO
 @class module:"./enum-property-inspector.reel".EnumPropertyInspector
 @extends module:"../../value-type-inspector.reel".ValueTypeInspector
 */
exports.EnumPropertyInspector = ValueTypeInspector.specialize(/** @lends module:"./enum-property-inspector.reel".EnumPropertyInspector# */ {

    constructor: {
        value: function EnumPropertyInspector() {
            this.super();
        }
    },

    enterDocument: {
        value: function () {
            // This is to fix a bug, the select resets its value when entering the document
            this.propertyValue.value = this._objectValue;
        }
    }
});
