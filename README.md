# astro-interactives

[![Greenkeeper badge](https://badges.greenkeeper.io/ccnmtl/astro-interactives.svg)](https://greenkeeper.io/)

Astronomy Simulations and Animations

JavaScript/HTML ports of the Flash originals, found here: [http://astro.unl.edu/animationsLinks.html](http://astro.unl.edu/animationsLinks.html) (source files here: [https://cse.unl.edu/~astrodev/flashdev2/](https://cse.unl.edu/~astrodev/flashdev2/))

* [Small-Angle Approximation Demonstrator](https://ccnmtl.github.io/astro-interactives/small-angle-demo/)
* [Lunar Phase Simulator](https://ccnmtl.github.io/astro-interactives/lunar-phase-simulator/)

## Development guide

Here are instructions on how to develop and make changes to these interactives.

### macOS / Linux 
* Install [node.js](https://nodejs.org/en/)
* Clone this repository
* Go into one of the interactives, e.g.: `cd astro-interactives/lunar-phase-simulator`
* Run `make dev`
* Open the `lunar-phase-simulator/index.html` file in your web browser.

### Windows
The procedure above relies on [make](https://www.gnu.org/software/make/), a pretty typical unix utility on Linux and Mac. So, you can either get that working on Windows, or you can just go without it with the following steps:
* Install [node.js](https://nodejs.org/en/)
* Clone this repository
* Go into one of the interactives, e.g.: `cd astro-interactives\lunar-phase-simulator`
* Run `npm install`
* Run `npm run dev`
* Open the `lunar-phase-simulator\index.html` file in your web browser.
