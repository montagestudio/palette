module.exports = require("montage-testing").run(require, [
    // Please keep in alphabetical order
    {name: "spec/core/document-spec", node: false},
    {name: "spec/core/editing-document-spec", node: false},
    {name: "spec/core/document-controller-spec", node: false},
    "spec/core/editing-proxy-spec",
    {name: "spec/core/template-formatter-spec", node: false},
    {name: "spec/ui/blueprint-inspector/blueprint-inspector-spec", node: false, karma: false},
    {name: "spec/ui/editing-frame-spec", node: false},
    {name: "spec/ui/property-editor/property-editor-spec", node: false, karma: false}
]);
