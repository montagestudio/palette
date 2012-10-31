var Montage = require("montage").Montage,
    Promise = require("montage/core/promise").Promise;

// The actual object responsible for add, removing, and altering components that belong to the owner it controls.
// This controller will inform others of the intent and result of each operation it performs allowing consumers
// to react to changes for whatever reason.
exports.ComponentController = Montage.create(Montage, {

    _componentId: {value: 1},

    _generateComponentId: {
        value: function (name) {

            //TODO increment from latest id in serialization of the owner component
            return name + this._componentId++;
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

    _deferredComponent: {
        value: null
    },

    addComponent: {
        value: function (componentPath, componentName, markup) {

            // TODO support adding multiple components at once
            if (this._deferredComponent) {
                this._deferredComponent.reject();
            }

            this._deferredComponent = Promise.defer();

            // TODO accept default properties to configure the component

            var self = this,
                componentModule;

            componentModule = require.async(componentPath)
                .then(function (componentModule) {
                    var component = componentModule[componentName],
                        componentInstance = component.create(),
                        id = self._generateComponentId(componentName);

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

                    self._didAddComponent(componentInstance);
                })
                .end();

            return this._deferredComponent.promise;
        }
    },

    _didAddComponent: {
        value: function (component) {
            this._deferredComponent.resolve(component);
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
