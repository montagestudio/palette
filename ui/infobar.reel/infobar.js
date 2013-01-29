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

    open: {
        value: false
    },

    show: {
        value: function() {
            this.open = true;
            this.needsDraw = true;
        }
    },

    hide: {
        value: function() {
            this.open = false;
            this.needsDraw = true;
        }
    },

    handleCloseAction: {
        value: function(event) {
            this.hide();
        }
    },

    draw: {
        value: function() {
            this.element.classList[this.open ? "add" : "remove"]("Infobar--open");
        }
    }

});
