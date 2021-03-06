var Montage = require("montage").Montage;

exports.TargetObject = Montage.specialize({

    booleanProperty: {
        value: false
    },

    dateProperty: {
        value: "7/14/1789"
    },

    enumProperty: {
        value: null
    },

    mapProperty: {
        value: new Map()
    },

    numberProperty: {
        value: 42
    },

    objectProperty: {
        value: {}
    },

    stringProperty: {
        value: "default"
    },

    urlProperty: {
        value: "http://www.apple.com"
    },

    listProperty: {
        value: [ "one", "two", "three", "four"]
    },

    blueprintModuleId:require("montage")._blueprintModuleIdDescriptor,

    blueprint:require("montage")._blueprintDescriptor

});

