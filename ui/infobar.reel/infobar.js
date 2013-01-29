/**
    @module "ui/infobar.reel"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component;

/**
    Description TODO
    @class module:"ui/infobar.reel".Infobar
    @extends module:montage/ui/component.Component
*/
exports.Infobar = Montage.create(Component, /** @lends module:"ui/infobar.reel".Infobar# */ {

    content: {
        value: null
    }

});
