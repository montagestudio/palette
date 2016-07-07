var TestPageLoader = require("montage-testing/testpageloader").TestPageLoader;

var Template = require("montage/core/template").Template;

var WAITSFOR_TIMEOUT = 2000;

TestPageLoader.queueTest("editing-frame/editing-frame", function (testPage) {

    describe("ui/editing-frame-spec", function () {
        var editingFrame;
        beforeEach(function() {
            editingFrame = testPage.test.editingFrame;
        });

        describe("the editing frame", function () {
            it("should have no default source loaded in the stage", function () {
                expect(editingFrame.element.src).toBeFalsy();
            });
        });

        // TODO: All of these tests are broken. Right now I don't know how to fix them, they have been out of
        // date for some time now.
        xdescribe("loading a template", function () {
            var template;
            var noOwnerHtml = '<html><head><script type="text/montage-serialization">{'+
                '    "text": {'+
                '        "prototype": "montage/ui/text.reel",'+
                '        "properties": {'+
                '            "element": {"#": "text"},'+
                '            "value": "pass"'+
                '        }'+
                '    }'+
                '}</script>'+
                '</head>' +
                '<body>' +
                '    <span data-montage-id="text"></span>' +
                '</body>' +
                '</html>';

            var ownerHtml = '<html><head>'+
                '    <script type="text/montage-serialization">'+
                '    {'+
                '        "owner": {'+
                '            "properties": {'+
                '                "element": {"#": "test"},'+
                '                "value": "pass"'+
                '            }'+
                '        },'+
                '        "text": {'+
                '            "prototype": "montage/ui/text.reel",'+
                '            "properties": {'+
                '                "element": {"#": "text"},'+
                '                "value": "pass"'+
                '            }'+
                '        }'+
                '    }'+
                '    </script>'+
                '</head>'+
                '<body>'+
                '    <div data-montage-id="test">'+
                '        <span data-montage-id="text"></span>'+
                '    </div>'+
                '</body>'+
                '</html>';

            beforeEach(function () {
                editingFrame.reset();
                template = new Template();
            });

            it("can load template without an owner", function () {
                return template.initWithHtml(noOwnerHtml, require)
                .then(function () {
                    return editingFrame.loadTemplate(template);
                })
                .then(function (info) {
                    expect(info.template).toBeDefined();
                    expect(info.frame).toBeDefined();

                    expect(info.template._require).not.toBe(require);

                    expect(info.frame.iframe.contentDocument.querySelector("[data-montage-id=text]").textContent).toBe("pass");
                });
            });

            it("can load template with an owner", function () {
                return template.initWithHtml(ownerHtml, require)
                .then(function () {
                    return editingFrame.loadTemplate(template, "test/ui/editing-frame/test.reel", "Abc");
                })
                .then(function (info) {
                    expect(info.owner).toBeDefined();
                    expect(info.template).toBeDefined();
                    expect(info.frame).toBeDefined();

                    expect(info.owner.value).toBe("pass");

                    expect(info.template._require).not.toBe(require);

                    expect(info.frame.iframe.contentDocument.querySelector("[data-montage-id=text]").textContent).toBe("pass");
                });
            });

            it("reuses the same require when loading from the same package", function () {
                var packageRequire;

                return template.initWithHtml(noOwnerHtml, require)
                .then(function () {
                    return editingFrame.loadTemplate(template);
                })
                .then(function (info) {
                    packageRequire = info.template._require;

                    return editingFrame.loadTemplate(info.template);
                })
                .then(function (info) {
                    expect(info.template._require).toBe(packageRequire);
                });
            });

            describe("", function () {
                var init;
                beforeEach(function () {
                    init = template.initWithHtml(noOwnerHtml, require);
                });

                it("can be reloaded twice without errors", function () {
                    return init.then(function () {
                        editingFrame.loadTemplate(template);
                    }).then(function () {
                        var a = editingFrame.refresh(template);
                        var b = editingFrame.refresh(template);

                        return a.then(function (aInfo) {
                            expect(aInfo.template).not.toBe(template);
                            expect(b.isPending()).toBe(true);

                            return b.then(function (bInfo) {
                                expect(bInfo.template).not.toBe(aInfo.template);
                            });
                        });
                    });
                });
            });
        });

    });
});
