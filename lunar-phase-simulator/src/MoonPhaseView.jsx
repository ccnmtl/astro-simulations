import React from 'react';
import PropTypes from 'prop-types';
import {
    loadSprite, forceNumber, degToRad, radToDeg, getPercentIlluminated,
    roundToOnePlace
} from './utils';

export default class MoonPhaseView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isHidden: false
        }
        this.id = 'MoonPhaseView'
        this.moon = null;
        this.frameId = null;
        this.radius = 100;

        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.animate = this.animate.bind(this);
    }
    render() {
        const phaseSlot = this.getPhaseSlot(this.props.moonPhase);
        return <div>
            <div style={{
                visibility: this.state.isHidden ? 'hidden' : 'visible'
            }}>
                <select className="custom-select"
                        onChange={this.onMoonPhaseUpdate.bind(this)}
                        value={phaseSlot}>
                    <option value={180}>New Moon</option>
                    <option value={-135}>Waxing Crescent</option>
                    <option value={-90}>First Quarter</option>
                    <option value={-45}>Waxing Gibbous</option>
                    <option value={0}>Full Moon</option>
                    <option value={45}>Waning Gibbous</option>
                    <option value={90}>Third Quarter</option>
                    <option value={135}>Waning Crescent</option>
                </select>
                <canvas
                    className="mt-1" id={this.id}
                    width="228" height="215"></canvas>
                <div className="text-center">
                    {
                        roundToOnePlace(getPercentIlluminated(
                            this.props.moonPhase - Math.PI))
                    }% illuminated
                </div>
                <div className="text-center">Time since new moon:</div>
                <div className="text-center">0 hours</div>
            </div>
            <div className="text-right">
                <button type="button"
                        onClick={this.onHideShowToggle.bind(this)}
                        className="btn btn-primary btn-sm">
                    {this.state.isHidden ? 'Show' : 'Hide'}
                </button>
            </div>
        </div>;
    }
    componentDidMount() {
        const me = this;
        this.loadSprites().then(function() {
            me.draw();
            me.start();
        });
    }
    animate() {
        this.draw();

        this.frameId = requestAnimationFrame(this.animate);
    }
    start() {
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.animate);
        }
    }
    stop() {
        cancelAnimationFrame(this.frameId)
    }
    loadSprites() {
        const me = this;
        return loadSprite('img/moon.png').then(function(img) {
            me.moon = img;
        });
    }
    draw() {
        this.canvas = document.getElementById(this.id);
        const ctx = this.canvas.getContext('2d');

        this.drawMoon(ctx);
        this.paint(ctx, this.convertPhase(this.props.moonPhase));
    }
    drawMoon(ctx) {
        ctx.drawImage(this.moon, 0, 0, 228, 215);
    }
    // This moon phase painter is adapted from:
    // https://codepen.io/anowodzinski/pen/ZWKXPQ/
    drawPhase(ctx, phase) {
        ctx.beginPath();
        ctx.arc(this.radius + 14, this.radius + 7,
                this.radius + 1, -Math.PI/2, Math.PI/2, true);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fill();

        ctx.translate(this.radius + 14, this.radius);
        ctx.scale(phase, 1);
        ctx.translate(-this.radius + 14, -this.radius);
        ctx.beginPath();
        ctx.arc(this.radius - 14, this.radius + 7,
                this.radius + 1, -Math.PI/2, Math.PI/2, true);
        ctx.closePath();
        ctx.fillStyle = phase > 0 ? 'rgba(255, 255, 255, 0.7)' :
                                'rgba(0, 0, 0, 0.7)';
        ctx.fill();
    }
    paint(ctx, phase) {
        ctx.save();

        if (phase <= 0.5) {
            this.drawPhase(ctx, 4 * phase - 1);
        } else {
            ctx.translate(this.radius + 28, this.radius + 14);
            ctx.rotate(Math.PI);
            ctx.translate(-this.radius, -this.radius);

            this.drawPhase(ctx, 4 * (1 - phase) - 1);
        }

        ctx.restore();
    }
    /**
     * Get the moonPhase value that's used by the rest of the system
     * ready for the moon phase painter.
     *
     * moonPhase is offset by pi (its initial value is Math.PI, see
     * initial state in main.jsx), and also divide it by 2 * pi
     * because moonPhase is in radians and the moon phase painter
     * expects the phase to be a number between 0 and 1.
     */
    convertPhase(moonPhase) {
        const phase = (moonPhase - Math.PI) / (Math.PI * 2);
        if (phase > 1) {
            return 0;
        }
        if (phase < 0) {
            return phase + 1;
        }
        return phase;
    }
    onMoonPhaseUpdate(e) {
        this.props.onMoonPhaseUpdate(
            degToRad(forceNumber(e.target.value))
        );
    }
    onHideShowToggle() {
        this.setState({isHidden: !this.state.isHidden});
    }
    /*
     * Given the exact moon phase, return the broad bucket that this
     * phase is called in this interactive. This is used to keep the
     * phase dropdown up to date with the current scenario.
     */
    getPhaseSlot(moonPhase) {
        const phase = radToDeg(moonPhase);

        // New Moon
        if (Math.abs(phase - 180) < 22.5 / 2) {
            return 180;
        }

        // Waxing Crescent
        if (Math.abs(phase + 135) < 22.5) {
            return -135;
        }

        // First Quarter
        if (Math.abs(phase + 90) < 22.5) {
            return -90;
        }

        // Waxing Gibbous
        if (Math.abs(phase + 45) < 22.5) {
            return -45;
        }

        // Full Moon
        if (Math.abs(phase) < 22.5 / 2) {
            return 0;
        }

        // Waning Gibbous
        if (Math.abs(phase - 45) < 22.5) {
            return 45;
        }

        // Third Quarter
        if (Math.abs(phase - 90) < 22.5) {
            return 90;
        }

        // Waning Crescent
        if (Math.abs(phase - 135) < 22.5) {
            return 135;
        }

        return 180;
    }
}

MoonPhaseView.propTypes = {
    moonPhase: PropTypes.number.isRequired,
    onMoonPhaseUpdate: PropTypes.func.isRequired
};
