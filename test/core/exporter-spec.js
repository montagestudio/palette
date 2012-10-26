var Montage = require("montage").Montage,
    Exporter = require("core/exporter").Exporter;

var mockElement = function (tagName) {

    var element = document.createElement(tagName);

    // Montage element.controller is get-only
    Montage.defineProperties(element, {
        "_controller": {
            value: null
        },

        "controller": {
            get: function () {
                return this._controller;
            },
            set: function (value) {
                this._controller = value;
            }
        }
    });

    return element;
};

describe("core/exporter", function () {

    describe("cleaning up the DOM", function () {

        var root;

        beforeEach(function () {
            root = document.createElement("div");
        });

        describe("exporting a node with no component", function () {

            var nodeWithNoComponent;

            beforeEach(function () {
                nodeWithNoComponent = mockElement("div");
                nodeWithNoComponent.setAttribute("class", "foo");
            });

            it("must not alter the original node", function () {
                Exporter.exportNode(nodeWithNoComponent);
                expect(nodeWithNoComponent.attributes.length).toEqual(1);
                expect(nodeWithNoComponent.getAttribute("class")).toEqual("foo");
            });

            it("must not alter the cloned node", function () {
                var result = Exporter.exportNode(nodeWithNoComponent);
                expect(nodeWithNoComponent.attributes.length).toEqual(1);
                expect(nodeWithNoComponent.getAttribute("class")).toEqual("foo");
                expect(result.outerHTML).toEqual(nodeWithNoComponent.outerHTML);
            });

            describe("with child nodes that have no components", function () {

                var childNode;

                beforeEach(function () {
                    childNode = mockElement("span");
                    childNode.setAttribute("class", "bar");

                    nodeWithNoComponent.appendChild(childNode);
                });

                it("must not alter the original node", function () {
                    Exporter.exportNode(nodeWithNoComponent);
                    expect(nodeWithNoComponent.attributes.length).toEqual(1);
                    expect(nodeWithNoComponent.getAttribute("class")).toEqual("foo");
                });

                it("must not alter the cloned node", function () {
                    var result = Exporter.exportNode(nodeWithNoComponent);
                    expect(nodeWithNoComponent.attributes.length).toEqual(1);
                    expect(nodeWithNoComponent.getAttribute("class")).toEqual("foo");
                });

                it("must preserve child nodes", function () {
                    var result = Exporter.exportNode(nodeWithNoComponent);
                    expect(result.childNodes.length).toBe(1);
                });
            });

        });

        describe("exporting a component node", function () {

            var componentNode,
                mockController;

            beforeEach(function() {
                mockController = {};

                componentNode = mockElement("button");
                componentNode.setAttribute("data-montage-id", "button1");
                componentNode.setAttribute("class", "montage-button");
                componentNode.controller = mockController;
            });

            it("should strip all extraneous attributes", function () {
                var result = Exporter.exportNode(componentNode);

                expect(result.attributes.length).toEqual(1);
                expect(result.getAttribute("class")).toBeNull();
            });

            it("should preserve specific attributes", function () {
                var result = Exporter.exportNode(componentNode);
                expect(result.getAttribute("data-montage-id")).toEqual("button1");
            });

            it("must not alter the original node", function () {
                Exporter.exportNode(componentNode);
                expect(componentNode.attributes.length).toEqual(2);
                expect(componentNode.getAttribute("data-montage-id")).toEqual("button1");
                expect(componentNode.getAttribute("class")).toEqual("montage-button");
            });

            describe("with child nodes", function () {

                var childNode;

                beforeEach(function () {
                    childNode = mockElement("span");
                    childNode.setAttribute("class", "bar");

                    componentNode.appendChild(childNode);
                });

                it("must not alter the original node", function () {
                    Exporter.exportNode(componentNode);
                    expect(componentNode.attributes.length).toEqual(2);
                    expect(componentNode.getAttribute("data-montage-id")).toEqual("button1");
                    expect(componentNode.getAttribute("class")).toEqual("montage-button");
                });

            });

        });

    });
});
