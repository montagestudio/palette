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

    // TODO allow adding multiple component/objects at the same time

    _deferredObject: {
        value: null
    },

    installObject: {
        value: function (objectPath, objectName, onRequire) {

            // TODO support adding multiple components at once
            if (this._deferredObject) {
                this._deferredObject.reject();
            }

            this._deferredObject = Promise.defer();

            require.async(objectPath).then(onRequire).end();

            return this._deferredObject.promise;
        }
    },

    addObject: {
        value: function (objectModule, objectName) {

            var self = this;
            return this.installObject(objectModule, objectName, function (objectModule) {

                var objectPrototype = objectModule[objectName],
                    objectInstance = objectPrototype.create();

                objectInstance.identifier = self._generateObjectId(objectName);

                // TODO set as a property on the owner?
                // how does this end up in the serialization if not exposed as property on owner?
                // self.owner;

                self._didAddObject(objectInstance);
            });
        }
    },

    // TODO accept default properties to configure the component
    addComponent: {
        value: function (componentPath, componentName, markup) {

            var self = this;

            return this.installObject(componentPath, componentName, function (componentModule) {
                var component = componentModule[componentName],
                    componentInstance = component.create(),
                    id = self._generateObjectId(componentName);

                componentInstance.identifier = id;
                componentInstance.addEventListener("firstDraw", self, false);

                componentInstance.element = self._createElementFromMarkup(markup, id);
                componentInstance.setElementWithParentComponent(self._createElementFromMarkup(markup, id), self.owner);
                self.owner.element.appendChild(componentInstance.element);
                componentInstance.needsDraw = true;


                //TODO do we need to do this manually?
                componentInstance.ownerComponent = self.owner;

                // NOTE not having this ended up not putting this component in the component tree
                // TODO be able to specify parentage...
                componentInstance.attachToParentComponent(self.owner);

                self._didAddObject(componentInstance);
            });
        }
    },

    _didAddObject: {
        value: function (object) {
            this._deferredObject.resolve(object);
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
