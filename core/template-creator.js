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
    @module montage/tools/template/template-creator
    @requires montage/ui/template
*/

exports = typeof exports !== "undefined" ? exports : {};

var Montage = require("montage/core/core").Montage,
    Template = require("montage/ui/template").Template,
    Serializer = require("montage/core/serialization").Serializer;

/**
    @class module:montage/tools/template/template-creator.TemplateCreator
    @extends module:montage/ui/template.Template
*/
var TemplateCreator = exports.TemplateCreator = Montage.create(Template, /** @lends module:montage/tools/template/template-creator.TemplateCreator# */ {
    initWithDocument: {
        value: function (doc, appRequire) {
            return this.initWithHeadAndBodyElements(doc.head, doc.body, appRequire, doc);
        }
    },

    initWithBodyElement: {
        value: function (body, appRequire) {
            return this.initWithHeadAndBodyElements(null, body, appRequire, body.ownerDocument);
        }
    },

    initWithHeadAndBodyElements: {
        value: function (head, body, appRequire, appDoc) {
            var serializer = this.serializer = Serializer.create().initWithRequire(appRequire),
                objects = {},
                components = {},
                componentsChildComponents = {},
                componentsElements = {},
                doc,
                self = this;

            //TODO not sure this is the best place to do this
            this._require = appRequire;

            // TODO this is definitely not the best place to do this
            serializer.delegate = this.delegate;

            this._componentNamesIndex = {};
            this._objectNamesIndex = {};
            doc = this._document = appDoc.implementation.createHTMLDocument("");

            var labelLookup = {};

            function copyNode(sourceNode, targetNode, isRootNode) {
                var childNodes = sourceNode.childNodes,
                    childNode,
                    targetChildNode,
                    label,
                    component = isRootNode ? null : sourceNode.component,
                    i;

                if (component) {

                    //TODO improve check for parent component
                    var isOwner = (component.element.parentNode === component.element.ownerDocument.body);

                    if (isOwner) {
                        label = "owner";
                    } else {
                        label = self._generateLabelForComponent(component, Object.keys(components));
                    }

                    labelLookup[component.uuid] = label;
                    componentsElements[label] = component._element;
                    component._element = targetNode;
                    components[label] = component;

                    if (isOwner) {
                        //TODO not duplicate code
                        for (i = 0; (childNode = childNodes[i]); i++) {
                            targetChildNode = targetNode.appendChild(childNode.cloneNode(false));
                            copyNode(childNode, targetChildNode);
                        }
                    } else {
                        componentsChildComponents[label] = component.childComponents;
                        delete component.childComponents;
                    }
                } else {
                    for (i = 0; (childNode = childNodes[i]); i++) {
                        targetChildNode = targetNode.appendChild(childNode.cloneNode(false));
                        copyNode(childNode, targetChildNode);
                    }
                }
            }

            if (head) {
                doc.head.innerHTML = head.innerHTML;
                // make sure the head doesn't have any serialization
                this._removeSerialization();
            }

            // try to make things look nice...
            var html = doc.documentElement;
            html.insertBefore(doc.createTextNode("\n"), doc.head);
            html.insertBefore(doc.createTextNode("\n"), doc.body);
            html.appendChild(doc.createTextNode("\n"));
            if (!head) {
                // the first child is the title
                doc.head.insertBefore(doc.createTextNode("\n    "), doc.head.firstChild);
            }

            copyNode(body, this._document.body, true);
            this._ownerSerialization = serializer.serialize(components);

            var externalElements = serializer.getExternalElements();
            // HACK: add to the template all the elements that are referenced
            // by components but are not present in the serialized document.
            // We only serialize the element itself and not the child
            // nodes, because for that we would also need to search for
            // components, let's only support components with a childless
            // nodes for now.
            var parentComponent;

            for (var i = 0, externalElement; externalElement = externalElements[i]; i++) {
                // We need to add the elements that are not in the Template
                if (!this._document.body.contains(externalElement)) {
                    // Try to find where the element fits if it's not even accessed in the original document (assume its a template)
                    if (!body.contains(externalElement)) {
                        externalElementComponent = externalElement.component;
                        while (externalElementComponent = externalElementComponent.parentComponent) {
                            var componentLabel = labelLookup[externalElementComponent.uuid];
                            if (componentLabel in components) {
                                components[componentLabel]._element.appendChild(externalElement.cloneNode(true));

                                break;
                            }
                        }
                    // just add it to the end of the document, assume it's something like a slot content, that doesn't matter where the element is in the document because it's going to be sucked in anyway.
                    } else {
                        this._document.body.appendChild(externalElement.cloneNode(false));
                    }
                } else {
                    //console.log("outside original document: " ,  externalElement, externalElement.uuid, externalElement.component);
                }
            }

            for (var label in components) {
                components[label].childComponents = componentsChildComponents[label];
                components[label]._element = componentsElements[label];
            }
            components = componentsChildComponents = null;
            this._externalObjects = serializer.getExternalObjects();

            return this;
        }
    },

    _componentNamesIndex: {
        value: null
    },

    _generateLabelForComponent: {value: function(component, labels) {
        var componentInfo = Montage.getInfoForObject(component),
            componentLabel = componentInfo.label || component.identifier,
            componentName,
            index;

        if (componentLabel) {
            return componentLabel;
        } else {
            componentName = componentInfo.objectName.toLowerCase();
            do {
                index = this._componentNamesIndex[componentName] || 1;
                this._componentNamesIndex[componentName] = index + 1;
            } while (labels.indexOf(componentName+index) >= 0);

            return componentName + index;
        }
    }},
});
