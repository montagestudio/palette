/**
 * @module "./nullable-select"
 * @requires "matte/ui/select.reel"
 */
var Select = require("matte/ui/select.reel").Select;

/**
 * @class NullableSelect
 * @extends Select
 */
exports.NullableSelect = Select.specialize(/** @lends NullableSelect# */ {

    hasTemplate: {
        value: false
    },

    value: {
        get: function() {
            var value = Object.getPropertyDescriptor(Select.prototype, "value").get.call(this);
            if (value === null) {
                return void 0;
            }
            return value;
        },
        set: function(value) {
            return Object.getPropertyDescriptor(Select.prototype, "value").set.apply(this, arguments);
        }
    },

    _hadSelectionBeforeDraw: {
        value: false
    },

    constructor: {
        value: function NullableSelect() {
            this.super();
        }
    },

    draw: {
        value: function() {
            this._hadSelectionBeforeDraw = !!(this._selectedIndexes && this._selectedIndexes.length > 0);
            this.super();
            this._appendNullOption();
        }
    },

    _appendNullOption: {
        value: function() {
            var nullOption = this._createNullOption();
            this._selectNullOptionIfNeeded(nullOption);
            this.element.appendChild(nullOption);
        }
    },

    _createNullOption: {
        value: function() {
            var nullOption = document.createElement("option");
                nullOption.style.display = "none";
            return nullOption;
        }
    },

    _selectNullOptionIfNeeded: {
        value: function(nullOption) {
            if (!this._hadSelectionBeforeDraw) {
                nullOption.setAttribute("selected", "");
                this._selectedIndexes = [];
            }
        }
    }
});
