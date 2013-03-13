//TODO not create so many globals
var REEL_LOCATION_KEY = "reel-location",
    PACKAGE_LOCATION_KEY = "package-location",
    REMOTE_TRIGGER_KEY = "data-remote-trigger",
    DATA_MODULE_KEY = "data-module";

window.addEventListener("message", function (event) {

    // Recognize when bootstrapping montage has come along far enough
    // along to wait for any instructions it was told to expect when we
    // provided the remote-trigger attribute to the bootstrapping script
    if (event.data.type === "montageReady") {

        loadReel(loadParams[REEL_LOCATION_KEY], loadParams[PACKAGE_LOCATION_KEY]);

    }
}, true);

function getParams() {

    var search,
        userInput,
        keyValues,
        keyValuesCount,
        value,
        params,
        reelLocation,
        packageLocation;

    search = window.location.search;

    if (search) {

        search = search.replace(/^\?/, "");
        search = search.replace(/=/g, "&");
        keyValues = search.split("&");
        keyValuesCount = keyValues.length;

        params = {};
        for (i = 0; i < keyValuesCount; i += 2) {
            value = keyValues[i + 1];
            params[keyValues[i]] = value ? decodeURIComponent(value) : null;
        }

        reelLocation = params[REEL_LOCATION_KEY];
        packageLocation = params[PACKAGE_LOCATION_KEY];
    } else {
        userInput = requestParams();
        reelLocation = userInput[REEL_LOCATION_KEY];
        packageLocation = userInput[PACKAGE_LOCATION_KEY];
    }

    if (reelLocation) {

        if (packageLocation) {
            packageLocation = packageLocation.replace("package.json", "");
        }

    }

    params = {};
    params[REEL_LOCATION_KEY] = reelLocation;
    params[PACKAGE_LOCATION_KEY] = packageLocation;
    params[REMOTE_TRIGGER_KEY] = window.location.origin;
    params[DATA_MODULE_KEY] = "__stage/stage-app";
    return params;
}

function requestParams () {
    var params = {},
        reelLocation,
        packageLocation;

        params[REEL_LOCATION_KEY] = reelLocation = prompt("Load component", window.location.origin);

        if (reelLocation) {
            params[PACKAGE_LOCATION_KEY] = prompt("Load package (Blank to search)");
        }

        return params;
}

function loadReel (reelLocation, packageLocation) {

    if (packageLocation) {
        continueBootstrap(packageLocation);
    } else {
        getPackageLocation(reelLocation, continueBootstrap);
    }

    function continueBootstrap (packageLocation) {
        var moduleId = reelLocation.replace(packageLocation, "");
        injectPackageInformation(packageLocation, moduleId);
    }
}

// Crawl up the directory tree from the specified location until a
// package.json is discovered
// NOTE this triggers a 404 for each directory we try to find a
// package.json in
// TODO maybe issue several at a time, accepting the closest package.json, or do we want to minimize 404s?
function getPackageLocation (location, callback) {

    if (!location || (window.location.protocol + "//") === location) {
       return;
    }

    if (!/\/$/.test(location)) {
        location = location += "/";
    }

    var packageReq = new XMLHttpRequest();
    packageReq.open("GET", location + "package.json");
    packageReq.addEventListener("load", function (evt) {
        if (404 === evt.target.status) {
            location = location.replace(/[^\/]+\/$/, "");
            getPackageLocation(location, callback);
        } else {
            callback(location);
        }
    });
    packageReq.send();
}

// Inject the specified packageInformation into the montage
// bootstrapping sequence, letting bootstrapping resume
function injectPackageInformation (packageLocation, moduleId) {

    //TODO formalize passing this information along
    window.stageData = {
        packageUrl: packageLocation,
        moduleId: moduleId
    };

    //TODO not hardcode this all
    window.postMessage({
        type: "montageInit",
        location: packageLocation + "/package.json"
    }, "*");
}

function injectMontageBootstrap(old) {
    var montageLocation = loadParams[PACKAGE_LOCATION_KEY] + "/node_modules/montage/montage.js";
    var headID = document.getElementsByTagName("head")[0];
    var newScript = document.createElement('script');
    newScript.setAttribute("type", "application/javascript");
    if (old) {
        // This loads the copy of Montage in the stage
        newScript.setAttribute("src", "bootstrap.js");
        newScript.setAttribute(PACKAGE_LOCATION_KEY, "node_modules/montage/");
        newScript.setAttribute(REMOTE_TRIGGER_KEY, loadParams[REMOTE_TRIGGER_KEY]);
        newScript.setAttribute(DATA_MODULE_KEY, loadParams[DATA_MODULE_KEY]);
    } else {
        // This loads the copy of Montage in the target package
        newScript.setAttribute("src", montageLocation);
        newScript.setAttribute(PACKAGE_LOCATION_KEY, loadParams[PACKAGE_LOCATION_KEY]);
        newScript.setAttribute(REMOTE_TRIGGER_KEY, loadParams[REMOTE_TRIGGER_KEY]);
        newScript.setAttribute(DATA_MODULE_KEY, loadParams[DATA_MODULE_KEY]);
    }
    headID.appendChild(newScript);
}

var loadParams = getParams();
injectMontageBootstrap();
