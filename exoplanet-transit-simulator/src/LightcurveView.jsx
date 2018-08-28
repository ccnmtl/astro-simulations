import React from 'react';
import PropTypes from 'prop-types';
import * as PIXI from 'pixi.js';
import Viewport from 'pixi-viewport';

export default class LightcurveView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDragging: false
        };

        this.onDragStart = this.onDragStart.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.onMove = this.onMove.bind(this);
    }
    render() {
        return <div ref={(el) => {this.el = el}}></div>;
    }
    componentDidMount() {
        const viewport = new Viewport({
            screenWidth: 400,
            screenHeight: 220,
            worldWidth: 500,
            worldHeight: 500 * (220 / 400)
        });
        this.viewport = viewport;
        this.viewport
            .drag()
            .wheel()
            .zoom();

        const app = new PIXI.Application({
            backgroundColor: 0xffffff,
            width: 480,
            height: 300,
            sharedLoader: true,
            sharedTicker: true,
            forceCanvas: true
        });
        this.app = app;
        this.el.appendChild(app.view);

        this.app.stage.addChild(viewport);
        viewport.position.x = 50;

        this.drawBorder(viewport);
        this.drawScene(viewport);
        this.drawInfo(this.app);
    }

    drawLine(viewport, x, y, width, height, tint = 0x000000) {
        const line = viewport.addChild(new PIXI.Sprite(PIXI.Texture.WHITE));
        line.tint = tint;
        line.position.set(x, y);
        line.width = width;
        line.height = height;
    }

    drawBorder(viewport) {
        const BORDER = 1;
        this.drawLine(
            viewport,
            0, 0, viewport.worldWidth, BORDER);
        this.drawLine(
            viewport,
            0, viewport.worldHeight - BORDER, viewport.worldWidth, BORDER);
        this.drawLine(
            viewport,
            0, 0, BORDER, viewport.worldHeight);
        this.drawLine(
            viewport,
            viewport.worldWidth - BORDER, 0, BORDER, viewport.worldHeight);
    }

    drawScene(viewport) {
        const star = new PIXI.Graphics();
        star.beginFill(0xff0000);
        star.drawCircle(
            450 / 2,
            200 / 2,
            45);
        star.endFill();
        viewport.addChild(star);

        this.drawLine(
            viewport,
            0, viewport.worldHeight / 2,
            viewport.worldWidth, 1,
            0x0000ee);
    }

    drawInfo(app) {
        const line = new PIXI.Graphics()
        line.lineStyle(2, 0x000000);
        line.moveTo(70, 240);
        line.lineTo(430, 240);
        app.stage.addChild(line);
    }

    onDragStart(e) {
        this.dragStartPos = e.data.getLocalPosition(this.app.stage);
        this.setState({isDragging: true});
    }
    onDragEnd() {
        this.setState({isDragging: false});
    }
    onMove() {
        if (this.state.isDragging) {
            //const pos = e.data.getLocalPosition(this.app.stage);
        }
    }
}

LightcurveView.propTypes = {
    phase: PropTypes.number.isRequired
};
