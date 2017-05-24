require("montage-testing").run(require, [
    // Please keep in alphabetical order
    "spec/blueprint-inspector/blueprint-inspector-spec",
    "spec/core/document-spec",
    "spec/core/editing-document-spec",
    "spec/core/document-controller-spec",
    "spec/core/editing-proxy-spec",
    "spec/core/template-formatter-spec",
    "spec/ui/editing-frame-spec"   // Some tests broken
]);
