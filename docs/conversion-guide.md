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
point. You can lay out pieces of the interactive using its grid system
CSS classes.