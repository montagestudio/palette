var Montage = require("montage").Montage,
    EditingController = require("core/controller/editing-controller").EditingController,
    UndoManager = require("montage/core/undo-manager").UndoManager,
    Template = require("montage/ui/template").Template,
    Promise = require("montage/core/promise").Promise,
    Deserializer = require("montage/core/deserializer").Deserializer,
    EditingProxy = require("core/editing-proxy").EditingProxy;

exports.EditingDocument = Montage.create(Montage, {

    _objectNameFromModuleId: {
        value: function (moduleId) {
            //TODO this utility should live somewhere else (/baz/foo-bar.reel to FooBar)
            Deserializer._findObjectNameRegExp.test(moduleId);
            return RegExp.$1.replace(Deserializer._toCamelCaseRegExp, Deserializer._replaceToCamelCase);
        }
    },

    _objectId: {value: 1},

    _generateObjectId: {
        value: function (name) {

            //TODO increment from latest id in serialization of the owner component per base name
            return name + this._objectId++;
        }
    },

    title: {
        dependencies: ["reelUrl"],
        get: function () {
            return this.reelUrl.substring(this.reelUrl.lastIndexOf("/") + 1);
        }
    },

    undoManager: {
        value: null
    },

    _editingController: {
        value: null
    },

    editingController: {
        get: function () {
            return this._editingController;
        }
    },

    _reelUrl: {
        value: null
    },

    _packageUrl: {
        value: null
    },

    reelUrl: {
        get: function () {
            return this._reelUrl;
        }
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
        value: function (reelUrl, packageUrl, editingFrame, owner, ownerTemplate) {

            this._reelUrl = reelUrl;
            this._packageUrl = packageUrl;
            this._ownerTemplate = ownerTemplate;

            //TODO merge editingController and editingDocument, all of these are
            var editController = this._editingController = EditingController.create();
            editController.frame = editingFrame;
            editController.owner = owner;

            this.undoManager = UndoManager.create();

            this._createProxiesFromSerialization(JSON.parse(ownerTemplate._ownerSerialization));

            return this;
        }
    },

    _createProxiesFromSerialization: {
        value: function (serialization) {

            var labels = Object.keys(serialization),
                proxyMap = this._editingProxyMap = Object.create(null);

            labels.forEach(function (label) {
                proxyMap[label] = EditingProxy.create().initWithLabelAndSerialization(label, serialization[label]);
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
            return this.editingController.template;
        }
    },

    // Editing Document APIs
    addComponent: {
        value: function (labelInOwner, serialization, markup, elementMontageId, identifier) {

            var self = this,
                objectName,
                proxy;

            if (!labelInOwner) {
                objectName = this._objectNameFromModuleId(serialization.prototype);
                labelInOwner = this._generateObjectId(objectName);
            }

            //Only set these if they were not explicitly falsy; assume that if they
            // were explicitly falsy the author is doing so on purpose
            if (typeof elementMontageId === "undefined") {
                elementMontageId = labelInOwner; //TODO format more appropriately for use in DOM?
            }

            if (typeof identifier === "undefined") {
                identifier = labelInOwner; //TODO lower case the identifier?
            }

            return this.editingController.addComponent(labelInOwner, serialization, markup, elementMontageId, identifier).then(function (result) {
                proxy = EditingProxy.create().initWithLabelAndSerialization(labelInOwner, result.serialization);
                proxy.stageObject = result.component;
                self._editingProxyMap[labelInOwner] = proxy;

                self.dispatchEventNamed("didAddComponent", true, true, {
                    component: proxy
                });

                return proxy;
            });
        }
    },

    setOwnedObjectProperty: {
        //TODO accept the object itself as well (we should accept either objects or their proxies)
        value: function (proxy, property, value) {
            //TODO add to undo manager

            proxy.setObjectProperty(property, value);

            this.dispatchEventNamed("didSetObjectProperty", true, true, {
                object: proxy,
                property: property,
                value: value
            });
        }
    },

    _editingProxyMap: {
        value: null
    },

    editingProxyMap: {
        get: function () {
            return this._editingProxies;
        }
    },

    editingProxies: {
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

            //TODO we should do this when the objects on the stage are deserialized in the first place
            // so we have the proxies populated ahead of time
            proxy.stageObject = object;

            return proxy;
        }
    }

});
