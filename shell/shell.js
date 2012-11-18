
window.addEventListener("message", function (event) {


    if (event.data.type === "montageReady") {

        if (window.location.search) {
            var reelMatch = window.location.search.match(/reel-location=(\S+)/);

            if (reelMatch && reelMatch[1]) {
                var reelLocation = decodeURIComponent(reelMatch[1]);

                getPackageLocation(reelLocation, function (packageLocation) {
                    var moduleId = reelLocation.replace(packageLocation, "");
                    run(packageLocation, moduleId);
                });
            }

        } else {
            console.debug("No component specified for loading");
        }
    }
}, true);

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

function run (packageLocation, moduleId) {

    //TODO formalize passing this information along
    window.shellData = {
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
