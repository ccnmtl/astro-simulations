# Flash to JS conversion guide

Here I'll write down the process I'm going through for making the
Motions of the Sun simulator. We can probably automate parts of this
process in the future.

* `mkdir sun-motion-simulator`

Copy over necessary config files:
* `cp lunar-phase-simulator/package.json sun-motion-simulator/`
* `cp lunar-phase-simulator/webpack.config.js sun-motion-simulator/`
* `cp lunar-phase-simulator/.eslintrc.json sun-motion-simulator/`
* `cp lunar-phase-simulator/index.html sun-motion-simulator/`

Make some edits to `package.json` and `index.html` to update "Lunar
Phase sim" to the name of the new interactive you're working on.

Go into the new directory and run `npm install` to install the packages
listed in your `package.json`.

* `cd sun-motion-simulator/`
* `mkdir src dist`
* `npm install`

Make the main JS file. Now you can start sketching out the UI. Run
`npm run dev` in another terminal and open `index.html` in your
browser while editing the main js file:
* `emacs src/main.jsx`

I'm using [Bootstrap](https://getbootstrap.com/) as a UI starting
point. Lay out pieces of the interactive using its grid system CSS
classes.

Look at the original interactive. What parts of it can be built in
HTML? What parts can't? Lay out the form fields in `main.jsx` using
Bootstrap's classes. For anything that requires more advanced
graphics, just leave a text marker there like "HorizonView", or
"Clock". Don't worry about organization, you can change things
later. Just get a rough sketch of everything down.

Once the basic DOM is laid out, look at the graphical sections of the
simulation. Make a React component for each one. For example, if the
view requires 3D graphics, replace `HorizonView` with
`<HorizonView />`, and copy over `HorizonView.jsx` from the sun
simulator or the lunar phase simulator. If it requires 2D graphics
copy over a React component that's using Pixi.js like
`sun-motion-simulator/src/Clock.jsx`.