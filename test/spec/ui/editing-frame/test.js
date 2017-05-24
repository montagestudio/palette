var Montage = require("montage").Montage,
    TestController = require("montage-testing/test-controller").TestController;

exports.Test = TestController.specialize({

    editingFrame: {
        value: null
    }

});
