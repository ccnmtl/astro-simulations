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
        this.drawMoon(ctx);
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
    drawMoon(ctx) {
        loadSprite('img/moon.svg').then(function(img) {
            ctx.drawImage(
                img,
                150, 210,
                40, 40);
        });
    }
}

MainView.propTypes = {
    sunPos: PropTypes.number.isRequired,
    moonPos: PropTypes.number.isRequired
};
