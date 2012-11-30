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

    _currentProject: {
        value: null
    },

    currentProject: {
        get: function () {
            return this._currentProject;
        },
        set: function (value) {
            if (value === this._currentProject) {
                return;
            }

            this._currentProject = value;
            this.loadProject();
        }
    },

    _needsProjectLoaded: {
        value: false
    },

    loadProject: {
        value: function () {
            if (!this.editingFrame) {
                this._needsProjectLoaded = true;
                return;
            }

            if (this.currentProject) {
                this.editingFrame.load(this.currentProject.reelUrl);
            }

            this._needsProjectLoaded = false;
        }
    },

    template: {
        get: function () {
            return this._editingFrame.template;
        }
    },

    _editingFrame: {
        value: null
    },

    editingFrame: {
        get: function () {
            return this._editingFrame;
        },
        set: function (value) {
            if (value === this._editingFrame) {
                return;
            }

            if (this._editingFrame && this === this._editingFrame.delegate) {
                this._editingFrame.delegate = null;
            }

            this._editingFrame = value;

            if (this._editingFrame) {
                this._editingFrame.delegate = this;
            }

            if (this._editingFrame && this._needsProjectLoaded) {
                this.loadProject();
            }
        }
    },

    //TODO given how high above the frame we are, should the API accept a constructor at this level?
    // it needs to be strings by the time it goes to the frameManager
    addComponent: {
        value: function (componentPath, componentName, markup, properties, postProcess) {
            this.editingFrame.addComponent(
                componentPath,
                componentName,
                markup,
                properties,
                postProcess
            );
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
        value: function(editingFrame, evt) {
            var observedEvent = Event.create();
            observedEvent.type = evt.type;
            observedEvent.target = evt.target;
            observedEvent.timestamp = evt.timeStamp;

            this.observedEvents.push(observedEvent);
        }
    },

    selectedObjects: {
        value: null
    }

});
