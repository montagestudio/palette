var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component;

exports.Abc = Component.specialize({
    value: {
        value: "fail"
    }
});
