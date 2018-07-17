import React from 'react';
import PropTypes from 'prop-types';
import {loadSprite} from './utils';

export default class VisualDemo extends React.Component {
    constructor(props) {
        super(props);
        this.person = null;
        this.ball = null;

        this.raf = null;

        // The person avatar's eye level.
        this.eyePos = {
            x: 35,
            y: 85
        };
    }
    render() {
        return <canvas id="VisualDemo" width="600" height="200"></canvas>;
    }
    componentDidMount() {
        const me = this;
        this.loadSprites().then(function() {
            // Draw all the items that won't move based on props changes.
            me.drawStatic();

            // Draw the scene when this component is initialized.
            me.draw();
            window.requestAnimationFrame(me.draw.bind(me));
        });
    }
    componentDidUpdate(prevProps) {
        if (this.props.distance !== prevProps.distance ||
            this.props.diameter !== prevProps.diameter
           ) {
            // Update the scene when this component has new prop
            // values that aren't reflected in the current scene.
            //this.draw();
            this.raf = window.requestAnimationFrame(this.draw.bind(this));
        }
    }
    /**
     * loadSprites
     *
     * Load the assets necessary for this canvas view and store them
     * on the component. This should only be done once, when the
     * component loads, to avoid flickering during user interaction.
     */
    loadSprites() {
        const me = this;

        // TODO: make these loads concurrent
        return loadSprite('img/person.png').then(function(img) {
            me.person = img;
            return loadSprite('img/beachball.svg');
        }).then(function(img) {
            me.ball = img;
        });
    }
    drawStatic() {
        const canvas = document.getElementById('VisualDemo');
        const ctx = canvas.getContext('2d');

        this.drawPerson(ctx);
        this.raf = window.requestAnimationFrame(this.draw.bind(this));
    }
    /**
     * draw
     *
     * Draw the scene on the canvas.
     */
    draw() {
        const canvas = document.getElementById('VisualDemo');
        const ctx = canvas.getContext('2d');

        // Clear the section of the canvas that gets re-drawn.
        ctx.clearRect(40, 0, canvas.width, canvas.height);
        ctx.beginPath();

        this.drawLines(ctx);
        this.drawBall(ctx);
    }
    drawPerson(ctx) {
        ctx.drawImage(this.person, 0, 80, 40, 118.2);
    }
    drawBall(ctx) {
        const size = this.props.diameter * 15;
        const dist = this.props.distance * 5;
        ctx.drawImage(
            this.ball,
            200 + dist - (size / 2),
            75 - (size / 2),
            size, size);
    }
    drawLines(ctx) {
        // TODO: clean up the duplicate calculations here.
        const dist = this.props.distance * 5;
        const ratio = this.props.diameter / this.props.distance;

        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.eyePos.x, this.eyePos.y);
        ctx.lineTo(200 + dist, 75 + (this.props.diameter / 2 * 14));
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.eyePos.x, this.eyePos.y);
        ctx.lineTo(200 + dist, 75 - (this.props.diameter / 2 * 14));
        ctx.stroke();

        ctx.font = '18px serif';
        ctx.fillText('α', 150, 70 - (ratio * 66));

        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(155, 82 - (ratio * 66));
        ctx.lineTo(155, 82 + (ratio * 66));
        ctx.stroke();
    }
}

VisualDemo.propTypes = {
    distance: PropTypes.number.isRequired,
    diameter: PropTypes.number.isRequired
};
