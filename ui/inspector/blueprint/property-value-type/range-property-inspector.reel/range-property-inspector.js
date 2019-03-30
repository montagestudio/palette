/**
 @module "./range-property-inspector.reel"
 @requires montage
 @requires "../../value-type-inspector.reel"
 */
var ValueTypeInspector = require("../../value-type-inspector.reel").ValueTypeInspector,
    Converter = require("montage/core/converter/converter").Converter;

var RoundConverter = Converter.specialize({}, {

    convert: {
        value: function (value) {
            return isNaN(value) ? 0 : (value - 0).toFixed(2) - 0;
        }
    },

    revert: {
        value: function (value) {
            return value;
        }
    }

});

/**
 Description TODO
 @class module:"./range-property-inspector.reel".RangePropertyInspector
 @extends module:"../../value-type-inspector.reel".ValueTypeInspector
 */
exports.RangePropertyInspector = ValueTypeInspector.specialize(/** @lends module:"./range-property-inspector.reel".RangePropertyInspector# */ {

    constructor: {
        value: function RangePropertyInspector() {
            this.super();

            // Fixme: find a way to set these values
            // with the properties' blueprint
            this.min = 0;
            this.max = 1;
            this.smallStepSize = 0.05;
            this.stepSize = 0.1;
            this.largeStepSize = 0.2;
            this.converter = RoundConverter;
        }
    },

    enterDocument: {
        value: function (firstime) {
            if (firstime) {
                this.addOwnPropertyChangeListener("isTextSliderEditing", this);
                this.addPathChangeListener("objectValue", this, "_valueChanged");
            }
        }
    },

    converter: {
        value: null
    },

    _rangeValue: {
        value: null
    },

    rangeValue: {
        set: function (value) {
            if (this.converter) {
                this._rangeValue = this.converter.convert(value);
            }
        },
        get: function () {
            return this._rangeValue;
        }
    },

    max: {
        value: null
    },

    min: {
        value: null
    },

    smallStepSize: {
        value: null
    },

    stepSize: {
        value: null
    },

    largeStepSize: {
        value: null
    },

    isTextSliderEditing: {
        value: null
    },

    inputSlider: {
        value: null
    },

    prepareForActivationEvents: {
        value: function() {
            this._element.addEventListener("click", this, true);
            this.inputSlider.element.addEventListener('mouseup', this, false);
        }
    },

    _valueChanged: {
        value: function (value) {
            if (value !== null && value !== this._rangeValue) {
                this.rangeValue = value;
            }
        }
    },

    handleIsTextSliderEditingChange: {
        value: function () {
            if (this.isTextSliderEditing) {
                this._element.removeEventListener("click", this, true);
            } else {
                this._element.addEventListener("click", this, true);

                if (this._objectValue !== this._rangeValue) { // if rangeValue changes
                    this.objectValue = this._rangeValue;
                }
            }
        }
    },

    handleMouseup: {
        value: function () {
            if (this._objectValue !== this._rangeValue) {
                this.objectValue = this._rangeValue;
            }
        }
    },

    captureClick: {
        value: function (event) {
            var target = event.target;

            if (target !== this.templateObjects.textSlider.element) {
                event.stopPropagation();
            }
        }
    }

});
