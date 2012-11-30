window.addEventListener("message", function (event) {

    var reelMatch,
        reelLocation;

    // Recognize when bootstrapping montage has come along far enough
    // along to wait for any instructions it was told to expect when we
    // provided the remote-trigger attribute to the bootstrapping script
    if (event.data.type === "montageReady") {

        if (window.location.search) {
            //TODO improve this regex...a lot
            reelMatch = window.location.search.match(/reel-location=(\S+)/);

            if (reelMatch && reelMatch[1]) {
                reelLocation = decodeURIComponent(reelMatch[1]);
                loadReel(reelLocation);
            }

        } else {
            reelLocation = prompt("Load component URL", window.location.origin);
            if (reelLocation) {
                loadReel(reelLocation);
            }
        }
    }
}, true);

function loadReel (reelLocation) {
    getPackageLocation(reelLocation, function (packageLocation) {
        var moduleId = reelLocation.replace(packageLocation, "");
        injectPackageInformation(packageLocation, moduleId);
    });
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
        packageLocation: packageLocation,
        moduleId: moduleId
    };

    //TODO not hardcode this all
    window.postMessage({
        type: "montageInit",
        location: "",
        packageDescription: {
            "dependencies": {
                "montage": "*"
            },
            mappings: {
                client: packageLocation
            }
        }
    }, "*");
}
