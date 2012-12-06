var Montage = require("montage").Montage,
    TestController = require("support/test-controller").TestController;

exports.Test = Montage.create(TestController, {

    editingFrame: {
        value: null
    }

});
