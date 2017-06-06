module.exports = require("montage-testing").run(require, [
    // Please keep in alphabetical order
    "spec/core/document-spec",
    "spec/core/editing-document-spec",
    "spec/core/document-controller-spec",
    "spec/core/editing-proxy-spec",
    "spec/core/template-formatter-spec",
    {name: "spec/ui/blueprint-inspector/blueprint-inspector-spec", node: false},
    {name: "spec/ui/editing-frame-spec", node: false},   // Some tests broken
    {name: "spec/ui/property-editor/property-editor-spec", node: false}
]);
