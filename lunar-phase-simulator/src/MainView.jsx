import React from 'react';
import PropTypes from 'prop-types';
import * as PIXI from 'pixi.js';

export default class MainView extends React.Component {
    constructor(props) {
        super(props);
        this.id = 'MainView';
        this.resources = {};

        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.animate = this.animate.bind(this);
    }
    // react/PIXI integration from:
    // https://www.protectator.ch/post/pixijs-v4-in-a-react-component
    render() {
        return (
            <div id={this.id}
                 ref={(thisDiv) => {this.gameCanvas = thisDiv}} />
        );
    }
    componentDidMount() {
        this.app = new PIXI.Application(600, 460);
        this.gameCanvas.appendChild(this.app.view);
        this.app.start();

        const loader = new PIXI.loaders.Loader();
        loader.add('moon', 'img/moon.svg')
              .add('earth', 'img/earth.svg')
              .add('avatar', 'img/white-stickfigure.svg')
              .add('highlight', 'img/circle-highlight.svg');

        const me = this;
        loader.load((loader, resources) => {
            me.resources = resources;

            me.moon = me.drawMoon(resources.moon);
            me.moon.on('click', function() {
                console.log('moon');
            });

            me.earth = me.drawEarth(resources.earth, resources.avatar);
            me.earth.on('click', function() {
                console.log('earth');
            });

            me.start();
        });
    }
    componentWillUnmount() {
        this.app.stop();
    }
    start() {
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.animate);
        }
    }
    stop() {
        cancelAnimationFrame(this.frameId)
    }
    animate() {
        this.moon.x = 200 * Math.cos(-this.props.moonPos) + 360;
        this.moon.y = 200 * Math.sin(-this.props.moonPos) + 220;
        this.earth.rotation = -this.props.observerAngle;

        this.frameId = window.requestAnimationFrame(this.animate);
    }
    draw() {
        //this.drawOrbit(this.ctx);
        this.drawMoon(this.resources.moon);
        this.drawEarth(this.resources.earth, this.resources.avatar);
    }
    drawOrbit(ctx) {
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = 'white';
        ctx.beginPath();
        ctx.arc(370, 230, 200, 0, Math.PI * 2, true);
        ctx.stroke();
    }
    drawMoon(moonResource) {
        const moon = new PIXI.Sprite(moonResource.texture);
        moon.interactive = true;
        moon.buttonMode = true;
        moon.width = 20;
        moon.height = 20;
        moon.x = 200 * Math.cos(-this.props.moonPos) + 360;
        moon.y = 200 * Math.sin(-this.props.moonPos) + 220;

        // Rotate around the center
        moon.anchor.x = 0.5;
        moon.anchor.y = 0.5;

        // Add the moon to the scene we are building
        this.app.stage.addChild(moon);

        return moon;
    }
    /*
     * The earth's rotation in this view is determined by observerAngle.
     */
    drawEarth(earthResource) {
        const earth = new PIXI.Sprite(earthResource.texture);
        earth.interactive = true;
        earth.buttonMode = true;
        earth.width = 70;
        earth.height = 70;
        earth.x = 370 - 35;
        earth.y = 230 - 35;

        // Rotate around the center
        earth.anchor.x = 0.5;
        earth.anchor.y = 0.5;

        earth.rotation = -this.props.observerAngle;

        // Add the earth to the scene we are building
        this.app.stage.addChild(earth);

        return earth;
    }
}

MainView.propTypes = {
    observerAngle: PropTypes.number.isRequired,
    moonPos: PropTypes.number.isRequired
};
