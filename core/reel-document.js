var Montage = require("montage").Montage,
    EditingDocument = require("core/editing-document").EditingDocument,
    EditingController = require("core/controller/editing-controller").EditingController,
    Template = require("montage/ui/template").Template,
    Promise = require("montage/core/promise").Promise,
    Deserializer = require("montage/core/deserializer").Deserializer,
    EditingProxy = require("core/editing-proxy").EditingProxy,
    SORTERS = require("core/sorters");

exports.ReelDocument = Montage.create(EditingDocument, {

    _objectNameFromModuleId: {
        value: function (moduleId) {
            //TODO this utility should live somewhere else (/baz/foo-bar.reel to FooBar)
            Deserializer._findObjectNameRegExp.test(moduleId);
            return RegExp.$1.replace(Deserializer._toCamelCaseRegExp, Deserializer._replaceToCamelCase);
        }
    },

    _generateLabel: {
        value: function (serialization) {
            var name = this._objectNameFromModuleId(serialization.prototype),
                label = name.substring(0, 1).toLowerCase() + name.substring(1),
                labelRegex = new RegExp("^" + label + "(\\d+)$", "i"),
                match,
                lastUsedIndex;

            lastUsedIndex = Object.keys(this.editingProxyMap).map(function (existingLabel) {
                match = existingLabel.match(labelRegex);
                return match && match[1] ? match[1] : null;
            }).reduce(function (lastFoundIndex, index) {
                if (null == index) {
                    return lastFoundIndex;
                } else {
                    index = parseInt(index, 10);

                    if (null == lastFoundIndex) {
                        return index;
                        //TODO should we fill in gaps? or find the highest used index?
                    } else if (index > lastFoundIndex) {
                        return index;
                    } else {
                        return lastFoundIndex;
                    }
                }
            });

            lastUsedIndex = lastUsedIndex || 0;

            return label + (lastUsedIndex + 1);
        }
    },

    title: {
        dependencies: ["fileUrl"],
        get: function () {
            return this.fileUrl.substring(this.fileUrl.lastIndexOf("/") + 1);
        }
    },

    _editingController: {
        value: null
    },

    editingController: {
        get: function () {
            return this._editingController;
        }
    },

    _packageUrl: {
        value: null
    },

    _ownerTemplate: {
        value: null
    },

    packageUrl: {
        get: function () {
            return this._packageUrl;
        }
    },

    init: {
        value: function (fileUrl, packageUrl, editingFrame, owner, ownerTemplate) {

            EditingDocument.init.call(this, fileUrl);

            this._packageUrl = packageUrl;
            this._ownerTemplate = ownerTemplate;
            this.selectedObjects = [];

            //TODO merge editingController and editingDocument, all of these are
            var editController = this._editingController = EditingController.create();
            editController.frame = editingFrame;
            editController.owner = owner;

            this._createProxiesFromSerialization(JSON.parse(ownerTemplate._ownerSerialization), owner);

            return this;
        }
    },

    _createProxiesFromSerialization: {
        value: function (serialization, owner) {

            var labels = Object.keys(serialization),
                proxyMap = this._editingProxyMap = {},
                stageObject;

            labels.forEach(function (label) {
                stageObject = owner.templateObjects[label];
                proxyMap[label] = EditingProxy.create().initWithLabelAndSerializationAndStageObject(label, serialization[label], stageObject);
            });
        }
    },

    ownerRequire: {
        get: function () {
            return this.editingController.ownerRequire;
        }
    },

    //TODO this is still somewhat mid-refactoring, probably could be cleaned up
    template: {
        get: function () {
            var template = this.editingController.template,
                components = {};

            Object.keys(this._editingProxyMap).sort(SORTERS.labelComparator).forEach(function (label) {
                components[label] = SORTERS.unitSorter(this._editingProxyMap[label].serialization);
            }, this);

            template._ownerSerialization = JSON.stringify(components, null, 4);

            return template;
        }
    },

    addObject: {
        value: function (labelInOwner, serialization) {
            var self = this,
                deferredUndo = Promise.defer(),
                proxy;

            if (!labelInOwner) {
                labelInOwner = this._generateLabel(serialization);
            }

            self.undoManager.register("Add Object", deferredUndo.promise);

            return this.editingController.addObject(labelInOwner, serialization).then(function (result) {
                proxy = EditingProxy.create().initWithLabelAndSerializationAndStageObject(labelInOwner, result.serialization, result.object);

                self.dispatchPropertyChange("editingProxyMap", function () {
                    self._editingProxyMap[labelInOwner] = proxy;
                });

                deferredUndo.resolve([self.removeObject, self, proxy, null]);

                self.dispatchEventNamed("didAddObject", true, true, {
                    object: proxy
                });

                if (self.selectObjectsOnAddition) {
                    self.clearSelectedObjects();
                    self.selectObject(proxy);
                }

                return proxy;
            });
        }
    },

    removeObject: {
        value: function (proxy) {

            var self = this,
                deferredUndo = Promise.defer();

            this.undoManager.register("Remove Object", deferredUndo.promise);

            return this.editingController.removeObject(proxy.stageObject).then(function (element) {

                deferredUndo.resolve([self.addObject, self, proxy.label, proxy.serialization]);

                self.dispatchPropertyChange("editingProxyMap", function () {
                    delete self.editingProxyMap[proxy.label];
                });

            });
        }
    },

    // Editing Document APIs
    addComponent: {
        value: function (labelInOwner, serialization, markup, elementMontageId, identifier) {
            var self = this,
                deferredUndo,
                proxy;

            if (!labelInOwner) {
                labelInOwner = this._generateLabel(serialization);
            }

            //Only set these if they were not explicitly falsy; assume that if they
            // were explicitly falsy the author is doing so on purpose
            if (typeof elementMontageId === "undefined") {
                elementMontageId = labelInOwner; //TODO format more appropriately for use in DOM?
            }

            if (typeof identifier === "undefined") {
                identifier = labelInOwner; //TODO lower case the identifier?
            }

            deferredUndo = Promise.defer();
            self.undoManager.register("Add Component", deferredUndo.promise);

            return this.editingController.addComponent(labelInOwner, serialization, markup, elementMontageId, identifier).then(function (result) {
                proxy = EditingProxy.create().initWithLabelAndSerializationAndStageObject(labelInOwner, result.serialization, result.component);
                self.dispatchPropertyChange("editingProxyMap", function () {
                    self._editingProxyMap[labelInOwner] = proxy;
                });

                //TODO guess we should have cloned the element we found and kept that around so we can restore it on undo
                deferredUndo.resolve([self.removeComponent, self, proxy, null]);

                self.dispatchEventNamed("didAddComponent", true, true, {
                    component: proxy
                });

                if (self.selectObjectsOnAddition) {
                    self.clearSelectedObjects();
                    self.selectObject(proxy);
                }

                return proxy;
            });
        }
    },

    removeComponent: {
        value: function (proxy, originalElement) {

            var self = this,
                deferredUndo = Promise.defer();

            this.undoManager.register("Remove Component", deferredUndo.promise);

            return this.editingController.removeComponent(proxy.stageObject, originalElement).then(function (element) {

                //TODO well, UM is certainly synchronous, it adds this, but since undoing ended before promise resolution,
                // its added to the undo stack, not the redo stack…
                deferredUndo.resolve([self.addComponent, self,
                    proxy.label, proxy.serialization, element.outerHTML,
                    element.getAttribute("data-montage-id"), proxy.getProperty("properties.identifier")]);

                self.dispatchPropertyChange("editingProxyMap", function () {
                    delete self.editingProxyMap[proxy.label];
                });
            });
        }
    },

    setOwnedObjectProperty: {
        //TODO accept the object itself as well (we should accept either objects or their proxies)
        value: function (proxy, property, value) {
            //TODO add to undo manager

            var undoManager = this.undoManager,
                undoneValue = proxy.getObjectProperty(property);

            undoManager.register("Set Property", Promise.resolve([this.setOwnedObjectProperty, this, proxy, property, undoneValue]));

            //TODO maybe the proxy shouldn't be involved in doing this as we hand out the proxies
            // throughout the editingEnfironment, I don't want to expose accessible editing APIs
            // that do not go through the editingDocument...or do I?

            // Might be nice to have an editing API that avoid undoability and event dispatching?
            proxy.setObjectProperty(property, value);

            this.dispatchEventNamed("didSetObjectProperty", true, true, {
                object: proxy,
                property: property,
                value: value,
                undone: undoManager.isUndoing,
                redone: undoManager.isRedoing
            });
        }
    },

    defineBinding: {
        value: function (sourceObject, sourceObjectPropertyPath, boundObject, boundObjectPropertyPath, oneWay, converter) {

            this.undoManager.register("Define Binding", Promise.resolve([this.deleteBinding, this, sourceObject, sourceObjectPropertyPath]));

            //Similar concerns above, where does this API belong?
            sourceObject.defineBinding(sourceObjectPropertyPath, boundObject, boundObjectPropertyPath, oneWay, converter);

            this.dispatchEventNamed("didDefineBinding", true, true, {
                sourceObject: sourceObject,
                sourceObjectPropertyPath: sourceObjectPropertyPath,
                boundObject: boundObject,
                boundObjectPropertyPath: boundObjectPropertyPath,
                oneWay: oneWay,
                converter: converter
            });

        }
    },

    deleteBinding: {
        value: function (sourceObject, sourceObjectPropertyPath) {
            var binding = sourceObject.bindings ? sourceObject.bindings[sourceObjectPropertyPath] : null,
                bindingString,
                converterEntry,
                boundObjectLabel,
                boundObject,
                boundObjectPropertyPath,
                oneWay,
                converter;

            if (!binding) {
                throw new Error("Cannot remove binding that does not exist");
            }

            //TODO what if we can't find an object with the label?
            //TODO rely on a deserializer from the package to help us decode this string
            oneWay = !!binding["<-"];
            bindingString = oneWay ? binding["<-"] : binding["<->"];
            bindingString.match(/^@([^\.]+)\.?(.*)$/);

            boundObjectLabel = RegExp.$1;
            boundObjectPropertyPath = RegExp.$2;

            //TODO what if boundObjectLabel and boundObjectPropertyPath are malformed?

            boundObject = this.editingProxyMap[boundObjectLabel];

            converterEntry = binding.converter;
            if (converterEntry) {
                converter = this.editingProxyMap[converterEntry["@"]];
            }

            this.undoManager.register("Delete Binding", Promise.resolve([this.defineBinding, this, sourceObject, sourceObjectPropertyPath, boundObject, boundObjectPropertyPath, oneWay, converter]));

            sourceObject.deleteBinding(sourceObjectPropertyPath);

            this.dispatchEventNamed("didDeleteBinding", true, true, {
                sourceObject: sourceObject,
                sourceObjectPropertyPath: sourceObjectPropertyPath,
                boundObject: boundObject,
                boundObjectPropertyPath: boundObjectPropertyPath
            });
        }
    },

    _editingProxyMap: {
        value: null
    },

    editingProxyMap: {
        get: function () {
            return this._editingProxyMap;
        }
    },

    editingProxies: {
        dependencies: ["editingProxyMap"],
        get: function () {
            //TODO cache this
            var proxyMap = this._editingProxyMap,
                labels = Object.keys(proxyMap);

            return labels.map(function (label) {
                return proxyMap[label];
            });
        }
    },

    editingProxyForObject: {
        value: function (object) {
            var label = Montage.getInfoForObject(object).label,
                proxy = this._editingProxyMap[label];

            if (!proxy) {
                throw new Error("No editing proxy found for object with label '" + label + "'");
            }

            return proxy;
        }
    },

    selectObjectsOnAddition: {
        value: true
    },

    selectedObjects: {
        value: null
    },

    // Selects nothing
    clearSelectedObjects: {
        value: function () {
            //TODO use clear() instead?
            this.selectedObjects = [];
        }
    },

    // Remove object from current set of selectedObjects
    deselectObject: {
        value: function (object) {
            this.selectedObjects.splice(0, this.selectedObjects.length, object);
        }
    },

    // Add object to current set of selectedObjects
    selectObject: {
        value: function (object) {
            var selectedObjects = this.selectedObjects;

            if (selectedObjects.indexOf(object) === -1) {
                //TODO what is the order ofthe selectedObjects?
                selectedObjects.push(object);
            }
            //TODO otherwise, do we remove it here?

        }
    }

});
