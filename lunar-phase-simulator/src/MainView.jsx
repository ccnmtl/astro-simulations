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

        this.onDragStart = this.onDragStart.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.onEarthDragMove = this.onEarthDragMove.bind(this);
        this.onMoonDragMove = this.onMoonDragMove.bind(this);
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
        this.drawArrows();
        this.drawOrbit();

        this.app.loader.add('moon', 'img/moon.svg')
              .add('earth', 'img/earth.svg')
              .add('avatar', 'img/white-stickfigure.svg')
              .add('highlight', 'img/circle-highlight.svg');

        const me = this;
        this.app.loader.load((loader, resources) => {
            me.resources = resources;

            me.moon = me.drawMoon(resources.moon);
            me.moon
              // events for drag start
              .on('mousedown', me.onDragStart)
              .on('touchstart', me.onDragStart)
              // events for drag end
              .on('mouseup', me.onDragEnd)
              .on('mouseupoutside', me.onDragEnd)
              .on('touchend', me.onDragEnd)
              .on('touchendoutside', me.onDragEnd)
              // events for drag move
              .on('mousemove', me.onMoonDragMove)
              .on('touchmove', me.onMoonDragMove);

            me.earth = me.drawEarth(resources.earth, resources.avatar);
            me.earth
              // events for drag start
              .on('mousedown', me.onDragStart)
              .on('touchstart', me.onDragStart)
              // events for drag end
              .on('mouseup', me.onDragEnd)
              .on('mouseupoutside', me.onDragEnd)
              .on('touchend', me.onDragEnd)
              .on('touchendoutside', me.onDragEnd)
              // events for drag move
              .on('mousemove', me.onEarthDragMove)
              .on('touchmove', me.onEarthDragMove);

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
        this.moon.x = 200 * Math.cos(-this.props.moonPhase) + 370;
        this.moon.y = 200 * Math.sin(-this.props.moonPhase) + 230;
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
        moon.name = 'moon';
        moon.interactive = true;
        moon.buttonMode = true;
        moon.width = 20;
        moon.height = 20;
        moon.x = 200 * Math.cos(-this.props.moonPhase) + 370;
        moon.y = 200 * Math.sin(-this.props.moonPhase) + 230;

        // Rotate around the center of the scene
        moon.anchor.x = 0.5;
        moon.anchor.y = 0.5;

        // Add the moon to the scene we are building
        this.app.stage.addChild(moon);

        return moon;
    }
    /*
     * The earth's rotation in this view is determined by observerAngle.
     */
    drawEarth(earthResource, avatarResource) {
        const earth = new PIXI.Sprite(earthResource.texture);
        earth.name = 'earth';
        earth.interactive = true;
        earth.buttonMode = true;
        earth.width = 70;
        earth.height = 70;
        earth.x = 370;
        earth.y = 230;

        // Rotate around the center of the scene
        earth.anchor.x = 0.5;
        earth.anchor.y = 0.5;

        earth.rotation = -this.props.observerAngle;

        const avatar = new PIXI.Sprite(avatarResource.texture);
        avatar.width = 17;
        avatar.height = 36;
        avatar.x = 370;
        avatar.y = 230;

        // Rotate around the center of the scene
        avatar.anchor.x = 0.5;
        avatar.anchor.y = 0.5;
        avatar.rotation = -this.props.observerAngle;
        earth.addChild(avatar);

        // Add the earth to the scene we are building
        this.app.stage.addChild(earth);

        return earth;
    }
    drawText() {
        const sunlightText = new PIXI.Text('Sunlight', {
            fontFamily: 'Arial',
            fontSize: 28,
            fontWeight: 'bold',
            fill: 0xffff80,
            align: 'center'
        });
        sunlightText.rotation = degToRad(-90);
        sunlightText.position.x = 14;
        sunlightText.position.y = 270;
        this.app.stage.addChild(sunlightText);
    }
    drawArrows() {
        for (let i = 1; i < 8; i++) {
            let line = new PIXI.Graphics();
            line.lineColor = 0xffff80;
            line.lineWidth = 2;

            line.moveTo(60, i * 50 + 30);
            line.lineTo(120, i * 50 + 30);

            // Draw the arrowhead
            let arrowhead = new PIXI.Graphics()
                                    .beginFill(0xffff80)
                                    .drawPolygon([
                                        110, i * 50 + 26,
                                        110, i * 50 + 34,
                                        123, i * 50 + 30
                                    ]);

            this.app.stage.addChild(line);
            this.app.stage.addChild(arrowhead);
        }
    }
    onDragStart(event) {
        this.data = event.data;
        this.dragStartPos = this.data.getLocalPosition(this.app.stage);

        if (event.target.name === 'earth') {
            this.draggingEarth = true;
        } else if (event.target.name === 'moon') {
            this.draggingMoon = true;
        }
    }
    onDragEnd() {
        this.draggingEarth = false;
        this.draggingMoon = false;

        // set the interaction data to null
        this.data = null;
    }
    onEarthDragMove() {
        if (this.draggingEarth) {
            const newPosition = this.data.getLocalPosition(this.app.stage);
            const diff = [
                this.dragStartPos.x - newPosition.x,
                this.dragStartPos.y - newPosition.y
            ];

            // This angle starts at the center of the earth. It's the
            // difference, in radians, between where the cursor was and
            // where it is now.
            const vAngle =
                Math.atan2(diff[1], diff[0]) -
                Math.atan2(this.dragStartPos.y, this.dragStartPos.x);

            this.props.onObserverAngleUpdate(-vAngle);
        }
    }
    onMoonDragMove() {
        if (this.draggingMoon) {
            const newPosition = this.data.getLocalPosition(this.app.stage);
            const diff = [
                this.dragStartPos.x - newPosition.x,
                this.dragStartPos.y - newPosition.y
            ];

            // This angle starts at the center of the orbit. It's the
            // difference, in radians, between where the cursor was and
            // where it is now.
            const vAngle =
                Math.atan2(diff[1], diff[0]) -
                Math.atan2(this.dragStartPos.y, this.dragStartPos.x);

            this.props.onMoonPosUpdate(-vAngle);
        }
    }
}

MainView.propTypes = {
    observerAngle: PropTypes.number.isRequired,
    moonPhase: PropTypes.number.isRequired,
    onObserverAngleUpdate: PropTypes.func.isRequired,
    onMoonPosUpdate: PropTypes.func.isRequired
};
