# astro-simulations [![Build Status](https://travis-ci.org/ccnmtl/astro-simulations.svg?branch=master)](https://travis-ci.org/ccnmtl/astro-simulations)

[![Greenkeeper badge](https://badges.greenkeeper.io/ccnmtl/astro-simulations.svg)](https://greenkeeper.io/)

Astronomy Simulations and Animations

JavaScript/HTML ports of the Flash originals, found here: [http://astro.unl.edu/animationsLinks.html](http://astro.unl.edu/animationsLinks.html) (source files here: [https://cse.unl.edu/~astrodev/flashdev2/](https://cse.unl.edu/~astrodev/flashdev2/)) The original simulations are written in ActionScript 1.0. To open
the .fla files, you'll need an older version of Adobe Animate than the current version (19.1). You can download
a trial version of Adobe Flash Professional CS4 [here](https://helpx.adobe.com/creative-suite/kb/cs4-product-downloads.html)
and open the .fla files with this. To get to the code, go to Window -> Actions. The bottom-left panel
should have the code hierarchy.

* [Small-Angle Approximation Demonstrator](https://ccnmtl.github.io/astro-simulations/small-angle-demo/)
* [Lunar Phase Simulator](https://ccnmtl.github.io/astro-simulations/lunar-phase-simulator/)
* [Motions of the Sun Simulator](https://ccnmtl.github.io/astro-simulations/sun-motion-simulator/)
* [Exoplanet Transit Simulator](https://ccnmtl.github.io/astro-simulations/exoplanet-transit-simulator/)
* [Eclipsing Binary Simulator](https://ccnmtl.github.io/astro-simulations/eclipsing-binary-simulator/)
* [Gas Retention Simulator](https://ccnmtl.github.io/astro-simulations/gas-retention-simulator/)

## Development guide

Here are instructions on how to develop and make changes to these simulations. If you're using Windows, replace the forward slashes with back-slashes.

* Install [node.js](https://nodejs.org/en/)
* Clone this repository
* Go into one of the simulations, e.g.: `cd astro-simulations/lunar-phase-simulator`
* Run `npm install`
* Run `npm run serve`
* Wait for the build to complete. It takes a while.
* Open http://localhost:8080 in your web browser.

You can also use the `npm run dev` command if all you want to do is
make a development build of a simulation without using
[webpack-dev-server](https://github.com/webpack/webpack-dev-server). Three.js
has an overview of this in [How to run things locally](https://threejs.org/docs/#manual/en/introduction/How-to-run-things-locally).
Both `npm run dev` and `npm run serve` watch the `src/` directory for file
changes.

Here are some blog posts I've made about these simulations:
* [How to animate graphical JavaScript programs](https://compiled.ctl.columbia.edu/articles/how-to-animate-graphical-javascript-programs/)
* [How to make an analog clock (Part 1)](https://www.columbia.edu/~njn2118/journal/2018/9/27.html)

There's also the [Conversion Guide](https://ccnmtl.github.io/astro-simulations/docs/conversion-guide.html)
 that documents how to put together a new interactive.

### Development links
Here are some links that may be helpful for development.
* [WebGL Setup and Installation](https://webglfundamentals.org/webgl/lessons/webgl-setup-and-installation.html)
* [Three.js Fundamentals](https://threejsfundamentals.org/)
* [Learning Pixi](https://github.com/kittykatattack/learningPixi)
