var Montage = require("montage").Montage;

// TODO this abstraction should probably go away if we decide to push the definitive "model"
// into the frame's DOM.
// Right now I still rely on it a bit to coordinate loading existing examples into the montageFrame
exports.AuthoringDocument = Montage.create(Montage, {

    title: {
        value: "Untitled Document"
    },

    _serialization: {
        value: null
    },

    serialization: {
        get: function() {
            return this._serialization;
        },
        set: function(value) {
            if (value === this._serialization) {
                return;
            }

            if (typeof this.pristineSerialization === "undefined") {
                Object.defineProperty(this, "pristineSerialization", {
                    enumerable: false,
                    value: this._serialization
                });
            }

            this._serialization = value;

            if (this._serialization !== this._pristineSerialization) {
                this.hasUnsavedChanges = true;
            }
        }
    },

    _structure: {
        value: null
    },

    structure: {
        get: function() {
            return this._structure;
        },
        set: function(value) {
            if (value === this._structure) {
                return;
            }

            if (typeof this.pristineStructure === "undefined") {
                Object.defineProperty(this, "pristineStructure", {
                    enumerable: false,
                    value: this._structure
                });
            }

            this._structure = value;

            if (this._structure !== this._pristineStructure) {
                this.hasUnsavedChanges = true;
            }
        }
    },

    _behavior: {
        value: null
    },

    behavior: {
        get: function() {
            return this._behavior;
        },
        set: function(value) {
            if (value === this._behavior) {
                return;
            }

            if (typeof this.pristineBehavior === "undefined") {
                Object.defineProperty(this, "pristineBehavior", {
                    enumerable: false,
                    value: this._behavior
                });
            }

            this._behavior = value;

            if (this._behavior !== this._pristineBehavior) {
                this.hasUnsavedChanges = true;
            }
        }
    },

    _styling: {
        value: null
    },

    styling: {
        get: function() {
            return this._styling;
        },
        set: function(value) {
            if (value === this._styling) {
                return;
            }

            if (typeof this.pristineStyling === "undefined") {
                Object.defineProperty(this, "pristineStyling", {
                    enumerable: false,
                    value: this._styling
                });
            }

            this._styling = value;

            if (this._styling !== this._pristineStyling) {
                this.hasUnsavedChanges = true;
            }
        }
    },

    hasUnsavedChanges: {
        value: false
    },

    save: {
        value: function() {

            if (!this.hasUnsavedChanges) {
                return;
            }

            //TODO implement actual saving
            this.pristineSerialization = this.serialization;
            this.pristineStructure = this.structure;
            this.pristineBehavior = this.behavior;
            this.pristineStyling = this.styling;

            this.hasUnsavedChanges = false;
        }
    },

    revert: {
        value: function() {

            if (!this.hasUnsavedChanges) {
                return;
            }

            this.serialization = this.pristineSerialization;
            this.structure = this.pristineStructure;
            this.behavior = this.pristineBehavior;
            this.styling = this.pristineStyling;

            this.hasUnsavedChanges = false;
        }
    },

    /**
     <!DOCTYPE html>
     <html>
     <head>
     <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
     <title>Montage Authoring</title>
     <script type="text/montage-serialization"><!-- serialization -->}</script>
     </head>
     <body>
     <!-- html -->
     </body>
     </html>
     */
    _htmlPageTemplate: {
        value: '<!DOCTYPE html>\n<html>\n<head>\n    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\n    <title>Montage Authoring</title>\n    <script type="text/montage-serialization"><!-- serialization --></script></head>\n<body>\n    <!-- html -->\n</body>\n</html>'
    },

    templateContent: {
        get: function() {
            var serialization = this.serialization,
                html = this.structure;

            serialization = serialization.replace(/\n/gm, "\n    ");
            html = html.replace(/\n/gm, "\n    ");

            return this._htmlPageTemplate
                .replace("<!-- serialization -->", serialization)
                .replace("<!-- html -->", html);
        }
    }

});
