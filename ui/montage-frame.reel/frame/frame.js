var Template = require("montage/ui/template").Template,
    Component = require("montage/ui/component").Component,
    Promise = require("montage/core/promise").Promise,
    rootComponent = require("montage/ui/component").__root__,
    ComponentController = require("core/controller/component-controller").ComponentController,
    Exporter = require("core/exporter").Exporter;

window.Frame = {

    _document: null,

    _deferredOwner: null,

    // Initialization methods

    // Load the given serialization, html, css, and javascript into the internal frame
    // returning a deferred reference to the owner component
    load: function (montageFrame, serialization, html, javascript, css) {

        if (this._deferredOwner) {
            this._deferredOwner.reject();
        }

        this._deferredOwner = Promise.defer();

        var doc = this._document = window.document,
            head = doc.head,
            oldSerialization = doc.querySelector("script[type='text/montage-serialization']"),
            serializationElement,
            ownerSerialization,
            ownerSerializationLabel = "owner",
            ownerModule = "montage/ui/component",
            ownerName = "Component",
            ownerElementMontageId = "owner",
            owner;

        if (oldSerialization) {
            oldSerialization.parentNode.removeChild(oldSerialization);
        }

        // Whether a serialization was present or not doesn't mean there aren't
        // objects that need to be cleared out; they may have been introduced without
        // a serialization
        this.clear();

        if (serialization) {
            serializationElement = doc.createElement("script");
            serializationElement.setAttribute("type", "text/montage-serialization");
            serializationElement.textContent = serialization;
            head.appendChild(serializationElement);

            // Find specified owner component
            ownerSerialization = JSON.parse(serialization)[ownerSerializationLabel];
            if (ownerSerialization) {

                //TODO if no owner prototype, try to infer type based on reel?
                if (ownerSerialization.prototype) {
                    ownerModule = ownerSerialization.prototype;
                }

                //TODO do we have a utility method for this?
                ownerName = ownerModule.replace(".reel", "").substring(ownerModule.lastIndexOf("/") + 1).toCapitalized();

                //TODO if no element....use body? documentRoot?
                ownerElementMontageId = ownerSerialization.properties.element["#"];
            }
        }

        if (html) {
            doc.body.innerHTML = html;
        }

        if (css) {
            head.querySelector("style").textContent = css;
        }

        if (javascript) {
            head.querySelector("script[type='text/montage-javascript']").textContent = javascript;
        }

        // TODO in jasmine specs this works:
        rootComponent.application.eventManager.delegate = montageFrame;
        // and this doesn't:
        // window.defaultEventManager.delegate = montageFrame;

        this._resolveOwnerComponent(ownerModule, ownerName, ownerElementMontageId);
        return this._deferredOwner.promise;
    },

    // Prepares the document for use by creating a owner component
    _resolveOwnerComponent: function (ownerModule, ownerName, ownerElementMontageId) {

        var ownerInstance,
            self = this;

        if (ownerModule && ownerName) {
            require.async(ownerModule).then(function (module) {
                ownerInstance = module[ownerName].create();
                self._installOwner(ownerInstance, ownerElementMontageId);

                // Configure componentController to assist ownerComponent
                self.componentController = ComponentController.create();
                self.componentController.owner = ownerInstance;
                self._deferredOwner.resolve(ownerInstance);
            });
        } else {
            ownerInstance = Component.create();
            this._installOwner(ownerInstance, ownerElementMontageId);

            // Configure componentController to assist ownerComponent
            this.componentController = ComponentController.create();
            this.componentController.owner = ownerInstance;
            this._deferredOwner.resolve(ownerInstance);
        }
    },

    _installOwner: function (owner, ownerElementMontageId) {
        var bodyRange,
            bodyContent,
            template = Template.create().initWithDocument(document, window.require),
            ownerElement = document.querySelector("[data-montage-id=" + ownerElementMontageId + "]");

        if (!ownerElement) {
            ownerElement = window.document.createElement('div');
            ownerElement.setAttribute("data-montage-id", ownerElementMontageId);
            owner.element = ownerElement;

            // Transplant existing content inside the owner's element we just created
            bodyRange = document.createRange();
            bodyRange.selectNodeContents(document.body);
            bodyContent = bodyRange.extractContents();
            ownerElement.appendChild(bodyContent);
            document.body.appendChild(ownerElement);
        }

        // the template is built-in
        owner.hasTemplate = false;
        // ask template to fill templateObjects
        owner.templateObjects = {};

        template.instantiateWithOwnerAndDocument(owner, window.document, function(owner) {
            if (owner) {
                owner.needsDraw = true;
            } else {
                rootComponent.needsDraw = true;
            }
        });
    },

    // Clears the frame of all content
    clear: function () {
        var childComponents = rootComponent.childComponents,
            childComponent,
            i;

        for (i = 0; (childComponent = childComponents[i]); i++) {
            childComponent.detachFromParentComponent();
            childComponent.cleanupDeletedComponentTree();
        }
        rootComponent.needsDraw = false;
        this._document.body.innerHTML = "";
    },

    // Modification Methods

    addComponent: function (componentModule, componentName, markup, properties, postProcess) {
        return this.componentController.addComponent(
                        componentModule,
                        componentName,
                        markup,
                        properties,
                        postProcess
                    );
    },

    addObject: function (objectModule, objectName, properties) {
        return this.componentController.addObject(objectModule, objectName, properties);
    },

    save: function () {
        if (!this.exporter) {
            this.exporter = Exporter.create();
        }

        return this.exporter.export(window);
    }
};

window.parent.postMessage("ready", "*");
