/**
    @module "ui/selection/highlights.reel"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component,
    RangeController = require("montage/core/range-controller").RangeController;

/**
    Description TODO
    @class module:"ui/selection/highlights.reel".Highlights
    @extends module:montage/ui/component.Component
*/
exports.Highlights = Montage.create(Component, /** @lends module:"ui/selection/highlights.reel".Highlights# */ {

    constructor: {
        value: function() {
            this.super();
            this.highlightedElementsController = RangeController.create();
            this.highlightedElementsController.defineBinding("content", {
                "<-": "_highlightedElements",
                source: this
            });
        }
    },

    _highlightedElements: {
        value: null
    },
    /**
     * Array of components that are highlighted
     * @type {Array[Component]}
     */
    highlightedElements: {
        get: function() {
            return this._highlightedElements;
        },
        set: function(value) {
            if (value !== this._highlightedElements) {
                if (this._highlightedElements) {
                    this._highlightedElements.removeRangeChangeListener(this, "highlightedElements");
                }
                this._highlightedElements = value;
                this._highlightedElements.addRangeChangeListener(this, "highlightedElements");

                this.needsDraw = true;
            }
        }
    },

    highlightedElementsController: {
        value: null
    },

    handleHighlightedElementsRangeChange: {
        value: function() {
            this.allNeedDraw();
        }
    },

    handleUpdate: {
        value: function (event) {
            this.allNeedDraw();
        }
    },

    allNeedDraw: {
        value: function() {
            if (!this._highlightedElements || !this._highlightedElements.length) {
                return;
            }

            this.needsDraw = true;

            // all selections need to be redrawn
            var kids = this.templateObjects.repetition.childComponents;
            for (var i = 0, len = kids.length; i < len; i++) {
                kids[i].needsDraw = true;
            }
        }
    }

});
