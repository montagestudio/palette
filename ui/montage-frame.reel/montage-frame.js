/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */
/**
    @module "montage/ui/montage-frame.reel"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component,
    Promise = require("montage/core/promise").Promise,
    ComponentController = require("core/controller/component-controller").ComponentController,
    Exporter = require("core/exporter").Exporter;

//TODO do we care about having various modes available?
var DESIGN_MODE = 0;
var RUN_MODE = 1;

/**
    @class module:"ui/montage-frame.reel".MontageFrame
    @extends module:ui/component.Component
*/
exports.MontageFrame = Montage.create(Component, /** @lends module:"montage/ui/montage-frame.reel".MontageFrame# */ {

    /**
     * @name update
     * @event
     * @description Fired whenever a draw cycle occurs in the root component
     * of the frame
     */

    load: {
        value: function (reelUrl) {

            // If already loading a component reject it and load the new one
            if (this._deferredComponent) {
                this._deferredComponent.reject();
            }

            this._deferredComponent = Promise.defer();

            var reelLocation = encodeURIComponent(reelUrl);
            this._shellUrl = require.location + "/shell/shell.html?reel-location=" + reelLocation;
            this.needsDraw = true;

            //TODO what do we actually want to promise to return? probably the componentController...
            return this._deferredComponent.promise;
        }
    },

    // Add an instance of a component to the owner
    addComponent: {
        value: function (componentModule, componentName, markup, properties, postProcess) {
            // TODO emit an event that this is happening, so others can react
            // TODO maybe just pass in a componentDefinition that has a createComponent(document) method
            var deferredComponent = this.componentController.addComponent(
                componentModule,
                componentName,
                markup,
                properties,
                postProcess
            );

            var self = this;
            deferredComponent.then(function (component) {
                self.selectObject(component);
                return component;
            });

            return deferredComponent;

        }
    },

    // Add an instance of an object to the owner
    addObject: {
        value: function (objectModule, objectName, properties) {
            // TODO emit an event that this is happening, so others can react
            return this.componentController.addObject(objectModule, objectName, properties);
        }
    },

    template: {
        get: function () {

            var iframeWindow = this._element.contentWindow,
                exporter,
                template;

            if (iframeWindow) {
                exporter = Exporter.create();
                template = exporter.export(iframeWindow, this.componentController.owner, this.componentController.ownerRequire);
            }

            return template;
        }
    },

    // MontageFrame Methods

    prepareForDraw: {
        value: function () {
            if (null === this._height) {
                this.height = this.element.offsetHeight;
            }

            if (null === this._width) {
                this.width = this.element.offsetWidth;
            }

            this.element.identifier = "editingFrame";
        }
    },

    draw: {
        value: function () {

            if (this.currentMode === DESIGN_MODE) {
                this.element.classList.add("designMode");
            } else {
                this.element.classList.remove("designMode");
            }

            if (this._shellUrl && this._shellUrl !== this.element.src) {
                this.element.addEventListener("load", this, false);
                this.element.src = this._shellUrl;
            }

            this.element.width = this.width;
            this.element.height = this.height;
        }
    },

    _replaceDraw: {
        value: function(iFrameWindow) {
            var self = this;
            // inspired by frameLoad in Montage testpageloader
            iFrameWindow.montageRequire.async("ui/component")
            .get("__root__").then(function(root) {
                var originalDrawIfNeeded = root.drawIfNeeded;
                root.drawIfNeeded = function() {
                    originalDrawIfNeeded.call(root);
                    self.dispatchEventNamed("update", true, false);
                };
            });
        }
    },

    handleEditingFrameLoad: {
        value: function () {
            this.element.removeEventListener("load", this, false);
            window.addEventListener("message", this);
        }
    },

    handleMessage: {
        value: function (evt) {

            var iFrameWindow = this._element.contentWindow;

            if (evt._event.source === iFrameWindow && evt.data === "ready") {
                window.removeEventListener("message", this);
                iFrameWindow.defaultEventManager.delegate = this;

                this._replaceDraw(iFrameWindow);

                this.componentController = ComponentController.create();
                this.componentController.frame = this;
                this.componentController.owner = iFrameWindow.ownerComponent;
                this._deferredComponent.resolve(iFrameWindow.ownerComponent);
            }

        }
    },

    // MontageFrame Delegate Methods

    willDistributeEvent: {
        value: function (evt) {

            //TODO extract modes as strategies? Don't need tons of flags everywhere
            // TODO we allow firstdraw to continue to not hinder rendering, any others?
            if (RUN_MODE === this.currentMode || "firstDraw" === evt.type) {

                // TODO improve detection of current owner component, assuming it is the first one drawn
                // seems a little brittle, or verify that it is certainly always the first (it should be)
                if ("firstDraw" === evt.type && null === this.currentComponent) {
                    this.currentComponent = evt.target;
                }
                return;
            }

            evt.stop();
            console.log("stopped", evt.type);

            if (evt.type === "mousedown" && 0 === evt.button) {

                var selectionCandidate = evt.target.controller,
                    isAddingToSelection = false,
                    isRemovingFromSelection = false;

                if (selectionCandidate) {

                    //TODO if selectionCandidate is currently selected, drill down to find new one

                    if (isAddingToSelection) {
                        this.selectObject(selectionCandidate);
                    } else if (isRemovingFromSelection) {
                        this.deselectObject(selectionCandidate);
                    } else {
                        this.clearSelectedObjects();
                        this.selectObject(selectionCandidate);
                    }
                } else {
                    this.clearSelectedObjects();
                }
            }

            if (this.delegate && typeof this.delegate.didObserveEvent === "function") {
                this.delegate.didObserveEvent(this, evt);
            }
        }
    },

    // Selects nothing
    clearSelectedObjects: {
        value: function () {
            this.selectedObjects = null;
        }
    },

    // Remove object from current set of selectedObjects
    deselectObject: {
        value: function (object) {
            //TODO implement this
        }
    },

    // Add object to current set of selectedObjects
    selectObject: {
        value: function (object) {

            if (!this.selectedObjects) {
                this.selectedObjects = [];
            }

            //HACK
            // if it's a repetition skip it for now... this just to select the flow
            if (object._montage_metadata.module === "ui/repetition.reel") {
                object = object.parentComponent;
            }
            // end HACK

            var index;
            if ((index = this.selectedObjects.indexOf(object)) !== -1) {
                // remove
                this.selectedObjects.splice(index, 1);
            } else {
                // add
                this.selectedObjects.setProperty("0", object);
            }


        }
    },

    // MontageFrame Properties

    componentController: {
        value: null
    },

    // The Url of the Component's Reel being edited
    reelUrl: {
        value: null
    },

    // The deferred component the montageFrame is waiting to fulfill
    _deferredComponent: {
        value: null
    },

    // The current component being edited
    currentComponent: {
        value: null
    },

    delegate: {
        value: null
    },

    _width: {
        value: null
    },

    width: {
        get: function () {
            return this._width;
        },
        set: function (value) {
            if (value === this._width) {
                return;
            }

            this._width = value;
            this.needsDraw = true;
        }
    },

    _height: {
        value: null
    },

    height: {
        get: function () {
            return this._height;
        },
        set: function (value) {
            if (value === this._height) {
                return;
            }

            this._height = value;
            this.needsDraw = true;
        }
    },

    _currentMode: {
        value: DESIGN_MODE
    },

    currentMode: {
        get: function () {
            return this._currentMode;
        },
        set: function (value) {
            if (value === this._currentMode) {
                return;
            }

            this._currentMode = value;
            this.needsDraw = true;
        }
    },

    selectedObjects: {
        value: null
    }
});
