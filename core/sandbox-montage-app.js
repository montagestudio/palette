/*global module */
var Promise = require("montage/core/promise").Promise;

module.exports = sandboxMontageApp;
function sandboxMontageApp(applicationLocation, frameWindow) {
    var dispose;


    return new Promise(function(resolve, reject) {
        // Ensure trailing slash
        applicationLocation = applicationLocation.replace(/([^\/])$/, "$1/");
        if (!frameWindow) {
            var iframe = document.createElement("iframe");
            iframe.onload = bootSandbox;
            iframe.setAttribute("id", "montage-sandbox");
            iframe.src = require.location + "core/sandbox-montage.html";
            iframe.style.display = "none";
            document.body.appendChild(iframe);

            dispose = function () {
                document.body.removeChild(iframe);
            };
        } else {
            if (frameWindow.document.readyState == "complete") {
                bootSandbox();
            } else {
                frameWindow.onload = bootSandbox;
            }
            dispose = Function.noop;
        }

        function bootSandbox() {
            if (!frameWindow) {
                frameWindow = iframe.contentWindow;
            }

            var frameDocument = frameWindow.document;

            frameWindow.addEventListener("message", function (event) {
                if (event.data.type === "montageReady") {
                    frameWindow.postMessage({
                        type: "montageInit",
                        location: applicationLocation
                    }, "*");
                }
            }, true);

            var montageLocation = applicationLocation + "node_modules/montage/montage.js";

            frameWindow.onerror = function (error, file, line) {
                console.error("error", error, file, line);
                if (file === montageLocation) {
                    reject(new Error(error));
                    delete frameWindow.onerror;
                }
            };

            frameWindow.montageDidLoad = function () {
                // don't capture errors any more
                delete frameWindow.onerror;
                frameWindow.mr.dispose = dispose;
                resolve([frameWindow.mr, frameWindow.montageRequire]);
            };

            // Need all XHRs to have withCredentials.
            var XHR = frameWindow.XMLHttpRequest;
            frameWindow.XMLHttpRequest = function () {
                var xhr = new XHR();
                xhr.withCredentials = true;
                return xhr;
            };

            var script = document.createElement("script");
            script.src = montageLocation;
            script.dataset.remoteTrigger = window.location.origin;
            // Bootstrapper removes the script tag when done, so no need
            // to do it here on load
            frameDocument.head.appendChild(script);
        }
    }).timeout(60000, "Montage from " + applicationLocation + " timed out while booting");

}
