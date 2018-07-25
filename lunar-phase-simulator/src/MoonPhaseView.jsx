import React from 'react';
import PropTypes from 'prop-types';
import {loadSprite} from './utils';

export default class MoonPhaseView extends React.Component {
    constructor(props) {
        super(props);
        this.id = 'MoonPhaseView'
        this.moon = null;
    }
    render() {
        return <div>
            <select className="custom-select form-control-sm" defaultValue={1}>
                <option value={1}>New Moon</option>
                <option value={2}>Waxing Crescent</option>
                <option value={3}>First Quarter</option>
                <option value={4}>Waxing Gibbous</option>
                <option value={5}>Full Moon</option>
                <option value={6}>Waning Gibbous</option>
                <option value={7}>Third Quarter</option>
                <option value={8}>Waning Crescent</option>
            </select>
            <canvas className="mt-1" id={this.id}
                    width="228" height="215"></canvas>
        </div>;
    }
    componentDidMount() {
        const me = this;
        this.loadSprites().then(function() {
            me.draw();
        });
    }
    loadSprites() {
        const me = this;
        return loadSprite('img/moon.png').then(function(img) {
            me.moon = img;
        });
    }
    draw() {
        const canvas = document.getElementById(this.id);
        const ctx = canvas.getContext('2d');
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.fill();

        this.drawMoon(ctx);
        let phase = 0;
        this.drawPhase(ctx, canvas, phase);
    }
    drawMoon(ctx) {
        ctx.drawImage(this.moon, 0, 0, 228, 215);
    }
    // Shade the moon
    drawPhase(ctx, canvas, phase) {
        //ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        const radius = 100;

        ctx.beginPath();
        ctx.arc(radius + 14, radius + 8, radius, -Math.PI/2, Math.PI/2, true);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();

        ctx.translate( radius, radius );
        ctx.scale( phase, 1 );
        ctx.translate( -radius, -radius );
        ctx.beginPath();
        ctx.arc(radius, radius, radius, -Math.PI/2, Math.PI/2, true);
        ctx.closePath();
        ctx.fillStyle = phase > 0 ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';
        ctx.fill();
    }
}

MoonPhaseView.propTypes = {
    observerAngle: PropTypes.number.isRequired,
    moonPos: PropTypes.number.isRequired
};
