# astro-interactives

[![Greenkeeper badge](https://badges.greenkeeper.io/ccnmtl/astro-interactives.svg)](https://greenkeeper.io/)

Astronomy Simulations and Animations

JavaScript/HTML ports of the Flash originals, found here: [http://astro.unl.edu/animationsLinks.html](http://astro.unl.edu/animationsLinks.html) (source files here: [https://cse.unl.edu/~astrodev/flashdev2/](https://cse.unl.edu/~astrodev/flashdev2/))

* [Small-Angle Approximation Demonstrator](https://ccnmtl.github.io/astro-interactives/small-angle-demo/)
* [Lunar Phase Simulator](https://ccnmtl.github.io/astro-interactives/lunar-phase-simulator/)
* [Motions of the Sun Simulator](https://ccnmtl.github.io/astro-interactives/sun-motion-simulator/)

## Development guide

Here are instructions on how to develop and make changes to these interactives. If you're using Windows, replace the forward slashes with back-slashes.


* Install [node.js](https://nodejs.org/en/)
* Clone this repository
* Go into one of the interactives, e.g.: `cd astro-interactives/lunar-phase-simulator`
* Run `npm install`
* Run `npm run dev`
* Open the `lunar-phase-simulator/index.html` file in your web browser.
* * If you see CORS errors in the JS console because of the image loading, you have a few options. A) try another browser. B) run a local web server (I use nginx). If you have Python 3 installed you can run `python -m http.server` in the root directory of the repo, and then navigate to the corresponding directory. C)  I've set up an `npm run serve` command in the interactives which uses [webpack-serve](https://github.com/webpack-contrib/webpack-serve), but there are issues with that at the moment. Once those issues are resolved this will be the best way of running these interactives.

For some background info, see the [How to animate graphical JavaScript programs](https://compiled.ctl.columbia.edu/articles/how-to-animate-graphical-javascript-programs/) blog post.

There's also the [Conversion Guide](https://ccnmtl.github.io/astro-interactives/docs/conversion-guide.html)
 that documents how to put together a new interactive.

### Development links
Here are some links that may be helpful for development.
* [WebGL Setup and Installation](https://webglfundamentals.org/webgl/lessons/webgl-setup-and-installation.html)
* [Three.js Fundamentals](https://threejsfundamentals.org/)
