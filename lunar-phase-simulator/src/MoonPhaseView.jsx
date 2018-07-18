import React from 'react';
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
    }
    drawMoon(ctx) {
        ctx.drawImage(this.moon, 0, 0, 228, 215);
    }
}
