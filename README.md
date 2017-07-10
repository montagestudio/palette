[![Build Status](https://travis-ci.com/montagestudio/palette.svg?branch=master)](http://travis-ci.com/montagestudio/palette)

# palette

Montage Authoring Toolkit
These are the low-level pieces that could be assembled into a fully-fledged
montage editor.

## Install

If working on the palette library itself you'll need the development
dependencies:

    npm install

Otherwise, runtime dependencies are typically expected to be provided by a
host environment.

The editing context provided by the EditingFrame component can be seen within
the palette.html file; no UI is provided in this particular example.

## Maintenance

Tests are in the `test` directory. Use `npm test` to run the tests in
NodeJS or open `test/run.html` in a browser. 

To run the tests in your browser, simply use `npm run test:jasmine`.

To run the tests using Karma use `npm run test:karma` and for continious tests run with file changes detection `npm run test:karma-dev`.