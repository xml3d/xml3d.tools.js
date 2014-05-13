# xml3d.tools.js

A Toolkit Library for XML3D. For an overview take a look at the [examples page](http://xml3d.github.io/xml3d.tools.js/index.xhtml)

## Build Instructions

### Eclipse

1. Download the standard version of Eclipse.
2. In Eclipse go to *File -> Import*.
3. Select *Existing Projects into Workspace* and click *Next*.
4. Set the root directory to the xml3d.tools.js library
5. In the *Projects* field the library should appear.
6. Click on *Finish*.
7. In the file explorer on the left side expand the build directory.
8. Right-Click on *build.xml* and then *Run as -> Ant Build*.
9. Enjoy the newly built `xml3d.tools.js` in *build/output*.

By default Eclipse doesn't support Javascript in the editor. You can change that by:

1. Go to *Help -> Install new Software*
2. On the top in the field *Work with:* select the update site according to your release.
3. Wait for a long time until you see items listed in the big field (on the very bottom-right of Eclipse you see the status of retrieving all the available software).
4. In the field below the *Work with* type *javascript*.
5. Two options should be presented in the big field. They are the same, select one of the checkboxes to mark it for install.
6. Now search for *web developer* and mark the *Eclipse Web Developer Tools* for install.
7. Click *Next* and follow the install process.

### Command Line

1. Make sure Ant is installed and accessible on the command-line
2. open a command-line and go to the build directory
3. type `ant develop` to concatenate all scripts or `ant develop-min` for a minified build
