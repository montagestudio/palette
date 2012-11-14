/**
    @module "ui/selection.reel"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component;

/**
    Description TODO
    @class module:"ui/selection.reel".Selection
    @extends module:montage/ui/component.Component
*/
exports.Selection = Montage.create(Component, /** @lends module:"ui/selection.reel".Selection# */ {

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

    component: {
        value: null
    },

    draw: {
        value: function() {
            this._element.style.top = this._top + "px";
            this._element.style.left = this._left + "px";
            this._element.style.height = this._height + "px";
            this._element.style.width = this._width + "px";
        }
    }

});
