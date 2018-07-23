import React from 'react';
import PropTypes from 'prop-types';
import {loadSprite} from './utils';

export default class MainView extends React.Component {
    constructor(props) {
        super(props);
        this.ball = null;
        this.raf = null;
        this.id = 'MainView'
    }
    render() {
        return <canvas id={this.id} width="600" height="460"></canvas>;
    }
    componentDidMount() {
        const canvas = document.getElementById(this.id);
        const ctx = canvas.getContext('2d');

        this.drawStatic(ctx, canvas);

        const me = this;
        loadSprite('img/moon.svg').then(function(img) {
            me.moon = img;
            me.drawMoon(img);
        });
    }
    componentDidUpdate(prevProps) {
        if (this.props.moonPos !== prevProps.moonPos) {
            this.drawMoon(this.moon);
        }
    }
    drawStatic(ctx, canvas) {
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.fill();

        this.drawOrbit(ctx);
    }
    drawOrbit(ctx) {
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = 'white';
        ctx.beginPath();
        ctx.arc(370, 230, 200, 0, Math.PI * 2, true);
        ctx.stroke();
    }
    drawMoon(img) {
        const canvas = document.getElementById(this.id);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(
            img,
            // x
            200 * Math.cos(this.props.moonPos) + 360,
            // y
            200 * Math.sin(this.props.moonPos) + 220,
            // Width and height
            20, 20);

        // Shade half of the moon
        ctx.beginPath();
        ctx.arc(
            // x
            200 * Math.cos(this.props.moonPos) + 370,
            // y
            200 * Math.sin(this.props.moonPos) + 230,
            10,
            Math.PI + (Math.PI / 2), Math.PI / 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fill();
    }
}

MainView.propTypes = {
    sunPos: PropTypes.number.isRequired,
    moonPos: PropTypes.number.isRequired
};
