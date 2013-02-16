var Montage = require("montage").Montage;

/**
 @class module:palette/coreediting-proxy.EditingProxy
 This the abstract class far all editor proxies.
 */
exports.EditingProxy = Montage.create(Montage, /** @lends module:palette/coreediting-proxy.EditingProxy# */  {


    //TODO have specialized proxies for different types of actual objects componentProxy, ElementProxy, etc
    init:{
        //TODO should we just treat the proxies as the editing interface, instead of the editingDocument?
        value:function (label, editingDocument) {
            this.label = label;
            this._editingDocument = editingDocument;

            return this;
        }
    },

    label:{
        value:null
    },

    _editingDocument:{
        value:null
    },

    editingDocument:{
        get:function () {
            return this._editingDocument;
        }
    },

    //TODO when setting an object, apply edits that happened while we didn't have a stageObject
    stageObject:{
        value:null
    },

    packageRequire:{
        get:function () {
            return this.editingDocument.packageRequire;
        }
    },

    _exportId:{
        value:null
    },

    exportId:{
        get:function () {
            if (!this._exportId) {
                this._moduleId = this.moduleId;
            }
            return this._exportId;
        }
    },

    _moduleId:{
        value:null
    },

    moduleId:{
        get:function () {
            if (!this._moduleId && this.editingDocument.fileUrl && this.editingDocument.packageRequire) {
                this._moduleId = this.editingDocument.fileUrl.substring(this.editingDocument.packageRequire.location.length);
            }
            return this._moduleId;
        }
    },

    _exportName:{
        value:null
    },

    exportName:{
        get:function () {
            if (!this._exportName && this.stageObject) {
                this._exportName = Montage.getInfoForObject(this.stageObject).objectName;
            }
            return this._exportName;
        }
    },

    properties:{
        get:function () {
            return {};
        }
    },

    setObjectProperty:{
        value:function (property, value) {
            this.setProperty("properties." + property, value);
        }
    },

    getObjectProperty:{
        value:function (property) {
            return this.getProperty("properties." + property);
        }
    }

});
