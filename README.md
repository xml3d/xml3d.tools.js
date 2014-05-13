xml3d.tools.js
===============

A Toolkit Library for XML3D.

### Build Instructions for Eclipse ###

1. Download the standard version of Eclipse.
2. In Eclipse go to File -> Import.
3. Select "Existing Projects into Workspace" and click "next".
4. Set the root directory to the xml3d.tools library
5. In the "projects" field the library should appear.
6. Click on Finish.
7. In the file explorer on the left side expand the build directory.
8. Right-Click on "build.xml" and then "Run as -> Ant Build".
9. Enjoy the newly build xml3d.tools.js in build/output.

By default Eclipse doesn't support Javascript in the editor. You can change that by:
1. Go to Help -> Install new Software
2. On the top in the field "work with:" select the update site according to your release.
3. Wait for a long time until you see items listed in the big field (on the very bottom-right of eclipse you see the status of retrieving all the available software).
4. In the field below the "work with" ("type filter text" it says) type "javascript".
5. Two options should be presented in the big field. They are the same, select one of the checkboxes to mark it for install.
6. Now search for "web developer" and mark the "Eclipse Web Developer Tools" for install.
7. Click next and follow the install process.

### Build Instructions on the Command Line ###

1. Make sure Ant is installed and accessible on the command-line
2. open a command-line and go to the build directory
3. type:
    ant develop

### Usage ###

1. Checkout examples :)
