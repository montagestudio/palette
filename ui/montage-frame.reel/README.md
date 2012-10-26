MontageFrame
============

The MontageFrame (for lack of a Montage themed name) is the lowest level component that
an editor should need to interact with to add, remove, or alter components in the reel
being edited.

Eventually this object will emit events or call delegate methods throughout the course of
editing to inform consumers of the changes being made and accepted.

By default, and perhaps permanently, the MontageFrame content is shielded from direct user input.
While preventing direct interaction with the content within the MontageFrame does expose
the ```selectedObjects```. Only single selection is currently enabled.

Loading Content
---------------
 ```javascript
 montageFrame.load(css, serialization, html, javascript)
 ```

This API clearly shows its mfiddle heritage. While there's potential to make a higher level API that
accepts richer objects, I think that's work best left done elsewhere above the MontageFrame.
Ideally the MontageFrame would still be easy enough to work with in simple terms that mfiddle-like
tools would still want to use it.


Adding a component
------------------
```javascript
montageFrame.addComponent("montage/ui/button.reel", "Button", '<button data-montage-id=""></button>');
```

In an effort to minimize require confusion, all requires are done inside the iframe currently.
Exposing the frame's own require as ```frameRequire``` for use by consumers would possibly give us
an option for shifting the responsibility upwards. If this doesn't lead to problems and yields a
friendlier API I'd be quite happy.

Eventually the legacy templateMarkup argument will give way to a default from the related ComponentDescription.

Saving Content
---------------
 ```javascript
 montageFrame.save();
 ```

 This will return a Montage Template object to be serialized for saving however a consumer sees fit.
