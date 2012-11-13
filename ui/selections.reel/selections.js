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

    offsetComponent: {
        value: null
    },

    _selectedObjects: {
        value: null
    },
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

    draw: {
        value: function() {
            if (!this._selectedObjects) {
                return;
            }

            var offsetLeft = this.offsetComponent.element.offsetLeft;
            var offsetTop = this.offsetComponent.element.offsetTop;

            var numSelectedObjects = this._selectedObjects.length;
            var numSelectionEls = this._element.children.length;

            var rect;
            var available = Math.min(numSelectedObjects, numSelectionEls);

            for (var i = 0; i < available; i++) {
                rect = this._selectedObjects[i].element.getBoundingClientRect();

                this._positionSelection(this._element.children[i],
                    offsetTop + rect.top,
                    offsetLeft + rect.left,
                    rect.height,
                    rect.width
                );
            }

            if (numSelectedObjects > numSelectionEls) {
                for (; i < numSelectedObjects; i++) {
                    rect = this._selectedObjects[i].element.getBoundingClientRect();
                    var el = this._element.appendChild(document.createElement("div"));

                    this._positionSelection(el,
                        offsetTop + rect.top,
                        offsetLeft + rect.left,
                        rect.height,
                        rect.width
                    );
                }
            } else while (numSelectedObjects < numSelectionEls--) {
                this._element.removeChild(this._element.lastElementChild);
            }
        }
    },
    _positionSelection: {
        value: function(el, top, left, height, width) {
            el.style.top = top + "px";
            el.style.left = left + "px";
            el.style.height = height + "px";
            el.style.width = width + "px";
        }
    },
});
