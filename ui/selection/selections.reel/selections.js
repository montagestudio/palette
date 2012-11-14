/**
    @module "ui/selections.reel"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component,
    Selection = require('../selection.reel').Selection;

/**
    Description TODO
    @class module:"ui/selections.reel".Selections
    @extends module:montage/ui/component.Component
*/
exports.Selections = Montage.create(Component, /** @lends module:"ui/selections.reel".Selections# */ {

    didCreate: {
        value: function() {
            this._objectSelectionMap  = Object.create(null);
            this._minusSelectedObjects  = [];
            this._elementsToAdd = [];

            this.addPropertyChangeListener("_selectedObjects", this, false);
        }
    },

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
                this._selectedObjects = value;
                this.needsDraw = true;
            }
        }
    },

    handleChange: {
        value: function(change) {
            var i;
            // Keep track of the removed objects
            if (change.minus && change.minus.length) {
                for (i = change.minus.length - 1; i >= 0; i--) {
                    this._minusSelectedObjects.push(change.minus[i]);
                }
            }
            // If an object has been removed and added again it needs to
            // removed from the minus array
            if (change.plus && change.plus.length) {
                for (i = change.plus.length - 1; i >= 0; i--) {
                    var index;
                    if ((index = this._minusSelectedObjects.indexOf(change.plus[i].uuid)) !== -1) {
                        this._minusSelectedObjects.splice(index, 1);
                    }
                }
            }

            this.needsDraw = true;
        }
    },

    /**
     * Maps from an object (actually the object's uuid) to the Selection object.
     * @type {Object}
     */
    _objectSelectionMap: {
        value: null
    },

    /**
     * Array of the objects that have been deselected since the last draw.
     * @type {Array[Object]}
     */
    _minusSelectedObjects: {
        value: null
    },

    /**
     * The DOM elements that need to be inserted in the next draw.
     * @type {Array[HTMLElement]}
     */
    _elementsToAdd: { value: null },

    willDraw: {
        value: function() {
            if (!this._selectedObjects) {
                return;
            }

            // TODO: Store these, and check if they've changed in didDraw,
            // as this means we need to redraw the selection
            var offsetLeft = this.offsetComponent.element.offsetLeft;
            var offsetTop = this.offsetComponent.element.offsetTop;

            for (var i = 0, len = this._selectedObjects.length; i < len; i++) {
                var object = this._selectedObjects[i];
                var rect = this._getBounds(object.element);

                var selection;
                if (object.uuid in this._objectSelectionMap) {
                    selection = this._objectSelectionMap[object.uuid];
                } else {
                    var el = document.createElement("div");
                    selection = Selection.create();

                    this._objectSelectionMap[object.uuid] = selection;
                    this._elementsToAdd.push(el);
                    selection.setElementWithParentComponent(el, this);

                    selection.component = object;
                }

                selection.top = offsetTop + rect.top;
                selection.left = offsetLeft + rect.left;
                selection.height = rect.bottom - rect.top;
                selection.width = rect.right - rect.left;
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
            var element, object;

            // add elements
            while ((element = this._elementsToAdd.pop())) {
                this._element.appendChild(element);
            }

            // remove elements
            while ((object = this._minusSelectedObjects.pop())) {
                var selection = this._objectSelectionMap[object.uuid];
                delete this._objectSelectionMap[object.uuid];

                this._element.removeChild(selection.element);
            }
        }
    }

});
