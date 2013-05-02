var Montage = require("montage").Montage;
var ProxyVisitor = require("./proxy-visitor").ProxyVisitor;
var Malker = require("mousse/serialization/malker").Malker;
var MontageSerializer = require("montage/core/serialization/serializer/montage-serializer").MontageSerializer;

exports.ProxySerializer = Montage.create(MontageSerializer, {

    initWithRequire: {
        value: function (_require) {
            //TODO use the MontageSerializer from the specified require
            var self = MontageSerializer.initWithRequire.call(this, _require);

            self._visitor = this.newVisitor.initWithBuilderAndLabelerAndRequireAndUnits(
                self._builder,
                self._labeler,
                self._require,
                self._units);

            self._malker = new Malker(self._visitor);

            return self;
        }
    },

    /*
     * Return a newly created visitor for the proxies
     * <b>Note:</b> This need to be overwritten to make something useful
     */
    newVisitor: {
        get: function () {
            return ProxyVisitor.create();
        }
    }

});
