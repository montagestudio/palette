Deserializer = require("montage/core/deserializer").Deserializer;
//HACK!!! is need so that we can drop the flow synchronously on the stage
require("montage/ui/dynamic-text.reel");
require("montage/ui/image.reel");

var moduleId = window.stageData.moduleId,
    packageLocation = window.stageData.packageLocation;

//TODO this is relying on some private methods, they should be available somewhere given their utility
Deserializer._findObjectNameRegExp.test(moduleId);
var objectName = RegExp.$1.replace(Deserializer._toCamelCaseRegExp, Deserializer._replaceToCamelCase),
    ownerComponent;

console.debug("Require:", "package:", JSON.stringify(packageLocation), "moduleId:", JSON.stringify(moduleId), "objectName", objectName);

// Load the specified package
require.loadPackage(packageLocation)
.then(function (packageRequire) {
    return packageRequire.async(moduleId);
})
.then(function (exports) {
    console.debug("Exports:", exports);
    console.debug("Packages:", require.packages);

    ownerComponent = exports[objectName].create();

    // Now with an instance of what will be our owner component,
    // we need a reference to the rootComponent
    //TODO would we rather do this ahead of time?
    return require.async("montage/ui/component");
})
.then(function (exports) {
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

        // Palette expects to be told when the stage is ready with a drawn component
        // that can be interacted with
        if (window.parent) {
            window.parent.postMessage("ready", "*");
        }
    });
})
.done();
