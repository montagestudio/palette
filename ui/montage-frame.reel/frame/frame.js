var Template = require("montage/ui/template").Template,
    Component = require("montage/ui/component").Component,
    Promise = require("montage/core/promise").Promise,
    rootComponent = require("montage/ui/component").__root__,
    ComponentController = require("core/controller/component-controller").ComponentController,
    Exporter = require("core/exporter").Exporter;

window.Frame = {

    // Prepares the document for use by creating a owner component
    initWithOwner: function (ownerModule, ownerName) {

        // TODO what if the document already has an owner component?
        // TODO re-introduce specific OwnerComponent

        var ownerInstance = Component.create();
        this.instantiateWithOwner(ownerInstance);

        // Configure componentController to assist ownerComponent
        this.componentController = ComponentController.create();
        this.componentController.owner = ownerInstance;
    },

    instantiateWithOwner: function (owner) {
        var template = Template.create().initWithDocument(window.document, window.require),
            ownerElement;

        ownerElement = window.document.createElement('div');
        //TODO where should the montage-id come from?
        ownerElement.setAttribute("data-montage-id", "owner");
        owner.element = ownerElement;
        document.body.appendChild(ownerElement);


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
    reset: function () {
        var childComponents = rootComponent.childComponents,
            childComponent,
            i;

        for (i = 0; (childComponent = childComponents[i]); i++) {
            childComponent.detachFromParentComponent();
            childComponent.cleanupDeletedComponentTree();
        }
        rootComponent.needsDraw = false;
    },

    addComponent: function (componentModule, componentName, markup) {
        this.componentController.addComponent(componentModule, componentName, markup);
    },

    export: function () {
        if (!this.exporter) {
            this.exporter = Exporter.create();
        }

        return this.exporter.export(window);
    }
};

window.parent.postMessage("ready", "*");
