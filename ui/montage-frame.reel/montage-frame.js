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
    Promise = require("montage/core/promise").Promise;

//TODO do we care about having various modes available?
var DESIGN_MODE = 0;
var RUN_MODE = 1;

/**
    Description TODO
    @class module:"ui/montage-frame.reel".MontageFrame
    @extends module:ui/component.Component
*/
exports.MontageFrame = Montage.create(Component, /** @lends module:"montage/ui/montage-frame.reel".MontageFrame# */ {

    // The object installed on the iframe's contentView that coordinates interacting with the frame itself
    // this is the real demarcation point between frames.
    // Clients of the MontageFrame shouldn't ever need to know this object is behind the scenes.
    // The MontageFrame mediates interaction between the frameManager and the outside world.
    _frameManager: {value: null},

    delegate: {
        value: null
    },

    logMessages: {
        distinct: true,
        value: []
    },

    currentComponent: {
        value: null
    },

    _deferredOwner: {
        value: null
    },

    // FrameManager Forwarding Methods

    clear: {
        value: function () {
            this._frameManager.clear();
        }
    },

    load: {
        value: function (serialization, html, javascript, css) {

            if (this._deferredOwner) {
                this._deferredOwner.reject();
            }

            this._deferredOwner = Promise.defer();

            var ownerPromise,
                self = this;

            if (this._frameManager) {
                ownerPromise = this._frameManager.load(this, serialization, html, javascript, css);

                if (ownerPromise) {
                    ownerPromise.then(
                        function (ownerFromFoundation) {
                            self._deferredOwner.resolve(ownerFromFoundation);
                        },
                        function () {
                            self._deferredOwner.reject();
                        }
                    );
                }
            } else {
                this._css = css;
                this._serialization = serialization;
                this._html = html;
                this._javascript = javascript;
            }

            return this._deferredOwner.promise;
        }
    },

    save: {
        value: function () {
            return this._frameManager.save();
        }
    },

    // Add an instance of a component to the owner
    addComponent: {
        value: function (componentModule, componentName, markup, properties) {
            // TODO emit an event that this is happening, so others can react
            // TODO maybe just pass in a componentDefinition that has a createComponent(document) method
            return this._frameManager.addComponent(componentModule, componentName, markup, properties);
        }
    },

    // Add an instance of an object to the owner
    addObject: {
        value: function (objectModule, objectName, properties) {
            // TODO emit an event that this is happening, so others can react
            return this._frameManager.addObject(objectModule, objectName, properties);
        }
    },

    // MontageFrame Methods

    prepareForDraw: {
        value: function () {
            this.element.addEventListener("load", this, false);
            this.element.src = require.location + "/ui/montage-frame.reel/frame/frame.html";

            if (null === this._height) {
                this.height = this.element.offsetHeight;
            }

            if (null === this._width) {
                this.width = this.element.offsetWidth;
            }
        }
    },

    draw: {
        value: function () {

            if (this.currentMode === DESIGN_MODE) {
                this.element.classList.add("designMode");
            } else {
                this.element.classList.remove("designMode");
            }

            this.element.width = this.width;
            this.element.height = this.height;
        }
    },

    handleLoad: {
        value: function (evt) {

            if (evt.target !== this.element) {
                return;
            }

            var frameElement = this.element,
                frameDoc = frameElement.contentWindow.document,
                montageScript = frameDoc.createElement("script");

            frameElement.removeEventListener("load", this);

            montageScript.setAttribute("data-package", "../../../package.json");
            montageScript.setAttribute("data-module", "ui/montage-frame.reel/frame/frame");
            montageScript.setAttribute("src", require.getPackage({name: "montage"}).location + "montage.js");
            frameDoc.head.appendChild(montageScript);

            console.log("montageFrame: append montage.js script element inside frame", frameDoc.head.outerHTML);

            window.addEventListener("message", this, false);
        }
    },

    handleMessage: {
        value: function (evt) {
            if (evt._event.source === this._element.contentWindow && evt.data === "ready") {

                window.removeEventListener("message", this);

                var iframeWindow = this._element.contentWindow;
                iframeWindow.console.debug = this.debug.bind(this);
                iframeWindow.console.log = this.log.bind(this);

                this._frameManager = iframeWindow.Frame;

                console.log("montageFrame: inner frame reported 'ready'");

                if (this._serialization || this._html || this._javascript || this._css) {
                    this._frameManager.load(this, this._serialization, this._html, this._javascript, this._css);
                    delete this._serialization;
                    delete this._html;
                    delete this._javascript;
                    delete this._css;
                }
            }
        }
    },

    debug: {
        value: function (message) {
            if (message.indexOf("Syntax error") === 0) {
                this._iframeDocument.body.innerHTML = "<pre>" + message + "</pre>";
            } else {
                console.debug.apply(console, arguments);
            }
        }
    },

    log: {
        value: function (message) {
            this.logMessages.push(Array.prototype.join.call(arguments, " "));
            console.log.apply(console, arguments);
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

            var selectionCandidate = evt.target.controller;

            if (selectionCandidate && (!this.selectedObjects || this.selectedObjects[0] !== selectionCandidate)) {
                this.selectedObjects = [selectionCandidate];
            }

            if (selectionCandidate && this.delegate && typeof this.delegate.didObserveEvent === "function") {
                this.delegate.didObserveEvent(this, evt);
            }
        }
    },

    // MontageFrame Properties

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
