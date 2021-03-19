import React from 'react';
import PropTypes from 'prop-types';
import * as PIXI from 'pixi.js';

export default class VisualDemo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDragging: false
        };

        this.resources = {};

        // The person avatar's eye level.
        this.eyePos = {
            x: 35 * 2,
            y: 85
        };

        this.onDragStart = this.onDragStart.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.onMove = this.onMove.bind(this);

        this.el = React.createRef();
    }
    render() {
        return <div className="pixi-scene"
                    ref={this.el}></div>;
    }
    componentDidMount() {
        const app = new PIXI.Application({
            backgroundColor: 0xffffff,
            width: 700 * 2,
            height: 200 * 2,
            resolution: 2,
            antialias: true,
            sharedTicker: true
        });

        app.loader.add('person', 'img/person.png');
        app.loader.add('ball', 'img/beachball.svg');

        const me = this;
        app.loader.load((loader, resources) => {
            me.resources = resources;

            // Draw all the items that won't move based on props changes.
            me.drawStatic(app, resources);

            // Draw the scene when this component is initialized.
            me.draw();
        });

        if (this.el && this.el.current) {
            this.el.current.appendChild(app.view);
        }

        this.app = app;
    }

    componentDidUpdate(prevProps) {
        if (this.props.distance !== prevProps.distance ||
            this.props.diameter !== prevProps.diameter
           ) {
            // Update the scene when this component has new prop
            // values that aren't reflected in the current scene.
            const size = this.unitToPixel(this.props.diameter);
            const dist = this.unitToPixel(this.props.distance);

            this.ball.position.x = dist - (size / 2);

            if (this.props.diameter !== prevProps.diameter) {
                this.ball.position.y = this.eyePos.y - (size / 2);
                this.ball.width = size;
                this.ball.height = size;
            }

            this.redrawLine1(this.lines.line1);
            this.redrawLine2(this.lines.line2);
            this.redrawArc(this.lines.arc);

            // re-position the alpha symbol
            const ratio = this.props.diameter / this.props.distance;
            this.lines.alphaText.position.y = 30 - (ratio * 80 * 2);
        }
    }
    drawStatic(app, resources) {
        this.drawPerson(app, resources.person);
    }
    /**
     * draw
     *
     * Draw the scene on the canvas.
     */
    draw() {
        this.lines = this.drawLines(this.app);
        this.ball = this.drawBall(this.app, this.resources.ball);
    }
    drawPerson(app, resource) {
        const person = new PIXI.Sprite(resource.texture);
        person.position.x = 10;
        person.position.y = 80;
        person.width *= 0.15;
        person.height *= 0.15;
        person.width *= 2;
        person.height *= 2;
        app.stage.addChild(person);
    }
    drawBall(app, resource) {
        const size = this.unitToPixel(this.props.diameter);
        const dist = this.unitToPixel(this.props.distance);
        const ball = new PIXI.Sprite(resource.texture);
        ball.interactive = true;
        ball.buttonMode = true;
        ball.position.x = dist - (size / 2);
        ball.position.y = this.eyePos.y - (size / 2);
        ball.width = size;
        ball.height = size;
        app.stage.addChild(ball);

        ball
        // events for drag start
          .on('pointerdown', this.onDragStart)
          .on('touchstart', this.onDragStart)
        // events for drag end
          .on('pointerup', this.onDragEnd)
          .on('pointerupoutside', this.onDragEnd)
          .on('touchend', this.onDragEnd)
          .on('touchendoutside', this.onDragEnd)
        // events for drag move
          .on('pointermove', this.onMove)
          .on('touchmove', this.onMove);

        return ball;
    }
    redrawLine1(line1) {
        const dist = this.unitToPixel(this.props.distance);
        line1.clear();
        line1.lineStyle(2);
        line1.moveTo(this.eyePos.x, this.eyePos.y);
        line1.lineTo(
            dist,
            this.eyePos.y + (this.unitToPixel(this.props.diameter / 2)));
    }
    redrawLine2(line2) {
        const dist = this.unitToPixel(this.props.distance);
        line2.clear();
        line2.lineStyle(2);
        line2.moveTo(this.eyePos.x, this.eyePos.y);
        line2.lineTo(
            dist,
            this.eyePos.y - (this.unitToPixel(this.props.diameter / 2)));
    }
    redrawArc(arc) {
        const ratio = this.props.diameter / this.props.distance;
        arc.clear();
        arc.lineStyle(2);
        arc.arc(
            55 * 2, this.eyePos.y,
            100 * 2,
            4 / (5 / ratio),
            -4 / (5 / ratio),
            true);
    }
    drawLines(app) {
        const line1 = new PIXI.Graphics();
        this.redrawLine1(line1);
        app.stage.addChild(line1);

        const line2 = new PIXI.Graphics();
        this.redrawLine2(line2);
        app.stage.addChild(line2);

        const ratio = this.props.diameter / this.props.distance;
        const alphaText = new PIXI.Text('α', {
            fontFamily: 'Arial',
            fontSize: 18 * 2,
            fill: 0x000000,
            align: 'center'
        });
        alphaText.position.x = 150 * 2;
        alphaText.position.y = 30 - (ratio * 80 * 2);
        app.stage.addChild(alphaText);

        const arc = new PIXI.Graphics();
        this.redrawArc(arc);
        app.stage.addChild(arc);

        return {
            arc: arc,
            line1: line1,
            line2: line2,
            alphaText: alphaText
        };
    }

    /**
     * Conversion functions to and from the scene's generic "units"
     * and pixel dimensions.
     */
    unitToPixel(n) {
        return (n * 11) * 2;
    }
    pixelToUnit(n) {
        return (n / 11) / 2;
    }

    onDragStart() {
        this.setState({isDragging: true});
    }
    onDragEnd() {
        this.setState({isDragging: false});
    }
    onMove(e) {
        if (this.state.isDragging) {
            const pos = e.data.getLocalPosition(this.app.stage);
            let d = Math.max(
                Math.min(this.pixelToUnit(pos.x) , 60), 20);
            // Round it to one decimal place
            d = Math.round(d * 10) / 10;
            this.props.onDistanceUpdate(d);
        }
    }
}

VisualDemo.propTypes = {
    distance: PropTypes.number.isRequired,
    diameter: PropTypes.number.isRequired,
    onDistanceUpdate: PropTypes.func.isRequired
};
