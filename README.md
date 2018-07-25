# astro-interactives

[![Greenkeeper badge](https://badges.greenkeeper.io/ccnmtl/astro-interactives.svg)](https://greenkeeper.io/)

Astronomy Simulations and Animations

JavaScript/HTML ports of the Flash originals, found here: [http://astro.unl.edu/animationsLinks.html](http://astro.unl.edu/animationsLinks.html) (source files here: [https://cse.unl.edu/~astrodev/flashdev2/](https://cse.unl.edu/~astrodev/flashdev2/))

* [Small-Angle Approximation Demonstrator](https://ccnmtl.github.io/astro-interactives/small-angle-demo/)
* [Lunar Phase Simulator](https://ccnmtl.github.io/astro-interactives/lunar-phase-simulator/)

## Development guide

Here are instructions on how to develop and make changes to these interactives.

* Install [node.js](https://nodejs.org/en/)
* Clone this repository
* Go into one of the interactives, e.g.: `cd astro-interactives/lunar-phase-simulator`
* Run `npm install`
* Run `npm run dev`
* Open the `lunar-phase-simulator/index.html` file in your web browser.
* * If you see CORS errors in the JS console because of the image loading, you have a few options. A) try another browser. B) run a local web server (I use nginx). I've set up an `npm run serve` command in the interactives which uses [webpack-serve](https://github.com/webpack-contrib/webpack-serve), but there are issues with that at the moment. Once those issues are resolved this will be the best way of running these interactives.

If you're using Windows, replace the forward slashes with back-slashes.
