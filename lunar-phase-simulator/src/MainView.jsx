import React from 'react';
import PropTypes from 'prop-types';
import * as PIXI from 'pixi.js';
import {degToRad, radToDeg, roundToOnePlace} from './utils';

/**
 * Convert the moon angle for display.
 *
 * Returns a string.
 */
const getAngleDisplay = function(moonAngle) {
    let a = Math.abs(moonAngle - Math.PI);
    if (a >= Math.PI) {
        a -= Math.PI * 2;
    }
    const angle = roundToOnePlace(radToDeg(Math.abs(a)));
    return `${angle}°`;
};

export default class MainView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isHoveringOnEarth: false,
            isHoveringOnMoon: false
        };

        this.resources = {};

        this.orbitCenter = new PIXI.Point(370 * 2, 230 * 2);

        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.animate = this.animate.bind(this);

        this.onDragStart = this.onDragStart.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.onEarthMove = this.onEarthMove.bind(this);
        this.onMoonMove = this.onMoonMove.bind(this);
    }
    // react/PIXI integration from:
    // https://www.protectator.ch/post/pixijs-v4-in-a-react-component
    render() {
        return (
            <div className="MainView"
                ref={(thisDiv) => {this.el = thisDiv}} />
        );
    }
    componentDidMount() {
        this.app = new PIXI.Application({
            width: 600 * 2,
            height: 460 * 2,

            antialias: true,

            // as far as I know the ticker isn't necessary at the
            // moment.
            sharedTicker: true
        });

        this.el.appendChild(this.app.view);

        this.drawText();
        this.drawArrows();
        this.drawOrbit();
        this.angle = this.drawAngle();
        this.angleText = this.drawAngleText(this.props.moonAngle);

        this.app.loader.add('moon', 'img/moon.svg')
            .add('earth', 'img/earth.svg')
            .add('avatar', 'img/white-stickfigure.svg')
            .add('highlight', 'img/circle-highlight.svg')
            .add('timeCompass', 'img/time-compass.svg');

        const me = this;
        this.app.loader.load((loader, resources) => {
            me.resources = resources;

            me.moonContainer = me.drawMoon(
                resources.moon, resources.highlight);
            me.moonContainer
              // events for drag start
              .on('pointerdown', me.onDragStart)
              .on('touchstart', me.onDragStart)
              // events for drag end
              .on('pointerup', me.onDragEnd)
              .on('pointerupoutside', me.onDragEnd)
              .on('touchend', me.onDragEnd)
              .on('touchendoutside', me.onDragEnd)
              // events for drag move
              .on('pointermove', me.onMoonMove)
              .on('touchmove', me.onMoonMove);

            me.earth = me.drawEarth(
                resources.earth,
                resources.avatar,
                resources.highlight);

            me.earth
              // events for drag start
              .on('pointerdown', me.onDragStart)
              .on('touchstart', me.onDragStart)
              // events for drag end
              .on('pointerup', me.onDragEnd)
              .on('pointerupoutside', me.onDragEnd)
              .on('touchend', me.onDragEnd)
              .on('touchendoutside', me.onDragEnd)
              // events for drag move
              .on('pointermove', me.onEarthMove)
              .on('touchmove', me.onEarthMove);

            me.timeCompass = me.drawTimeCompass(resources.timeCompass);

            me.start();
        });
    }
    componentWillUnmount() {
        this.app.stop();
    }
    componentDidUpdate(prevProps) {
        if (prevProps.showLunarLandmark !== this.props.showLunarLandmark) {
            this.landmark.visible = this.props.showLunarLandmark;
        }

        if (this.props.showAngle &&
            prevProps.moonAngle !== this.props.moonAngle
        ) {
            this.updateAngle(this.angle, this.props.moonAngle);
            this.updateAngleText(this.angleText, this.props.moonAngle);
        }

        if (prevProps.showAngle !== this.props.showAngle) {
            if (this.props.showAngle) {
                this.updateAngle(this.angle, this.props.moonAngle);
                this.updateAngleText(this.angleText, this.props.moonAngle);
            }

            this.angle.visible = this.props.showAngle;
            this.angleText.visible = this.props.showAngle;
        }
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
        this.moonContainer.position = this.getMoonPos(this.props.moonAngle);

        // Rotate the moon about the earth, but not the shade from the
        // sun.
        const me = this;
        this.moonContainer.children.filter(el => {
            return el.name === 'moonObj' || el.name === 'landmark';
        }).forEach(el => {
            el.rotation = -me.props.moonAngle;
        });

        if (this.state.isHoveringOnMoon || this.draggingMoon) {
            this.moonHighlight.visible = true;
        } else {
            this.moonHighlight.visible = false;
        }

        this.earth.rotation = -this.props.observerAngle + degToRad(90);

        if (this.state.isHoveringOnEarth || this.draggingEarth) {
            this.earthHighlight.visible = true;
        } else {
            this.earthHighlight.visible = false;
        }

        if (this.props.showTimeTickmarks) {
            this.timeCompass.visible = true;
        } else {
            this.timeCompass.visible = false;
        }

        this.frameId = requestAnimationFrame(this.animate);
    }
    drawOrbit() {
        const graphics = new PIXI.Graphics();
        graphics.lineStyle(2, 0xffffff);
        graphics.drawCircle(this.orbitCenter.x, this.orbitCenter.y, 200 * 2);
        this.app.stage.addChild(graphics);
    }
    drawAngle() {
        const g = new PIXI.Graphics();
        g.visible = false;
        this.updateAngle(g, this.props.moonAngle);

        this.app.stage.addChild(g);
        return g;
    }
    drawAngleText(moonAngle) {
        const angle = getAngleDisplay(-moonAngle);
        const g = new PIXI.Text(angle, {
            fontFamily: 'Arial',
            fontSize: 16 * 2,
            fontWeight: 'bold',
            fill: 0xffe040,
            align: 'center'
        });
        g.visible = false;
        g.position.x = this.orbitCenter.x - (180 * 2);
        g.position.y = this.orbitCenter.y - (170 * 2);

        this.updateAngleText(g, this.props.moonAngle);

        this.app.stage.addChild(g);
        return g;
    }
    updateAngle(g, moonAngle) {
        g.clear();
        g.moveTo(this.orbitCenter.x, this.orbitCenter.y);
        g.lineStyle(6, 0xffe040);
        g.beginFill(0xffe200, 0.7);
        g.arc(this.orbitCenter.x, this.orbitCenter.y,
              200 * 2,
              Math.PI, -moonAngle,
              // counter-clockwise?
              moonAngle < 0 && moonAngle > -Math.PI);

        g.lineTo(this.orbitCenter.x, this.orbitCenter.y);
        g.lineTo(170 * 2, 230 * 2);
    }
    updateAngleText(g, moonAngle) {
        g.text = getAngleDisplay(-moonAngle);
    }
    drawTimeCompass(timeCompassResource) {
        const timeCompass = new PIXI.Sprite(timeCompassResource.texture);
        timeCompass.name = 'timeCompass';
        timeCompass.width = 410 * 0.8 * 2;
        timeCompass.height = 260 * 0.8 * 2;
        timeCompass.position = this.orbitCenter;
        timeCompass.anchor.set(0.5);
        timeCompass.visible = false;

        this.app.stage.addChild(timeCompass);
        return timeCompass;
    }
    drawMoon(moonResource, highlightResource) {
        const pos = this.getMoonPos(this.props.moonAngle);

        const moonContainer = new PIXI.Container();
        moonContainer.name = 'moon';
        moonContainer.buttonMode = true;
        moonContainer.interactive = true;
        moonContainer.position = pos;
        moonContainer.position = this.orbitCenter;

        const highlight = new PIXI.Sprite(highlightResource.texture);
        highlight.visible = false;
        highlight.width = 30 * 2;
        highlight.height = 30 * 2;
        highlight.anchor.set(0.5);
        this.moonHighlight = highlight;
        moonContainer.addChild(highlight);

        const moon = new PIXI.Sprite(moonResource.texture);
        moon.name = 'moonObj';
        moon.width = 20 * 2;
        moon.height = 20 * 2;
        moon.anchor.set(0.5);
        moonContainer.addChild(moon);

        const landmark = new PIXI.Graphics();
        landmark.name = 'landmark';
        landmark.visible = false;
        landmark.lineStyle(4, 0xff95ff);
        landmark.moveTo(-10 * 2, 0);
        landmark.lineTo(-20 * 2, 0);
        this.landmark = landmark;
        moonContainer.addChild(this.landmark);

        // Shade the right half of the moon. This follows the moon
        // along its orbit.
        // Although the position of this object follows the moon, it
        // doesn't rotate with the moon.
        const shade = new PIXI.Graphics();
        shade.beginFill(0x000000);
        shade.alpha = 0.7;
        shade.arc(0, 0, 10 * 2, degToRad(-90), degToRad(90));
        moonContainer.addChild(shade);

        this.app.stage.addChild(moonContainer);
        return moonContainer;
    }
    /*
     * The earth's rotation in this view is determined by observerAngle.
     */
    drawEarth(earthResource, avatarResource, highlightResource) {
        const earthContainer = new PIXI.Container();
        earthContainer.pivot = this.orbitCenter;
        earthContainer.name = 'earth';
        earthContainer.buttonMode = true;
        earthContainer.interactive = true;
        earthContainer.position = this.orbitCenter;
        earthContainer.rotation = -this.props.observerAngle + degToRad(90);

        const highlight = new PIXI.Sprite(highlightResource.texture);
        highlight.visible = false;
        highlight.width = 90 * 2;
        highlight.height = 90 * 2;
        highlight.position = this.orbitCenter;
        highlight.anchor.set(0.5);
        this.earthHighlight = highlight;
        earthContainer.addChild(highlight);

        const earth = new PIXI.Sprite(earthResource.texture);
        earth.width = 70 * 2;
        earth.height = 70 * 2;
        earth.position = this.orbitCenter;
        earth.anchor.set(0.5);
        earth.rotation = -0.9;
        earthContainer.addChild(earth);

        const avatar = new PIXI.Sprite(avatarResource.texture);
        avatar.width = 27 * 0.9 * 2;
        avatar.height = 12.75 * 0.9 * 2;
        avatar.position = this.orbitCenter;
        avatar.position.x -= 42 * 2;
        avatar.anchor.set(0.5);
        earthContainer.addChild(avatar);

        // Add the earth to the scene we are building
        this.app.stage.addChild(earthContainer);

        // Shade the right half of the earth. Don't add this to the
        // container because it doesn't rotate with the earth.
        const shade = new PIXI.Graphics();
        shade.beginFill(0x000000);
        shade.alpha = 0.7;
        shade.arc(
            this.orbitCenter.x,
            this.orbitCenter.y,
            35 * 2,
            -Math.PI / 2,
            Math.PI / 2);
        this.app.stage.addChild(shade);

        return earthContainer;
    }
    drawText() {
        const sunlightText = new PIXI.Text('Sunlight', {
            fontFamily: 'Arial',
            fontSize: 28 * 2,
            fontWeight: 'bold',
            fill: 0xffff80,
            align: 'center'
        });
        sunlightText.rotation = degToRad(-90);
        sunlightText.position.x = 14 * 2;
        sunlightText.position.y = 270 * 2;
        this.app.stage.addChild(sunlightText);
    }
    drawArrows() {
        for (let i = 1; i < 8; i++) {
            let line = new PIXI.Graphics();
            line.lineStyle(4, 0xffff80);

            line.moveTo(60 * 2, (i * 50 + 30) * 2);
            line.lineTo(120 * 2, (i * 50 + 30) * 2);

            // Draw the arrowhead
            let arrowhead = new PIXI.Graphics()
                                    .beginFill(0xffff80)
                                    .drawPolygon([
                                        2 * 110, (i * 50 + 26) * 2,
                                        2 * 110, (i * 50 + 34) * 2,
                                        2 * 123, (i * 50 + 30) * 2
                                    ]);

            this.app.stage.addChild(line);
            this.app.stage.addChild(arrowhead);
        }
    }
    onDragStart(event) {
        this.props.stopAnimation();

        this.data = event.data;
        this.dragStartPos = this.data.getLocalPosition(this.app.stage);
        // Save the initial observer angle to use for offset.
        this.dragStartAngle = this.props.observerAngle;

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
    onEarthMove(e) {
        if (e.target && e.target.name === 'earth' &&
            !this.state.isHoveringOnEarth &&
            !this.draggingMoon
        ) {
            this.setState({isHoveringOnEarth: true});
        }
        if (!e.target && this.state.isHoveringOnEarth) {
            this.setState({isHoveringOnEarth: false});
        }

        if (this.draggingEarth) {
            const newPosition = this.data.getLocalPosition(this.app.stage);

            // This angle starts at the center of the earth. It's the
            // difference, in radians, between where the cursor was and
            // where it is now.
            const vAngle =
                Math.atan2(newPosition.y - this.orbitCenter.y,
                           newPosition.x - this.orbitCenter.x);

            const offset = Math.atan2(
                this.dragStartPos.y - this.orbitCenter.y,
                this.dragStartPos.x - this.orbitCenter.x) + (Math.PI / 2);

            this.props.onObserverAngleUpdate(
                // Offset vAngle with initial angle, as well as current
                // dragging offset angle.
                -vAngle + offset + (this.dragStartAngle - (Math.PI / 2)));
        }
    }
    onMoonMove(e) {
        if (e.target && e.target.name === 'moon' &&
            !this.state.isHoveringOnMoon &&
            !this.draggingEarth
        ) {
            this.setState({isHoveringOnMoon: true});
        }
        if (!e.target && this.state.isHoveringOnMoon) {
            this.setState({isHoveringOnMoon: false});
        }

        if (this.draggingMoon) {
            const newPosition = this.data.getLocalPosition(this.app.stage);

            // This angle starts at the center of the orbit. It's the
            // difference, in radians, between where the cursor was and
            // where it is now.
            const vAngle =
                Math.atan2(newPosition.y - this.orbitCenter.y,
                           newPosition.x - this.orbitCenter.x);

            this.props.onMoonAngleUpdate(-vAngle);
        }
    }
    getMoonPos(phase) {
        return new PIXI.Point(
            2 * 200 * Math.cos(-phase) + this.orbitCenter.x,
            2 * 200 * Math.sin(-phase) + this.orbitCenter.y);
    }
}

MainView.propTypes = {
    observerAngle: PropTypes.number.isRequired,
    moonAngle: PropTypes.number.isRequired,
    onObserverAngleUpdate: PropTypes.func.isRequired,
    onMoonAngleUpdate: PropTypes.func.isRequired,
    showAngle: PropTypes.bool.isRequired,
    showTimeTickmarks: PropTypes.bool.isRequired,
    showLunarLandmark: PropTypes.bool.isRequired,
    stopAnimation: PropTypes.func.isRequired
};
