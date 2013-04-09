var Montage = require("montage").Montage

var TargetObject = exports.TargetObject = Montage.create(Montage, {

    booleanProperty: {
        value: false
    },

    dateProperty: {
        value: "7/14/1789"
    },

    enumProperty: {
        value: "blue"
    },

    numberProperty: {
        value: 42
    },

    objectProperty: {
        value: new Object()
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
