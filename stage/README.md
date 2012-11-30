Stage
=====
Palette provides a stage application capable of loading and rendering a specified Montage Component.
This stage can be used as a standalone application for simply rendering a specified component
without any other context. When used as part of Palette, the stage houses the live component
being edited; modifications made to this component are reflected live on the stage.

Editing environments that rely on Palette should typically not make the stage itself accessible
as it provides no useful APIs.

Visual editing components, such as those provided within Palette, are not intended
for use inside the stage for the time being.

Usage
=====
The stage application's index.html can be requested with a "reel-location" query parameter
specifying a URI-component-encoded URL of the reel to load. If this query parameter is not
detected, a standard prompt will be presented for the user to specify the reel's URL at
runtime.

Notes
=====
Without further information specifying the URL of the package.json governing the package
this component is a part of the stage sets off to discover the package.json itself. This
discovery process inevitably triggers several requests for nonexistent URLs that should
be ignored.