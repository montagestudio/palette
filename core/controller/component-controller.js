var Montage = require("montage").Montage,
    Promise = require("montage/core/promise").Promise;

// The actual object responsible for add, removing, and altering components that belong to the owner it controls.
// This controller will inform others of the intent and result of each operation it performs allowing consumers
// to react to changes for whatever reason.
exports.ComponentController = Montage.create(Montage, {

    _objectId: {value: 1},

    _generateObjectId: {
        value: function (name) {

            //TODO increment from latest id in serialization of the owner component
            return name + this._objectId++;
        }
    },

    frame: {
        value: null
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
            markup = markup.replace('data-montage-id=""', 'data-montage-id="' + id + '"');

            //TODO not create an element each time
            var shell = this.owner.element.ownerDocument.createElement('div'),
                result;

            shell.innerHTML = markup;
            result = shell.removeChild(shell.firstElementChild);

            return result;
        }
    },

    _deferredObjects: {
        value: {},
        distinct: true
    },

    installObject: {
        value: function (objectPath, objectName, onRequire) {

            var deferredObject = Promise.defer();
            this._deferredObjects[deferredObject.uuid] = deferredObject;

            this.ownerRequire.async(objectPath).then(function (fulfilled) {
                onRequire(fulfilled, deferredObject.uuid);
            }).done();

            return deferredObject.promise;
        }
    },

    addObject: {
        value: function (objectModule, objectName, properties) {

            var self = this;
            return this.installObject(objectModule, objectName, function (objectModule, deferredId) {

                var objectPrototype = objectModule[objectName],
                    objectInstance = objectPrototype.create();

                objectInstance.identifier = self._generateObjectId(objectName);

                // TODO set as a property on the owner?
                // how does this end up in the serialization if not exposed as property on owner?
                // self.owner;

                self._didAddObject(deferredId, objectInstance, properties);
            });
        }
    },

    addComponent: {
        value: function (componentPath, componentName, markup, properties, postProcess) {

            var self = this;

            return this.installObject(componentPath, componentName, function (componentModule, deferredId) {
                var component = componentModule[componentName],
                    componentInstance = component.create(),
                    id = self._generateObjectId(componentName);

                componentInstance.identifier = id;
                componentInstance.addEventListener("firstDraw", self, false);

                componentInstance.element = self._createElementFromMarkup(markup, id);
                componentInstance.setElementWithParentComponent(self._createElementFromMarkup(markup, id), self.owner);
                //decide where to put this...
                if (self.frame.selectedObjects != null && self.frame.selectedObjects.length > 0) {
                    var selectedComponent = self.frame.selectedObjects[0];
                    console.log("selectedComponent", selectedComponent)
                    if (selectedComponent._montage_metadata.module === "montage/ui/slot.reel") {
                        selectedComponent.content = componentInstance.element;
                    } else {
                        selectedComponent.element.appendChild(componentInstance.element);
                    }
                } else {
                    self.owner.element.appendChild(componentInstance.element);
                }


                componentInstance.needsDraw = true;


                //TODO do we need to do this manually?
                componentInstance.ownerComponent = self.owner;

                // NOTE not having this ended up not putting this component in the component tree
                // TODO be able to specify parentage...
                componentInstance.attachToParentComponent(self.owner);

                if (typeof postProcess === "function") {
                    postProcess.call(componentInstance, componentInstance.element, self.ownerRequire);
                }

                self._didAddObject(deferredId, componentInstance, properties);
            });
        }
    },

    _didAddObject: {
        value: function (deferredId, object, properties) {

            if (properties) {
                var propertyKeys = Object.keys(properties),
                    i,
                    iPropertyKey;

                for (i = 0; (iPropertyKey = propertyKeys[i]); i++) {
                    object.setProperty(iPropertyKey, properties[iPropertyKey]);
                }
            }

            this._deferredObjects[deferredId].resolve(object);
        }
    },

    handleFirstDraw: {
        value: function (evt) {
            evt.target.removeEventListener("firstDraw", this, false);
            console.log("added component drawn", evt.target);
        }
    },

    setComponentProperty: {
        value: function (component, property, value) {
            //ensure component is child of controlledComponent
            // is this as simple as: component.setProperty(property, value);
            // what about setting the X coordinate of a component, that should be within the controlledComponent's CSS
        }
    }

});
