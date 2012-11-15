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

            this._restoreDraw(this._object);
            this._object = value;
            this._replaceDraw(value);

            this.needsDraw = true;
        }
    },

    /**
     * If `object` is a component, and it had it's *own* draw method, store
     * a reference to it here.
     * @default null
     * @type {Function}
     * @private
     */
    _componentOwnOldDraw: {
        value: null
    },
    /**
     * Restore the given object's original draw method.
     *
     * If it originally had its own then it is replaced, otherwise the draw
     * property is deleted so that it falls back to the prototype draw.
     * Only runs if the object has a `draw` property in its prototype chain.
     * @param {Object} oldObject The old object to replace the draw of.
     * @function
     * @private
     */
    _restoreDraw: {
        value: function(oldObject) {
            if (oldObject && oldObject.draw) {
                // if all the above are true then we have replaced the draw
                if (this._componentOwnOldDraw) {
                    // if it had its own draw method then put it back
                    oldObject.draw = this._componentOwnOldDraw;
                    this._componentOwnOldDraw = null;
                } else {
                    // otherwise the draw was on its prototype and we can
                    // just delete the property
                    delete oldObject.draw;
                }
            }

        }
    },
    /**
     * Replace the draw with a hook to trigger a needsDraw on this
     * selection component.
     *
     * So that the selection reseizes with the component. If it has its
     * own draw method then a reference is store in `_componentOwnOldDraw`.
     * Only runs if the object has a `draw` property in its prototype chain.
     * for restoration later.
     *
     * There might be a less intrusive way to achieving the same thing.
     * @param  {Object} object The object to replace the draw method of.
     * @return {null}
     * @private
     */
    _replaceDraw: {
        value: function(object) {
            if (object && object.draw) {
                var self = this, oldDraw = object.draw;

                if (object.hasOwnProperty("draw")) {
                    this._componentOwnOldDraw = object.draw;
                }

                object.draw = function() {
                    oldDraw.apply(object, arguments);
                    self.needsDraw = true;
                };
            }
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
