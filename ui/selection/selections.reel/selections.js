/**
    @module "ui/selection/selections.reel"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component,
    ContentController = require("montage/core/content-controller").ContentController,
    Selection = require('../selection.reel').Selection;

/**
    Description TODO
    @class module:"ui/selection/selections.reel".Selections
    @extends module:montage/ui/component.Component
*/
exports.Selections = Montage.create(Component, /** @lends module:"ui/selection/selections.reel".Selections# */ {

    didCreate: {
        value: function() {
            this.addOwnPropertyChangeListener("_selectedObjects", this, false);

            this.selectedObjectsController = ContentController.create();
            Object.defineBinding(this.selectedObjectsController, "content", {
                boundObject: this,
                boundObjectPropertyPath: "_selectedObjects",
                oneway: true
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
                this._selectedObjects = value;
                this.needsDraw = true;
            }
        }
    },

    selectedObjectsController: {
        value: null
    },

    handleChange: {
        value: function() {
            this.drawAll();
        }
    },

    captureUpdate: {
        value: function(event) {
            this.drawAll();
        }
    },

    captureResize: {
        value: function(event) {
            this.drawAll();
        }
    },

    captureWebkitTransitionEnd: {
        value: function(event) {
            this.drawAll();
        }
    },

    prepareForDraw: {
        value: function() {
            // changing the size of the window causes selections to be shifted
            window.addEventListener("resize", this, true);
            // CSS animations can change the size of elements, causing
            // selections to be shifted
            window.addEventListener("webkitTransitionEnd", this, true);
        }
    },

    drawAll: {
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
