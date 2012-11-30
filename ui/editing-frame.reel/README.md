EditingFrame
============

The EditingFrame is the lowest level component that an editor should need to interact with
to add, remove, or alter components in the reel being edited.

Eventually this object will emit events or call delegate methods throughout the course of
editing to inform consumers of the changes being made and accepted.

Currently, much of the performed on the edited ownerComponent is managed by the
internal ```ComponentController``` This controller currently manages altering a component
without the extra baggage of being a component itself. There will come a time when this
object itself is promoted as the primary point of interaction...possibly in the next couple
of commits.

By default, and perhaps permanently, the EditingFrame content is shielded from direct user input.
While preventing direct interaction with the content within the EditingFrame does expose
the ```selectedObjects```. Only single selection is currently enabled.

Loading a Component
-------------------
 ```javascript
 editingFrame.load("http://localhost/my-app/ui/my-component.reel")
 ```

Adding a Component
------------------
```javascript
editingComponent.addComponent("montage/ui/button.reel", "Button", '<button data-montage-id=""></button>');
```

Eventually the legacy templateMarkup argument will give way to a default from the related ComponentDescription.

Saving Content
--------------
```javascript
editingFrame.template
```

At any time accessing the editingFrame's ```template``` property will return a Montage Template suitable for
 later processing and saving as desired.