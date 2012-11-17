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
            if (!this.montageFrame) {
                this._needsProjectLoaded = true;
                return;
            }

            if (this.currentProject) {
                this.montageFrame.load(this.currentProject.reelUrl);
            }

            this._needsProjectLoaded = false;
        }
    },

    template: {
        get: function () {
            return this._montageFrame.template;
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

            if (this._montageFrame && this._needsProjectLoaded) {
                this.loadProject();
            }
        }
    },

    //TODO given how high above the frame we are, should the API accept a constructor at this level?
    // it needs to be strings by the time it goes to the frameManager
    addComponent: {
        value: function (componentPath, componentName, markup, properties, postProcess) {
            this.montageFrame.addComponent(
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
        value: function(montageFrame, evt) {
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
