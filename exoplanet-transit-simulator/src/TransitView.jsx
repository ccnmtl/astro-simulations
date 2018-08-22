import React from 'react';
import PropTypes from 'prop-types';
import * as PIXI from 'pixi.js';

export default class TransitView extends React.Component {
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
        const app = new PIXI.Application({
            backgroundColor: 0x000000,
            width: 350,
            height: 350,
            sharedLoader: true,
            sharedTicker: true,
            forceCanvas: true
        });
        this.app = app;
        this.el.appendChild(app.view);
        this.drawScene(app);
    }
    drawScene(app) {
        const starRadius = 70;
        const star = new PIXI.Graphics();
        star.beginFill(0xfffafa);
        star.drawCircle(
            app.view.width / 2,
            app.view.height / 2,
            starRadius);
        star.endFill();
        app.stage.addChild(star);

        const phaseLine = new PIXI.Graphics();
        phaseLine.lineStyle(1, 0xd0d0d0);
        phaseLine.moveTo(
            (app.view.width / 2) - starRadius - 20,
            (app.view.height / 2) + 25)
        phaseLine.lineTo(
            (app.view.width / 2) + starRadius + 20,
            (app.view.height / 2) + 25)
        app.stage.addChild(phaseLine);

        const planetRadius = 10;
        const planet = new PIXI.Graphics();
        planet.beginFill(0xa0a0a0);
        planet.drawCircle(
            app.view.width / 2,
            (app.view.height / 2) + 25,
            planetRadius);
        planet.endFill();
        app.stage.addChild(planet);
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

TransitView.propTypes = {
    phase: PropTypes.number.isRequired
};
