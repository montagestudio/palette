Deserializer = require("montage/core/deserializer").Deserializer;

var moduleId = window.shellData.moduleId;
var packageLocation = window.shellData.packageLocation;

//TODO this is relying on some private methods, they should be available somewhere
Deserializer._findObjectNameRegExp.test(moduleId);
var objectName = RegExp.$1.replace(Deserializer._toCamelCaseRegExp, Deserializer._replaceToCamelCase),
    ownerComponent;

console.log("Require:", "package:", JSON.stringify(packageLocation), "moduleId:", JSON.stringify(moduleId), "objectName", objectName);

require.loadPackage(packageLocation)
    .then(function (packageRequire) {
        return packageRequire.async(moduleId);
    })
    .then(function (exports) {
        console.log("Exports:", exports);
        console.log("Packages:", require.packages);

        ownerComponent = exports[objectName].create();
        return require.async("montage/ui/component");
    }).
    then(function (exports) {
        var rootComponent = exports.__root__;
        //TODO how do we know what kind of element to use?
        ownerComponent.element = document.createElement("div");
        ownerComponent.setElementWithParentComponent(ownerComponent.element, rootComponent);
        document.body.appendChild(ownerComponent.element);
        ownerComponent.ownerComponent = rootComponent;
        ownerComponent.attachToParentComponent(rootComponent);

        document.title = objectName + " (" + moduleId + ") - Palette Shell";

        ownerComponent.needsDraw = true;

        //TODO better communicate that the ownerComponent is available
        ownerComponent.addEventListener("firstDraw", function () {
            window.ownerComponent = ownerComponent;

            if (window.parent) {
                window.parent.postMessage("ready", "*");
            }
        });
    })
    .done();
