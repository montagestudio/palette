/**
    @module "ui/selection/selections.reel"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component,
    RangeController = require("montage/core/range-controller").RangeController,
    Selection = require('../selection.reel').Selection;

/**
    Description TODO
    @class module:"ui/selection/selections.reel".Selections
    @extends module:montage/ui/component.Component
*/
exports.Selections = Montage.create(Component, /** @lends module:"ui/selection/selections.reel".Selections# */ {

    didCreate: {
        value: function() {
            this.selectedObjectsController = RangeController.create();
            this.selectedObjectsController.defineBinding("content", {
                "<-": "_selectedObjects",
                source: this
            });
        }
    },

     _contentComponent: {
         value: null
     },
     /**
      * The Montage component that contains the selected objects. This used to
      * offset the selection borders so that they appear in the correct place.
      * It should also fire an "update" event when the content is updated or
      * redrawn so that the selections can be updated to match.
      * @type {Component}
      */
     contentComponent: {
         get: function() {
             return this._contentComponent;
         },
         set: function(value) {
             if (this._contentComponent === value) {
                 return;
             }

             if (this._contentComponent) {
                this._contentComponent.removeEventListener("update", this, true);
             }

             this._contentComponent = value;
             this._contentComponent.addEventListener("update", this, true);
             this.needsDraw = true;
         }
     },
    _offsetLeft: {
        value: null
    },
    _offsetTop: {
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
                if (this._selectedObjects) {
                  this._selectedObjects.removeRangeChangeListener(this, "selectedObjects");
                }
                this._selectedObjects = value;
                this._selectedObjects.addRangeChangeListener(this, "selectedObjects");

                this.needsDraw = true;
            }
        }
    },

    selectedObjectsController: {
        value: null
    },

    handleSelectedObjectsRangeChange: {
        value: function() {
            this.allNeedDraw();
        }
    },

    captureUpdate: {
        value: function(event) {
            this.allNeedDraw();
        }
    },

    captureResize: {
        value: function(event) {
            this.allNeedDraw();
        }
    },

    captureWebkitTransitionEnd: {
        value: function(event) {
            this.allNeedDraw();
        }
    },

    enterDocument: {
        value: function(firstTime) {
            if (firstTime) {
                // changing the size of the window causes selections to be shifted
                window.addEventListener("resize", this, true);
                // CSS animations can change the size of elements, causing
                // selections to be shifted
                window.addEventListener("webkitTransitionEnd", this, true);
                // In fact, any draw can cause the selections to be shifted!
                var self = this;
                var root = require("montage/ui/component").__root__;
                var originalDrawIfNeeded = root.drawIfNeeded;
                root.drawIfNeeded = function() {
                    self.allNeedDraw();
                    originalDrawIfNeeded.call(root);
                };
            }
        }
    },

    allNeedDraw: {
        value: function() {
            if (!this._selectedObjects || !this._selectedObjects.length) {
                return;
            }

            this.needsDraw = true;

            // all selections need to be redrawn
            var kids = this.templateObjects.repetition.childComponents;
            for (var i = 0, len = kids.length; i < len; i++) {
                kids[i].needsDraw = true;
            }
        }
    },

    willDraw: {
        value: function() {
            this._offsetLeft = this.contentComponent.element.offsetLeft;
            this._offsetTop = this.contentComponent.element.offsetTop;
        }
    }

});
