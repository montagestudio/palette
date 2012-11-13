/**
    @module "ui/selections.reel"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component;

/**
    Description TODO
    @class module:"ui/selections.reel".Selections
    @extends module:montage/ui/component.Component
*/
exports.Selections = Montage.create(Component, /** @lends module:"ui/selections.reel".Selections# */ {

    /**
     * The Montage component that contains the selected objects. This used to
     * offset the selection borders so that they appear in the correct place.
     * @type {Component}
     */
    offsetComponent: {
        value: null
    },

    _selectedObjects: {
        value: null
    },
    /**
     * Array of components that are selected, and so should be surrounded
     * by a selected border.
     * @type {Array[Component]}
     */
    selectedObjects: {
        get: function() {
            return this._selectedObjects;
        },
        set: function(value) {
            if (value != this._selectedObjects) {
                this.removePropertyChangeListener("_selectedObjects", this, false);
                this._selectedObjects = value;
                this.addPropertyChangeListener("_selectedObjects", this, false);
                this.needsDraw = true;
            }
        }
    },

    handleChange: {
        value: function() {
            this.needsDraw = true;
        }
    },

    /**
     * Stores the rects to draw in between willDraw and draw.
     * @type {Array[Array[number]]} An array of an array with four numbers:
     * top, left, height and width.
     * @private
     */
    _rects: { value: null },

    willDraw: {
        value: function() {
            // Store all the rects that need to be drawn. Put this above the
            // return so that existing drawn rects are cleared if
            // selectedObjects has been set to null.
            this._rects = [];

            if (!this._selectedObjects) {
                return;
            }

            // TODO: Store these, and check if they've changed in didDraw,
            // as this means we need to redraw the selection
            var offsetLeft = this.offsetComponent.element.offsetLeft;
            var offsetTop = this.offsetComponent.element.offsetTop;

            for (var i = 0, len = this._selectedObjects.length; i < len; i++) {
                var rect = this._getBounds(this._selectedObjects[i].element);
                this._rects.push([
                    offsetTop + rect.top,
                    offsetLeft + rect.left,
                    rect.bottom - rect.top,
                    rect.right - rect.left
                ]);
            }
        }
    },

    /**
     * Gets the bounds of the given element and all of its children.
     * @param {HTMLElement} element The element.
     * @return {Object} An object with top, left, bottom and right properties.
     * @function
     * @private
     */
    _getBounds: {
        value: function(element) {
            var rect = element.getBoundingClientRect();
            var top = rect.top, left = rect.left,
                bottom = rect.bottom, right = rect.right;

            var children = element.children;

            for (var i = 0, len = children.length; i < len; i++) {
                var childRect = this._getBounds(children[i]);
                top = childRect.top < top ? childRect.top : top;
                left = childRect.left < left ? childRect.left : left;

                bottom = childRect.bottom > bottom ? childRect.bottom : bottom;
                right = childRect.right > right ? childRect.right : right;
            }

            return {top: top, left: left, bottom: bottom, right: right};
        }
    },

    draw: {
        value: function() {
            var rects = this._rects;
            var numRects = rects.length;
            var numSelectionEls = this._element.children.length;

            var el;

            for (var i = 0; i < numRects; i++) {
                if (i < numSelectionEls) {
                    // reuse existing element
                    el = this._element.children[i];
                } else {
                    el = this._element.appendChild(document.createElement("div"));
                }

                this._positionSelection(el,
                    rects[i][0], rects[i][1], rects[i][2], rects[i][3]
                );
            }

            // remove any extra selection divs
            while (numSelectionEls-- > numRects) {
                this._element.removeChild(this._element.lastElementChild);
            }

            this._rects = null;
        }
    },

    /**
     * Sets the styles of the given elements.
     * @param {HTMLElement} el The element to set the styles on.
     * @param {number} top Distance from top, in pixels.
     * @param {number} left Distance from left, in pixels.
     * @param {number} height Height, in pixels.
     * @param {number} width Width, in pixels.
     * @function
     * @private
     */
    _positionSelection: {
        value: function(el, top, left, height, width) {
            el.style.top = top + "px";
            el.style.left = left + "px";
            el.style.height = height + "px";
            el.style.width = width + "px";
        }
    }

});
