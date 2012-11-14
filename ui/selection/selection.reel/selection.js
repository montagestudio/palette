/**
    @module "ui/selection/selection.reel"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component;

/**
    Description TODO
    @class module:"ui/selection/selection.reel".Selection
    @extends module:montage/ui/component.Component
*/
exports.Selection = Montage.create(Component, /** @lends module:"ui/selection/selection.reel".Selection# */ {

    /**
     * Init
     * @function
     * @param  {Component} component The component this selection is for.
     * @param  {number} top       Distance from top in pixels.
     * @param  {number} left      Distance from left in pixels.
     * @param  {height} height    Height of the selection in pixels.
     * @param  {number} width     Width of the selection in pixels.
     * @return {Selection}        this
     */
    init: {
        value: function(component, top, left, height, width) {
            this.component = component;

            if (top) this.top = top;
            if (left) this.left = left;
            if (height) this.height = top;
            if (width) this.width = width;

            return this;
        }
    },

    _offsetTop: {
        value: null
    },
    /**
     * Offset from the top in pixels.
     *
     * Needed if the location of the stage is not at 0, 0 of the parent element
     * of this component.
     * @type {number}
     */
    offsetTop: {
        get: function() {
            return this._offsetTop;
        },
        set: function(value) {
            if (this._offsetTop === value) {
                return;
            }
            this._offsetTop = value;
            this.needsDraw = true;
        }
    },

    _offsetLeft: {
        value: null
    },
    /**
     * Offset from the left in pixels.
     *
     * Needed if the location of the stage is not at 0, 0 of the parent element
     * of this component.
     * @type {number}
     */
    offsetLeft: {
        get: function() {
            return this._offsetLeft;
        },
        set: function(value) {
            if (this._offsetLeft === value) {
                return;
            }
            this._offsetLeft = value;
            this.needsDraw = true;
        }
    },

    _top: {
        value: null
    },
    /**
     * Distance from top in pixels.
     * @type {number}
     */
    top: {
        get: function() {
            return this._top;
        },
        set: function(value) {
            if (this._top === value) {
                return;
            }
            this._top = value;
            this.needsDraw = true;
        }
    },

    _left: {
        value: null
    },
    /**
     * Distance from left in pixels.
     * @type {number}
     */
    left: {
        get: function() {
            return this._left;
        },
        set: function(value) {
            if (this._left === value) {
                return;
            }
            this._left = value;
            this.needsDraw = true;
        }
    },

    _height: {
        value: null
    },
    /**
     * Height of the selection in pixels.
     * @type {number}
     */
    height: {
        get: function() {
            return this._height;
        },
        set: function(value) {
            if (this._height === value) {
                return;
            }
            this._height = value;
            this.needsDraw = true;
        }
    },

    _width: {
        value: null
    },
    /**
     * Width of the seclection in pixels.
     * @type {number}
     */
    width: {
        get: function() {
            return this._width;
        },
        set: function(value) {
            if (this._width === value) {
                return;
            }
            this._width = value;
            this.needsDraw = true;
        }
    },

    _object: {
        value: null
    },
    /**
     * The object that this selection surrounds.
     * @type {Component|HTMLElement}
     */
    object: {
        get: function() {
            return this._object;
        },
        set: function(value) {
            if (this._object === value) {
                return;
            }
            this._object = value;
            this.needsDraw = true;
        }
    },

    willDraw: {
        value: function() {
            if (!this.object) {
                return;
            }

            var object = this.object,
                el = "element" in object ? object.element : object;

            var rect = this._getBounds(this.object.element);

            this._top = this.offsetTop + rect.top;
            this._left = this.offsetLeft + rect.left;
            this._height = rect.bottom - rect.top;
            this._width = rect.right - rect.left;
        }
    },

    draw: {
        value: function() {
            this._element.style.top = this._top + "px";
            this._element.style.left = this._left + "px";
            this._element.style.height = this._height + "px";
            this._element.style.width = this._width + "px";
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
    }

});
