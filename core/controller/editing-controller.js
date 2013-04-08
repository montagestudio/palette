var Montage = require("montage").Montage,
    Promise = require("montage/core/promise").Promise,
    Exporter = require("core/exporter").Exporter,
    Deserializer = require("montage/core/serialization").Deserializer,
    Component = require("montage/ui/component").Component; //TODO this is only for debugging

// The actual object responsible for add, removing, and altering components that belong to the owner it controls.
// This controller will inform others of the intent and result of each operation it performs allowing consumers
// to react to changes for whatever reason.
exports.EditingController = Montage.create(Montage, {

    frame: {
        value: null
    },

    template: {
        get: function () {
            var iframeWindow = this.frame.window,
                exporter,
                template;

            if (iframeWindow) {
                exporter = Exporter.create();
                template = exporter.export(iframeWindow, this.owner, this.ownerRequire);
            }

            return template;
        }
    },

    //TODO cache this
    ownerRequire: {
        get: function() {
            return this.owner.element.ownerDocument.defaultView.require;
        }
    },

    //TODO what to do if owner changes in the middle of adding a childComponent?
    //TODO should the owner be able to be changed?
    owner: {
        value: null
    },

    _createElementFromMarkup: {
        value: function (markup, id) {
            //TODO not create an element each time
            var incubator = this.owner.element.ownerDocument.createElement('div'),
                result;

            incubator.innerHTML = markup;
            result = incubator.removeChild(incubator.firstElementChild);
            result.setAttribute("data-montage-id", id);

            return result;
        }
    },

    //TODO clean up object vs component APIs

    addObject: {
        value: function (labelInOwner, serialization) {

            if (!labelInOwner) {
                throw new Error("Cannot add an object without a label for the owner's serialization");
            }

            var deserializer = Deserializer.create(),
                self = this,
                serializationWithinOwner = {},
                newObject;

            serialization = Object.clone(serialization);

            serializationWithinOwner[labelInOwner] = serialization;

            deserializer.init(JSON.stringify(serializationWithinOwner), this.ownerRequire);
            return deserializer.deserialize(null, this.owner.element).then(function (objects) {
                newObject = objects[labelInOwner];
                return newObject;
            });
        }
    },

    addComponent: {
        value: function (labelInOwner, serialization, markup, elementMontageId, identifier, parentProxy, parentElement) {

            if (!labelInOwner) {
                throw new Error("Cannot add a component without a label for the owner's serialization");
            }

            var element,
                deserializer = Deserializer.create(),
                self = this,
                serializationWithinOwner = {},
                ownerDocument = this.owner.element.ownerDocument;

            serialization = Object.clone(serialization);

            if (!serialization.properties && (identifier || elementMontageId)) {
                serialization.properties = {};
            }

            if (identifier) {
                serialization.properties.identifier = identifier;
            }

            if (elementMontageId) {
                serialization.properties.element = {"#": elementMontageId};

                element = ownerDocument.querySelector("[data-montage-id=" + elementMontageId + "]");

                if (!element) {
                    element = this._createElementFromMarkup(markup, elementMontageId);
                    if (parentElement) {
                        parentElement.appendChild(element);
                    } else if (parentProxy && parentProxy.stageObject && parentProxy.stageObject.element) {
                        parentProxy.stageObject.element.appendChild(element);
                    } else {
                        this.owner.element.appendChild(element);
                    }
                }
            }

            serializationWithinOwner[labelInOwner] = serialization;

            deserializer.init(JSON.stringify(serializationWithinOwner), this.ownerRequire);
            return deserializer.deserialize(null, element.parentElement).then(function (objects) {
                var newComponent = objects[identifier];
                newComponent.ownerComponent = self.owner;
                newComponent.needsDraw = true;
                return newComponent;
            });
        }
    },

    removeComponent: {
        value: function (component, originalElement) {

            var element = component.element;

            //TODO if we had an original element, put it back
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }

            //TODO well I'm sure there's more to this...
            return Promise.resolve(element);
        }
    },

    setComponentProperty: {
        value: function (component, property, value) {
            //ensure component is child of controlledComponent
            // is this as simple as: component.setPath(property, value);
            // what about setting the X coordinate of a component, that should be within the controlledComponent's CSS
        }
    }

});
