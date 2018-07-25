import React from 'react';
import PropTypes from 'prop-types';
import * as PIXI from 'pixi.js';
import {degToRad} from './utils';

export default class MainView extends React.Component {
    constructor(props) {
        super(props);
        this.resources = {};

        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.animate = this.animate.bind(this);
    }
    // react/PIXI integration from:
    // https://www.protectator.ch/post/pixijs-v4-in-a-react-component
    render() {
        return (
            <div ref={(thisDiv) => {this.el = thisDiv}} />
        );
    }
    componentDidMount() {
        this.app = new PIXI.Application({
            width: 600,
            height: 460,

            // The default is webgl - I'll switch to that if necessary
            // but for now canvas just displays my images better. I'm
            // guessing there's just some filters or settings I can add
            // to make it look good in webgl.
            forceCanvas: true,

            // as far as I know the ticker isn't necessary at the
            // moment.
            sharedTicker: true
        });

        this.el.appendChild(this.app.view);

        this.drawText();
        this.drawOrbit();

        this.app.loader.add('moon', 'img/moon.svg')
              .add('earth', 'img/earth.svg')
              .add('avatar', 'img/white-stickfigure.svg')
              .add('highlight', 'img/circle-highlight.svg');

        const me = this;
        this.app.loader.load((loader, resources) => {
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
        this.moon.x = 200 * Math.cos(-this.props.moonPos) + 370;
        this.moon.y = 200 * Math.sin(-this.props.moonPos) + 230;
        this.earth.rotation = -this.props.observerAngle;

        this.frameId = window.requestAnimationFrame(this.animate);
    }
    draw() {
        this.drawMoon(this.resources.moon);
        this.drawEarth(this.resources.earth, this.resources.avatar);
    }
    drawOrbit() {
        const graphics = new PIXI.Graphics();
        graphics.lineColor = 0xffffff;
        graphics.lineWidth = 1;
        graphics.drawCircle(370, 230, 200);
        this.app.stage.addChild(graphics);
    }
    drawMoon(moonResource) {
        const moon = new PIXI.Sprite(moonResource.texture);
        moon.interactive = true;
        moon.buttonMode = true;
        moon.width = 20;
        moon.height = 20;
        moon.x = 200 * Math.cos(-this.props.moonPos) + 370;
        moon.y = 200 * Math.sin(-this.props.moonPos) + 230;

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
        earth.x = 370;
        earth.y = 230;

        // Rotate around the center
        earth.anchor.x = 0.5;
        earth.anchor.y = 0.5;

        earth.rotation = -this.props.observerAngle;

        // Add the earth to the scene we are building
        this.app.stage.addChild(earth);

        return earth;
    }
    drawText() {
        const sunlightText = new PIXI.Text('Sunlight', {
            fontFamily: 'Arial',
            fontSize: 28,
            fill: 0xf0f000,
            align: 'center'
        });
        sunlightText.rotation = degToRad(-90);
        sunlightText.position.x = 20;
        sunlightText.position.y = 270;
        this.app.stage.addChild(sunlightText);
    }
}

MainView.propTypes = {
    observerAngle: PropTypes.number.isRequired,
    moonPos: PropTypes.number.isRequired
};
