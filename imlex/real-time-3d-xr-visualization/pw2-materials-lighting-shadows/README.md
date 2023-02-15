# Cornel Box

The following are rough instructions on where each exercise solution can be found in the code contained inside `cornel-box.html`. This is a temporary solution to the lack of modularity, as a future priority is to extract functions from `cornel-box.html` into their own `.js` files.

## Exercise 1

The cornel box structure is built with the following functions (first function name, then line of code):

- `createFramePiece`: 187
- `createPanel`: 240
- `createScreenLowerer`: 278
- `createCornelFace`: 345
- `createLamp`: 388
- `createCornelRoof`: 442
- `createCornelBox`: 497

Both these functions and the other objects (table, cylinder, sphere, and cone) are called/created in the main script section of the code in lines `66-109`.

## Exercise 2

The gui interface is setup entirely inside the function `setupGUI` located in line `574` (note that it goes until line `2200`). This is the priority for refactoring, as it has a lot of potential for both simplifying the gui creation process, and to modularize the different folder sections into separate functions. Plus, the GUI needs the separation of basic and advanced settings urgently.

Changing the color of the cornel box faces is setup around lines `820`. Note that all references are collected at the beginning of the function (line `578`) and all settings are setup at line `612`. An addition of enabling different faces was added (line `792`) - screen lowerer is supposed to model the IXR platform panels that can go down (to be used for the animation later, when implemented)

## Exercise 3

All lights, except for ambient, are created inside the `createLamp` function in line `388`. Ambient light is setup inside `init` function in line `171`.

For the gui, there's a section for lights: lines `864-1048`.

## Exercise 4

"Add a GUI which allows to change **all** the properties for the 3 used materials"

I took the **all** in the document literally and added as many of the available properties as possible. Unfortunately, I didn't have the time to organize the folders better (basic vs advanced settings), so it's left in the TODO.

Material properties can be found in lines `1052-1746` for the common properties from the base class; `1749-1784` for lambert, `1786-1835` for phong, and `1837-2106` for physical.


## Exercise 5

For surface lighting, I added the light panels a distance away from the screen lowerer panels. I wanted the effect of the outside being white while the inside was "reflecting" lights, i.e. coloured. As I used box geometry for the panel to quickly finish the model at first, changing the color also changes the outside, so I'll need to replace box with two panels, as I did for the top panel (outside yellow, inside white). In any way, light from the rectangular light still leaks to the outside, and I didn't figure out in time why.

Inside the `createScreenLowerer` function (line `278`), the RectAreaLight is created in line `309` and setup in the following lines. To sync its color with the panel, I added it to the `onChange` method of the gui in lines `819-856`.


## Exercise 6

I had the shadows ready from the start, since I had experimented with them in the Cube Man exercise. But here, they behave very strangely, with visual bugs around the box (there seems to be a rectangular shadow exactly half the height of the panels).

Properties of the shadow were added to the gui in lines `2108-2187`. Enabling shadows is done using the `traverse` function defined in `2203` in addition to `enableShadows` in `2211`, called at `123`.

## Exercise 7

VR is enabled with the `setupVR` function in line `2228`, and the gui is added in lines `2188-2198`. I made some effort to resize the scene and reposition the gui, but noticed that it doesn't interact well with folders. I think it needs some implementation for resizing the mesh as folder are expanded or collapsed.