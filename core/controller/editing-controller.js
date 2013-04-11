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

    /**
     * Adds the
     */
    addObjectsFromTemplate: {
        value: function (sourceTemplate, stageElement) {

            var sourceContentRange,
                sourceContentFragment,
                sourceDocument = sourceTemplate.document,
                deserializer = Deserializer.create(),
                sourceSerializationString = sourceTemplate.getSerialization().getSerializationString(),
                self = this;

            stageElement = stageElement || this.owner.element,

            // Insert the expected markup into the document
            sourceContentRange = sourceDocument.createRange();
            sourceContentRange.selectNodeContents(sourceDocument.body);
            sourceContentFragment = sourceContentRange.cloneContents();
            stageElement.appendChild(sourceContentFragment);

            deserializer.init(sourceSerializationString, this.ownerRequire);
            return deserializer.deserialize(null, stageElement).then(function (objects) {
                var label,
                    object;

                for (label in objects) {
                    if (typeof objects.hasOwnProperty !== "function" || objects.hasOwnProperty(label)) {
                        object = objects[label];

                        var documentPart = self.owner._templateDocumentPart;

                        // Simulate loading a component from a template
                        if (object) {
                            if (typeof object._deserializedFromTemplate === "function") {
                                object._deserializedFromTemplate(self.owner, label, documentPart);
                            }
                            if (typeof object.deserializedFromTemplate === "function") {
                                object.deserializedFromTemplate(self.owner, label, documentPart);
                            }
                            if (typeof object.needsDraw !== "undefined") {
                                object.needsDraw = true;
                            }
                        }
                    }
                }
                return objects;
            });
        }
    },

    removeObject: {
        value: function (object) {

            var element = object.element;

            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }

            //TODO well I'm sure there's more to this...
            return Promise.resolve(element);
        }
    }

});
