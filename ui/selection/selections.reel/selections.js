/**
    @module "ui/selections.reel"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component,
    ArrayController = require("montage/ui/controller/array-controller").ArrayController,
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

            this.selectedObjectsController = ArrayController.create();
            Object.defineBinding(this.selectedObjectsController, "content", {
                boundObject: this,
                boundObjectPropertyPath: "_selectedObjects",
                oneway: true
            });
        }
    },

     _offsetComponent: {
         value: null
     },
     /**
      * The Montage component that contains the selected objects. This used to
      * offset the selection borders so that they appear in the correct place.
      * @type {Component}
      */
     offsetComponent: {
         get: function() {
             return this._offsetComponent;
         },
         set: function(value) {
             if (this._offsetComponent === value) {
                 return;
             }
             this._offsetComponent = value;
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
            this.needsDraw = true;
        }
    },

    willDraw: {
        value: function() {
            this._offsetLeft = this.offsetComponent.element.offsetLeft;
            this._offsetTop = this.offsetComponent.element.offsetTop;
        }
    }

});
