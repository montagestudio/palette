// Set of components available for use in the authoring system
// TODO replace with dynamic browsing of available modules informed by ComponentDescriptions
exports.components = [
    {
        label: "Button", name: "Button",
        x: 0, y: -76, left: 11,
        serialization: {
            "prototype": "montage/ui/button.reel",
            "properties": {
                "label": "Button",
                "enabled": true
            }
        },
        icon: null,
        html: '<button data-montage-id=""></button>'
    },
    {
        label: "Range", name: "InputRange",
        x: -45, y: -76, width: 43, left: 13,
        serialization: {
            "prototype": "montage/ui/input-range.reel",
            "properties": {
                "minValue": 0,
                "maxValue": 100,
                "value": 50
            }
        },
        icon: null,
        html: '<input type="range" data-montage-id="">'
    },
    {
        label: "Toggle", name: "ToggleButton",
        x: 0, y: -99, left: 12,
        serialization: {
            "prototype": "montage/ui/toggle-button.reel",
            "properties": {
                "value": true,
                "pressedLabel": "On",
                "unpressedLabel": "Off"
            }
        },
        icon: null,
        html: '<button data-montage-id=""></button>'
    },
    {
        label: "Checkbox", name: "InputCheckbox",
        x: -89, y: -76, left: 22, width: 24,
        serialization: {
            "prototype": "montage/ui/input-checkbox.reel",
            "properties": {
                "checked": true
            }
        },
        icon: null,
        html: '<input type="checkbox" data-montage-id="">'
    },
    {
        label: "InputText", name: "InputText",
        x: -71, y: -101, left: 19,
        serialization: {
            "prototype": "montage/ui/input-text.reel",
            "properties": {
                "value": "Editable text"
            }
        },
        icon: null,
        html: '<input data-montage-id="" type="text">'
    },
    {
        label: "DynamicText", name: "DynamicText",
        x: 0, y: -122, left: 20, width: 28,
        serialization: {
            "prototype": "montage/ui/dynamic-text.reel",
            "properties": {
                "value": "Text"
            }
        },
        icon: null,
        html: '<p data-montage-id=""></p>'
    },
    {
        label: "Image", name: "Image",
        x: 0, y: 0, left: 0, width: 0,
        serialization: {
            "prototype": "montage/ui/image.reel",
            "properties": {
                "src": "http://client/node_modules/palette/assets/image/placeholder.png"
            }
        },
        icon: null,
        html: '<img data-montage-id="">'
    },
    {
        label: "Repetition", name: "Repetition",
        x: -29, y: -125, left: 19, width: 30,
        serialization: {
            "prototype": "montage/ui/repetition.reel",
            "properties": {
                "objects": [1, 2, 3]
            }
        },
        icon: null,
        html: '<ul data-montage-id=""><li>Item</li></ul>'
    },
    {
        label: "Flow", name: "Flow",
        x: -29, y: -125, left: 19, width: 30,
        serialization: {
            "prototype": "montage/ui/flow.reel",
            "properties": {
                "objects": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
                "paths": [
                    {
                        "knots": [
                            {
                                "knotPosition": [-1200, 0, 0],
                                "nextHandlerPosition": [-400, 0, 0],
                                "previousDensity": 12,
                                "nextDensity": 12
                            },
                            {
                                "knotPosition": [1200, 0, 0],
                                "previousHandlerPosition": [400, 0, 0],
                                "previousDensity": 12,
                                "nextDensity": 12
                            }
                        ],
                        "headOffset":0,
                        "tailOffset": 0,
                        "units": {}
                    }
                ]
            }
        },
        icon: null,
        html: '<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0"></div>',
        postProcess: function (element, iRequire) {
            var innerElement = element.appendChild(element.ownerDocument.createElement("div"));

                var dynamicText = iRequire("montage/ui/component").Component.create();
                iRequire("montage/ui/component").Component.__proto__.defineProperty(dynamicText, "hasTemplate", {
                    value: false,
                    serializable: true
                });
                dynamicText.element = innerElement;
                dynamicText.attachToParentComponent();
                dynamicText.value = "foo";
                dynamicText.needsDraw = true;
                this._orphanedChildren = [dynamicText];
                innerElement.setAttribute("data-montage-id", "foo");
                innerElement.style.width = "160px";
                innerElement.style.height = "160px";
                innerElement.style.background = "white";
                innerElement.style.boxShadow = "0 0 10px rgba(0, 0, 0, .4)";
                innerElement.style.margin = "-80px 0 0 -80px";
                innerElement.style.borderRadius = "12px";
        }
    }
];

