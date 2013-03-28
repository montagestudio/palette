/**
    @module "ui/workbench.reel"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component,
    Promise = require("montage/core/promise").Promise,
    Event = require("core/event").Event,
    MutableEvent = require("montage/core/event/mutable-event").MutableEvent,
    defaultEventManager = require("montage/core/event/event-manager").defaultEventManager;

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

    // Load the specified reel onto the workbench, optionally specifying the packageUrl
    // Returns a promised editingInfo {owner, template}
    load: {
        value: function (fileUrl, packageUrl) {
            return this.editingFrame.load(fileUrl, packageUrl);
        }
    },

    selectedObjects: {
        value: null
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
        }
    },

    didObserveEvent: {
        value: function(frame, event) {
            //TODO what about non-DOM events...
            if (Element.isElement(event.target)) {

                switch (event.type) {
                case "focus":
                case "mousedown":
                case "touchstart":
                    defaultEventManager._prepareComponentsForActivation(this.element);
                    break;
                }

                switch (event.type) {
                    // Propagate drag and drop events up
                    // TODO not dispatch a DOM event from a component
                case "dragenter":
                case "dragleave":
                case "dragover":
                case "drop":
                    event.propagationStopped = false;
                    this.dispatchEvent(event);
                    break;
                default:
                    var targettedEvent = MutableEvent.fromEvent(event);
                    targettedEvent.target = this.element;
                    defaultEventManager.handleEvent(targettedEvent);
                }
            }
        }
    }

});
