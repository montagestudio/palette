var URL = require("montage/core/mini-url");
var QS = require("qs");
var Promise = require("q");
var Deserializer = require("montage/core/deserializer").Deserializer;

if (window.location.search) {
    var query = QS.parse(window.location.search.slice(1));

    getPackageLocation(query["reel-location"]).then(function (packageLocation) {
        run(packageLocation, query['module-id']);
    });

} else {
    console.debug("No component specified for loading");
}

function getPackageLocation (location, deferredLocation) {

    if (!location || (window.location.protocol + "//") === location) {
        if (deferredLocation) {
            deferredLocation.reject();
            return;
        } else {
            return Promise.reject();
        }
    }

    if (!/\/$/.test(location)) {
        location = location += "/";
    }

    if (!deferredLocation) {
        deferredLocation = Promise.defer();
    }

    var packageReq = new XMLHttpRequest();
    packageReq.open("GET", location + "package.json");
    packageReq.addEventListener("load", function (evt) {
        if (404 === evt.target.status) {
            location = location.replace(/[^\/]+\/$/, "");
            getPackageLocation(location, deferredLocation);
        } else {
            deferredLocation.resolve(location);
        }
    });
    packageReq.send();


    return deferredLocation.promise;
}

function run (packageLocation, moduleId) {

    packageLocation = URL.resolve(window.location, packageLocation);
    moduleId = moduleId || "";


    //TODO this is relying on some private methods, they should be available somewhere
    Deserializer._findObjectNameRegExp.test(moduleId);
    var objectName = RegExp.$1.replace(Deserializer._toCamelCaseRegExp, Deserializer._replaceToCamelCase);

    console.log("Require:", "package:", JSON.stringify(packageLocation), "moduleId:", JSON.stringify(moduleId), "objectName", objectName);

    var ownerComponent;

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
        })
        .done();
}
