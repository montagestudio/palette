/**
    @module "ui/workbench.reel"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component,
    Event = require("core/event").Event;

/**
    Description TODO
    @class module:"ui/workbench.reel".Workbench
    @extends module:montage/ui/component.Component
*/

// The workbench is high-level working area for loading a project and interacting with it.
// The workbench is responsible for providing the rich environment for editing tools and menus
// tool cursors, alignment guides, contextual editing components, and other editing specific visuals
// well be drawn within the workbench above, but coordinated with, the document being edited.

exports.Workbench = Montage.create(Component, /** @lends module:"ui/workbench.reel".Workbench# */ {

    // TODO project? would be nice to avoid confusion with the DOM document
    _currentDocument: {
        value: null
    },

    currentDocument:{
        get:function () {
            return this._currentDocument;
        },
        set:function (value) {
            if (value === this._currentDocument) {
                return;
            }

            this._currentDocument = value;
            this.loadDocument();
        }
    },

    _needsDocumentLoad: {
        value: false
    },

    loadDocument: {
        value: function () {
            if (!this.montageFrame) {
                this._needsDocumentLoad = true;
                return;
            }

            this.montageFrame.addEventListener("firstdraw", this, true);

            var doc = this.currentDocument;

            if (doc) {
                this.montageFrame.load(doc.serialization, doc.structure, doc.behavior, doc.styling);
            }

            this._needsDocumentLoad = false;
        }
    },

    save: {
        value: function () {
            return this._montageFrame.save();
        }
    },

    _montageFrame: {
        value: null
    },

    montageFrame: {
        get: function () {
            return this._montageFrame;
        },
        set: function (value) {
            if (value === this._montageFrame) {
                return;
            }

            if (this._montageFrame && this === this._montageFrame.delegate) {
                this._montageFrame.delegate = null;
            }

            this._montageFrame = value;

            if (this._montageFrame) {
                this._montageFrame.delegate = this;
            }

            if (this._montageFrame && this._needsDocumentLoad) {
                this.loadDocument();
            }
        }
    },

    //TODO given how high above the frame we are, should the API accept a constructor at this level?
    // it needs to be strings by the time it goes to the frameManager
    addComponent: {
        value: function (componentPath, componentName, markup) {
            this.montageFrame.addComponent(componentPath, componentName, markup);
        }
    },

    prepareForActivationEvents: {
        value: function() {
            this.element.addEventListener("mousedown", this, false);
        }
    },

    handleMousedown: {
        value: function(evt) {
            if (evt.target === this.element) {
                this.selectedObjects = null;
            }
        }
    },

    observedEvents:{
        distinct:true,
        value:[]
    },

    didObserveEvent: {
        value: function(montageFrame, evt) {
            var observedEvent = Event.create();
            observedEvent.type = evt.type;
            observedEvent.target = evt.target;
            observedEvent.timestamp = evt.timeStamp;

            this.observedEvents.push(observedEvent);
        }
    },

    _selectionsEl: {
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
                this._selectedObjects = value;
                this.needsDraw = true;
            }
        }
    },
    drawSelections: {
        value: function() {
            var frameRect = window.getComputedStyle(this._montageFrame.element);
            var offsetLeft = this._montageFrame.element.offsetLeft;
            var offsetTop = this._montageFrame.element.offsetTop;

            var numSelectedObjects = this._selectedObjects.length;
            var selectionsEl = this._selectionsEl;
            var numSelectionEls = this._selectionsEl.childNodes.length;

            var available = Math.min(numSelectedObjects, numSelectionEls);

            for (var i = 0; i < available; i++) {
                // get dimensions of selectedObject
                var rect = this._selectedObjects[i].element.getBoundingClientRect();
                // set this._selectionsEl.childNodes[i] to dimensions
                this._selectionsEl.childNodes[i].style.left = (offsetLeft + rect.left) + "px";
                this._selectionsEl.childNodes[i].style.top = (offsetTop + rect.top) + "px";
                this._selectionsEl.childNodes[i].style.width = rect.width + "px";
                this._selectionsEl.childNodes[i].style.height = rect.height + "px";
            }

            if (numSelectedObjects > numSelectionEls) {
                // create more selectionEls and set dimensions
            } else if (numSelectedObjects < numSelectionEls) {
                // remove extra els
            }
        }
    },

    draw: {
        value: function() {
            if (this._selectedObjects) {
                this.drawSelections();
            }
        }
    }

});
