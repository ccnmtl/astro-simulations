import React from 'react';
import PropTypes from 'prop-types';
import * as PIXI from 'pixi.js';
import {degToRad} from './utils';

export default class MainView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isHoveringOnEarth: false,
            isHoveringOnMoon: false
        };

        this.resources = {};

        this.orbitCenter = new PIXI.Point(370, 230);

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

            me.moon = me.drawMoon(resources.moon, resources.highlight);
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

            me.earth = me.drawEarth(
                resources.earth,
                resources.avatar,
                resources.highlight);

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
        this.moon.position = this.getMoonPos(this.props.moonPhase);

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

        this.frameId = window.requestAnimationFrame(this.animate);
    }
    drawOrbit() {
        const graphics = new PIXI.Graphics();
        graphics.lineColor = 0xffffff;
        graphics.lineWidth = 1;
        graphics.drawCircle(this.orbitCenter.x, this.orbitCenter.y, 200);
        this.app.stage.addChild(graphics);
    }
    drawMoon(moonResource, highlightResource) {
        const pos = this.getMoonPos(this.props.moonPhase);

        const moonContainer = new PIXI.Container();
        moonContainer.name = 'moon';
        moonContainer.buttonMode = true;
        moonContainer.interactive = true;
        moonContainer.position = pos;
        moonContainer.position = this.orbitCenter;

        const highlight = new PIXI.Sprite(highlightResource.texture);
        highlight.visible = false;
        highlight.width = 30;
        highlight.height = 30;
        highlight.anchor.set(0.5);
        this.moonHighlight = highlight;
        moonContainer.addChild(highlight);

        const moon = new PIXI.Sprite(moonResource.texture);
        moon.width = 20;
        moon.height = 20;
        moon.anchor.set(0.5);
        moonContainer.addChild(moon);

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
        highlight.width = 100;
        highlight.height = 100;
        highlight.position = this.orbitCenter;
        highlight.anchor.set(0.5);
        this.earthHighlight = highlight;
        earthContainer.addChild(highlight);

        const earth = new PIXI.Sprite(earthResource.texture);
        earth.width = 70;
        earth.height = 70;
        earth.position = this.orbitCenter;
        earth.anchor.set(0.5);
        earthContainer.addChild(earth);

        const avatar = new PIXI.Sprite(avatarResource.texture);
        avatar.width = 27;
        avatar.height = 12.75;
        avatar.position = this.orbitCenter;
        avatar.position.x -= 42;
        avatar.anchor.set(0.5);
        earthContainer.addChild(avatar);

        // Add the earth to the scene we are building
        this.app.stage.addChild(earthContainer);

        // Shade the right half of the earth. Don't add this to the
        // container because it doesn't rotate with the earth.
        const shade = new PIXI.Graphics();
        shade.beginFill(0x000000);
        shade.alpha = 0.7;
        shade.drawRect(
            this.orbitCenter.x,
            this.orbitCenter.y - 60,
            60, 120);
        this.app.stage.addChild(shade);

        return earthContainer;
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
    onEarthDragMove(e) {
        if (e.target && e.target.name === 'earth' &&
            !this.state.isHoveringOnEarth
        ) {
            this.setState({isHoveringOnEarth: true});
        }
        if (!e.target && this.state.isHoveringOnEarth) {
            this.setState({isHoveringOnEarth: false});
        }

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
    onMoonDragMove(e) {
        if (e.target && e.target.name === 'moon' &&
            !this.state.isHoveringOnMoon
        ) {
            this.setState({isHoveringOnMoon: true});
        }
        if (!e.target && this.state.isHoveringOnMoon) {
            this.setState({isHoveringOnMoon: false});
        }

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
    getMoonPos(phase) {
        return new PIXI.Point(
            200 * Math.cos(-phase) + this.orbitCenter.x,
            200 * Math.sin(-phase) + this.orbitCenter.y);
    }
}

MainView.propTypes = {
    observerAngle: PropTypes.number.isRequired,
    moonPhase: PropTypes.number.isRequired,
    onObserverAngleUpdate: PropTypes.func.isRequired,
    onMoonPosUpdate: PropTypes.func.isRequired
};
