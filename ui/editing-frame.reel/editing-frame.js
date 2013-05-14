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
    @module "montage/ui/editing-frame.reel"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage,
    MontageReviver = require("montage/core/serialization/deserializer/montage-reviver").MontageReviver,
    Component = require("montage/ui/component").Component,
    Promise = require("montage/core/promise").Promise;

//TODO do we care about having various modes available?
var DESIGN_MODE = 0;
var RUN_MODE = 1;

// We maintain one window reference for each package that we see, and load all
// modules from that package in the window so all objects have the same
// window reference.
// TODO: Make a WeakMap?
var PACKAGE_WINDOWS = [];

var STAGE_CSS;
require.read(require.mappings.stage.location + "stage.css")
.then(function (contents) {
    STAGE_CSS = contents.replace("bg-stage.svg", require.mappings.stage.location + "bg-stage.svg");
}).done();


/**
    @class module:"ui/editing-frame.reel".EditingFrame
    @extends module:ui/component.Component
*/
exports.EditingFrame = Montage.create(Component, /** @lends module:"montage/ui/editing-frame.reel".EditingFrame# */ {

    /**
     * @name update
     * @event
     * @description Fired whenever a draw cycle occurs in the root component
     * of the frame
     */

    _stageUrl: {
        value: null
    },

    reset: {
        value: function () {

            if (this._deferredEditingInformation) {
                this._deferredEditingInformation.reject();
            }

            this._stageUrl = null;
            this.needsDraw = true;
        }
    },

    load: {
        value: function (fileUrl, packageUrl) {

            if (!fileUrl) {
                throw new Error("Missing required fileUrl");
            }

            // If already loading reject current loading request and load the new one
            if (this._deferredEditingInformation) {
                this._deferredEditingInformation.reject();
            }

            this._deferredEditingInformation = Promise.defer();

            var encodedFileUrl = encodeURIComponent(fileUrl);
            // use mappings as the location of the stage package changes after mopping
            this._stageUrl = require.mappings.stage.location + "index.html?reel-location=" + encodedFileUrl;

            if (packageUrl) {
                this._stageUrl += "&package-location=" + encodeURIComponent(packageUrl);
            }

            //Normalize slashes a bit, without affecting the protocol
            this._stageUrl = this._stageUrl.replace(/([^:])\/\//g, "$1/");

            this.needsDraw = true;

            return this._deferredEditingInformation.promise;
        }
    },

    _getRequireForPackage: {
        value: function (_require) {
            if (!(_require.location in PACKAGE_WINDOWS)) {
                var iframe = document.createElement("iframe");
                // An iframe must be in a document for its `window` to be
                // created an valid, so insert it but hide it.
                iframe.style.display = "none";
                document.body.appendChild(iframe);
                // Label for debugging
                iframe.dataset.packageFrame = _require.location;
                iframe.contentWindow.name = "packageFrame=" + _require.location;

                PACKAGE_WINDOWS[_require.location] = this._bootMontage(iframe.contentWindow, _require.location)
                .spread(function (applicationRequire) {
                    return applicationRequire;
                });
            }

            return PACKAGE_WINDOWS[_require.location];
        }
    },

    _bootMontage: {
        value: function (frameWindow, applicationLocation) {
            var booted = Promise.defer();

            var frameDocument = frameWindow.document;

            frameWindow.addEventListener("message", function (event) {
                if (event.data.type === "montageReady") {
                    frameWindow.postMessage({
                        type: "montageInit",
                        location: applicationLocation
                    }, "*");
                }
            }, true);

            frameWindow.montageDidLoad = function () {
                booted.resolve([frameWindow.require, frameWindow.montageRequire]);
            };

            // Can't use the mappings Montage location as this package
            // has been loaded through filament's require, and so maps
            // Montage to filament's Montage
            var montageLocation = applicationLocation + "node_modules/montage/montage.js";
            var script = document.createElement("script");
            script.src = montageLocation;
            script.dataset.remoteTrigger = "http://client";
            // Bootstrapper removes the script tag when done, so no need
            // to do it here on load
            frameDocument.head.appendChild(script);

            return booted.promise;
        }
    },

    _isObjectFromPackageRequire: {
        value: function (object, packageRequire) {
            // Check that the require the object was loaded with is the our
            // require for the package. This ensures that they have the same
            // window reference.
            return Montage.getInfoForObject(object).require.config.mappings === packageRequire.config.mappings;
        }
    },

    loadTemplate: {
        value: function (template, ownerModule, ownerName) {
            // If already loading reject current loading request and load the new one
            if (this._deferredEditingInformation) {
                this._deferredEditingInformation.reject();
            }
            this._deferredEditingInformation = Promise.defer();

            var self = this;

            var instances;

            var frameWindow = this.iframe.contentWindow;
            var frameDocument = this.iframe.contentDocument;

            var packageRequire, packageMontageRequire;

            this._deferredEditingInformation = Promise.defer();

            this._getRequireForPackage(template._require)
            .then(function (_packageRequire) {
                packageRequire = _packageRequire;
                packageMontageRequire = packageRequire.getPackage({name: "montage"});

                template = packageMontageRequire("core/template").Template.clone.call(template);
                template._require = packageRequire;

                self._loadedTemplate = template;
                self._ownerModule = ownerModule;
                self._ownerName = ownerName;

                instances = template.getInstances();

                // check that all instances are from the packageRequire
                if (instances && Object.keys(instances).length) {
                    for (var label in instances) {
                        if (!self._isObjectFromPackageRequire(instances[label], packageRequire)) {
                            throw new Error("Template instance '" + label + "' was not loaded using the correct require");
                        }
                    }
                }

                frameWindow.name = "editingFrame=" + packageRequire.location;

                // We need to boot Montage in the frame so that all the shims
                // Montage needs get installed
                if (self.iframe.src !== "" || !frameWindow.montageRequire) {
                    // self.iframe.src = "";
                    return self._bootMontage(frameWindow, packageRequire.location)
                    .spread(function (_, frameMontageRequire) {
                        var style = frameDocument.createElement("style");
                        style.textContent = STAGE_CSS;
                        frameDocument.head.appendChild(style);

                        frameMontageRequire("core/event/event-manager").defaultEventManager.unregisterWindow(frameWindow);

                        packageMontageRequire("core/event/event-manager").defaultEventManager.registerWindow(frameWindow);

                        //jshint -W106
                        var rootComponent = packageMontageRequire("ui/component").__root__;
                        //jshint +W106
                        rootComponent.element = frameDocument;

                        // replace draw
                        var originalDrawIfNeeded = rootComponent.drawIfNeeded;
                        rootComponent.drawIfNeeded = function() {
                            originalDrawIfNeeded.call(rootComponent);
                            self.dispatchEventNamed("update", true, false);
                        };
                    });
                }
            })
            .then(function () {
                //jshint -W106
                var rootComponent = packageMontageRequire("ui/component").__root__;
                //jshint +W106
                return self._setupTemplate(template, packageRequire, rootComponent, ownerModule, ownerName);
            })
            .then(function (owner) {
                // self._replaceDraw(frameWindow);
                // var rootComponent = packageMontageRequire("ui/component").__root__;

                self._deferredEditingInformation.resolve({owner: owner, template: template, frame: self});
            })
            .fail(this._deferredEditingInformation.reject);

            return this._deferredEditingInformation.promise;
        }
    },

    _setupTemplate: {
        value: function (template, packageRequire, rootComponent, ownerModule, ownerName) {
            if (!this.iframe.contentWindow.montageRequire) {
                throw new Error("Montage must have been initialized in the frame before setting up the template");
            }

            // set once the template has been initialized
            var owner;
            var drawn = Promise.defer();

            var frameDocument = this.iframe.contentDocument;
            var instances = template.getInstances();

            function firstDrawHandler() {
                // Strictly speaking this handler is only being called
                // because the event is bubbling up from its children and
                // so the stage may not be fully drawn. However the drawing
                // completes syncronously but the resolution of the
                // promise is async, so by the time the promise handler
                // is called, the drawing will be complete.
                rootComponent.removeEventListener("firstDraw", firstDrawHandler, false);
                drawn.resolve(owner);
            }
            rootComponent.addEventListener("firstDraw", firstDrawHandler, false);

            var createOwner;
            if (!instances || !instances.owner) {
                // if the template has an owner then we need to
                // instantiate it
                createOwner = template.getObjectsString(template.document)
                .then(function (objectsString) {
                    var objects = JSON.parse(objectsString);
                    if (objects.owner) {
                        ownerName = ownerName || MontageReviver.parseObjectLocationId(ownerModule).objectName;

                        return packageRequire.async(ownerModule)
                        .get(ownerName)
                        .then(function (ownerPrototype) {
                            return ownerPrototype.create();
                        }).then(function (owner) {
                            // prevent owner from loading its own template
                            owner._isTemplateLoaded = true;
                            owner.hasTemplate = false;

                            instances = instances || {};
                            instances.owner = owner;
                            template.setInstances(instances);
                        });
                    }
                });
            } else {
                createOwner = Promise.resolve();
            }

            createOwner.then(function () {
                return template.instantiate(frameDocument);
            })
            .then(function (part) {

                frameDocument.body.appendChild(part.fragment);

                // TODO does this exist when the template is an inner template?
                owner = part.objects.owner;

                return Promise.all(Object.keys(part.objects).map(function (label) {
                    var object = part.objects[label];
                    if (object.loadComponentTree) {
                        if (!object.parentComponent) {
                            object.attachToParentComponent();
                        }
                        return object.loadComponentTree();
                    }
                }));
            })
            .then(function () {
                return packageRequire.async("montage/core/document-resources");
            })
            .then(function (exports) {
                var documentResources = exports.DocumentResources.getInstanceForDocument(frameDocument);

                var resources = template.getResources(frameDocument);
                // Inserts scripts
                resources.loadScripts().done();
                // Inserts styles
                resources.createStylesForDocument(frameDocument).forEach(function (style) {
                    documentResources.addStyle(style);
                });

            })
            .fail(drawn.reject);

            return drawn.promise;
        }
    },

    // might not need this function, currently just used to clear the frame
    // but this should probably be part of loadTemplate
    refresh: {
        value: function (template) {
            if (!this._loadedTemplate) {
                throw new Error("Editing frame must have a loaded template before refreshing");
            }

            var packageRequire = this._loadedTemplate._require;
            var packageMontageRequire = packageRequire.getPackage({name: "montage"});

            //jshint -W106
            var rootComponent = packageMontageRequire("ui/component").__root__;
            //jshint +W106

            // Really don't care about any errors that occur here as we're
            // blowing away the contents anyways
            try {
                rootComponent.childComponents.forEach(function (child) {
                    rootComponent.removeChildComponent(child);
                });
            } catch (e) {}
            this.iframe.contentDocument.body.innerHTML = "";

            return this.loadTemplate(template, this._ownerModule, this._ownerName);
        }
    },

    // EditingFrame Methods

    enterDocument: {
        value: function (firstTime) {
            if (firstTime) {

                var iframe = this.iframe;

                if (null === this._height) {
                    this.height = iframe.offsetHeight;
                }

                if (null === this._width) {
                    this.width = iframe.offsetWidth;
                }

                // TODO this is a little dirty, we should accept whatever identifier we were given, not demand one
                // TODO why is this even necessary?
                iframe.identifier = "editingFrame";

                // At this point the editingFrame can now "load" a reel from a package
                this.dispatchEventNamed("canLoadReel", true, true);

                this.element.addEventListener("mousedown", this);
            }
        }
    },

    draw: {
        value: function () {

            var iframe = this.iframe;

            if (this.currentMode === DESIGN_MODE) {
                this.element.classList.add("designMode");
            } else {
                this.element.classList.remove("designMode");
            }

            if (this._stageUrl && this._stageUrl !== iframe.src) {
                iframe.addEventListener("load", this, false);
                iframe.src = this._stageUrl;
            } else if (!this._stageUrl && iframe.src) {
                iframe.removeAttribute("src");
            }

            this.screen.width = iframe.width = this.width;
            this.screen.height = iframe.height = this.height;
        }
    },

    handleEditingFrameLoad: {
        value: function () {
            var iframe = this.iframe;
            iframe.removeEventListener("load", this, false);
            window.addEventListener("message", this);
        }
    },

    handleMessage: {
        value: function (evt) {

            var iframe = this.iframe,
                iFrameWindow = iframe.contentWindow,
                ownerComponent,
                self = this;

            if (evt._event.source === iFrameWindow && evt.data === "componentReady") {
                window.removeEventListener("message", this);
                iFrameWindow.defaultEventManager.delegate = this;

                this._replaceDraw(iFrameWindow);
                this._addDragAndDropEvents(iFrameWindow);

                ownerComponent = iFrameWindow.stageData.ownerComponent;

                // This is done to maintain compatibility with pre 0.13
                // versions of Montage where _loadTemplate did not return a
                // promise and used a callback instead.
                var deferredTemplate = Promise.defer();
                deferredTemplate = ownerComponent._loadTemplate(deferredTemplate.resolve) || deferredTemplate;

                deferredTemplate.then(function (template) {
                    self._deferredEditingInformation.resolve({owner:ownerComponent, template:template, frame:self});
                }).done();
            }

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
            }).done();
        }
    },

    _addDragAndDropEvents: {
        value: function(iFrameWindow) {
            var element = this.element;
            element.addEventListener("dragenter", this, false);
            element.addEventListener("dragleave", this, false);
            element.addEventListener("dragover", this, false);
            element.addEventListener("drop", this, false);
        }
    },

    // EditingFrame Delegate Methods

    handleMousedown: {
        value: function (evt) {

            if (RUN_MODE === this.currentMode || 0 !== evt.button) {
                return;
            }

            var x = evt.offsetX,
                y = evt.offsetY,
                frameDocument = this.iframe.contentDocument,
                selectionCandidate = frameDocument.elementFromPoint(x, y),
                isAddingToSelection = false,
                isRemovingFromSelection = false;

            this.dispatchEventNamed("select", true, true, {
                candidate: selectionCandidate,
                addToSelection: false,
                expandToSelection: false,
                removeFromSelection: false,
                retractFromSelection: false
            });
        }
    },



    // EditingFrame Properties

    // The template we're in the process of loading
    _deferredEditingInformation: {
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
    }
});
