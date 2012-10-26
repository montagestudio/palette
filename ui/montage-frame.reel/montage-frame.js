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
    Component = require("montage/ui/component").Component;

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

    _iframeReady: {value: false},
    _iframeDocument: {value: null},

    delegate: {
        value: null
    },

    logMessages: {
        distinct: true,
        value: []
    },

    prepareForDraw: {
        value: function () {
            this.element.src = require.location + "/ui/montage-frame.reel/frame/frame.html";

            if (null === this._height) {
                this.height = this.element.offsetHeight;
            }

            if (null === this._width) {
                this.width = this.element.offsetWidth;
            }

            this.element.addEventListener("load", this, false);
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
            window.addEventListener("message", this, false);

            montageScript.setAttribute("src", require.getPackage({name:"montage"}).location + "montage.js");
            montageScript.setAttribute("data-package", "../../../package.json");
            montageScript.setAttribute("data-module", "ui/montage-frame.reel/frame/frame");
            frameDoc.head.appendChild(montageScript);
        }
    },

    handleMessage: {
        value: function (evt) {
            if (evt._event.source === this._element.contentWindow && evt.data === "ready") {
                this._iframeReady = true;

                var iframeWindow = this._element.contentWindow;

                iframeWindow.console.debug = this.debug.bind(this);
                iframeWindow.console.log = this.log.bind(this);

                this._iframeDocument = iframeWindow.document;

                this._frameManager = iframeWindow.Frame;
                // TODO this looks like it could introduce some cross-window object chatter…
                iframeWindow.defaultEventManager.delegate = this;

                window.removeEventListener("message", this);

                this.needsDraw = true;
            }
        }
    },

    currentComponent: {
        value: null
    },

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

            if (evt.target === this._iframeDocument.documentElement) {
                this.selectedObjects = [this.currentDocument];
            }

            if (selectionCandidate && this.delegate && typeof this.delegate.didObserveEvent === "function") {
                this.delegate.didObserveEvent(this, evt);
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

    _needsContentLoaded: {
        value: false
    },

    load: {
        value: function (css, serialization, html, javascript) {
            this._css = css;
            this._serialization = serialization;
            this._html = html;
            this._javascript = javascript;

            this._needsContentLoaded = true;
            this.needsDraw = true;
        }
    },

    save: {
        value: function() {
            return this._frameManager.export();
        }
    },

    addComponent: {
        value: function (componentPath, componentName, markup) {
            this._frameManager.addComponent(componentPath, componentName, markup);
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

            if (this._needsContentLoaded && this._iframeReady) {

                var oldSerialization = this._iframeDocument.head.querySelector("script[type='text/montage-serialization']");
                if (oldSerialization) {
                    oldSerialization.parentNode.removeChild(oldSerialization);
                }

                this._serializationElement = this._iframeDocument.createElement("script");
                this._serializationElement.setAttribute("type", "text/montage-serialization");
                this._iframeDocument.head.appendChild(this._serializationElement);

                this._frameManager.reset();

                //TODO do we still want to simply inject all this text?
                this._iframeDocument.head.querySelector("style").textContent = this._css;
                this._serializationElement.textContent = this._serialization;
                this._iframeDocument.head.querySelector("script").textContent = this._javascript;

                this._iframeDocument.body.innerHTML = this._html;

                // TODO if injecting this content has lead to an owner component, how do we indicate that?
                this._frameManager.initWithOwner();
                this._needsContentLoaded = false;
            }
        }
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
