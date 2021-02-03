import React from 'react';
import { getWavelengthRGB} from "./utils/WavelengthToHex";
import { scaleLog } from 'd3/dist/d3';
import PropTypes from 'prop-types';

const WIDTH = 950;
const HEIGHT = 280;

const MIN_X_TRANSLATION = -200;
const MIN_Y_TRANSLATION = -310;

const energyLevelValues = [-13.598, -3.400, -1.511, -0.850, -0.544, -0.378];

const PLANCK_CONSTANT = 6.62607004e-34;
const COULOMB_CHARGE = 1.602176634e-19;
const LIGHT_SPEED = 299792458;

const getTranslationMatrix = (prev, curr) => {
    const energyToPixelMappings = [40, -10, -100, -220, -360, -550];
    let prevEnergyPixel = energyToPixelMappings[prev - 1];
    let currEnergyPixel = energyToPixelMappings[curr - 1];
    return (prevEnergyPixel + currEnergyPixel) / 2;
};

const convertToPixelFrequency = (freq) => {
    const scaledFreq = freq / 1e15;

    let logScale = scaleLog()
        .domain([0.00725, 3.7])
        .range([1, 99]);

    return 100 - logScale(scaledFreq);
};

export default class PhotonBeams extends React.Component {
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();
        this.initX = WIDTH;
        this.speed = 10;
        this.fadeIndex = 1;

        this.translateX = -200;
        this.translateY = -310;

        this.emissionEnergy = 0;

        this.isPlaying = false;
        this.orbitalDistances = [40, 110, 250, 420, 620, 880, 880];
        this.energyLevel = 1;

        this.animatePhotonFire = this.animatePhotonFire.bind(this);
        this.animatePhotonEmission = this.animatePhotonEmission.bind(this);
        this.startAnimation = this.startAnimation.bind(this);
        this.stopAnimation = this.stopAnimation.bind(this);
    }

    componentDidMount() {
        this.canvas = this.canvasRef.current;
        this.ctx = this.canvas.getContext("2d");
    }

    componentDidUpdate(prevProps) {
        this.energyLevel = prevProps.currentEnergyLevel;

        if (this.props.photon.fired && !this.isPlaying) {
            this.startAnimation();
            this.isPlaying = true;
        } else if (this.props.deexcitation) {
            this.startAnimation(prevProps);
        } else {
            this.isPlaying = false;
            this.stopAnimation();
        }
    }

    startAnimation(prevProps) {
        if (this.props.photon.fired) {
            this.initX = WIDTH;
            this.ctx.setTransform(1,0,0,1,0,0);
            this.raf = requestAnimationFrame(this.animatePhotonFire.bind(this));
        } else if (this.props.deexcitation) {
            if (
                prevProps.currentEnergyLevel !== this.props.currentEnergyLevel
                    && prevProps.currentEnergyLevel !== 7
            ) {
                this.initX = HEIGHT / 2;
                let translation = getTranslationMatrix(
                    prevProps.currentEnergyLevel,
                    this.props.currentEnergyLevel);

                this.emissionEnergy = energyLevelValues[
                    prevProps.currentEnergyLevel - 1] - energyLevelValues[
                        this.props.currentEnergyLevel - 1];

                this.translateX = MIN_X_TRANSLATION + translation;
                this.translateY = MIN_Y_TRANSLATION + translation;

                this.ctx.setTransform(1,0,0,1,0,0);
                this.ctx.rotate(3 * Math.PI / 4);
                this.ctx.translate(this.translateX, this.translateY);
                this.raf = requestAnimationFrame(this.animatePhotonEmission.bind(this));
            }
        }
    }

    stopAnimation() {
        cancelAnimationFrame(this.raf);
    }

    plotSine(amplitude, frequency, wavelength, rgb) {
        let x = this.initX;
        let x2 = this.initX + wavelength;
        let y = 0;

        let transparency = 1;
        let incrementValue = 1;

        while (x < x2) {
            let prevX = x - incrementValue;
            let prevY = HEIGHT / 2 + amplitude * Math.sin((x - incrementValue) / frequency);

            y = HEIGHT/2 + amplitude * Math.sin((x)/frequency);
            this.ctx.beginPath();
            this.ctx.lineWidth = 4;
            this.ctx.strokeStyle = rgb.substring(0, rgb.length - 1) +
                `,${transparency})`;
            this.ctx.moveTo(prevX, prevY);
            this.ctx.lineTo(x, y);

            this.ctx.stroke();
            x += incrementValue;

            transparency = 1 - ((x - this.initX) / (wavelength));
            transparency *= this.fadeIndex;
        }

        this.ctx.stroke();
    }

    animatePhotonEmission() {
        this.ctx.clearRect(0, 0, WIDTH, HEIGHT);

        let photonFrequency = (this.emissionEnergy / PLANCK_CONSTANT) * COULOMB_CHARGE;
        let photonWavelength = ((PLANCK_CONSTANT * LIGHT_SPEED) / this.emissionEnergy) / COULOMB_CHARGE;
        let amplitude = 10;
        let frequency = convertToPixelFrequency(photonFrequency);
        let photonColorRGB = getWavelengthRGB(photonWavelength * 1e9);

        let wavelength = 150;

        this.plotSine(amplitude, frequency, wavelength, photonColorRGB);

        let end = -100;
        this.initX -= (this.speed - 5);

        this.raf = requestAnimationFrame(this.animatePhotonEmission);

        if (this.initX <= end) {
            this.ctx.translate(-this.translateX, -this.translateY);
            this.ctx.rotate(-3 * Math.PI / 4);

            this.initX = WIDTH;
            this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
            this.stopAnimation();
            this.props.changeDeExcitationState();
        }
    }

    animatePhotonFire() {
        this.ctx.clearRect(0, 0, WIDTH, HEIGHT);

        let photonFrequency = (this.props.photon.energyValue / PLANCK_CONSTANT) * COULOMB_CHARGE;

        let amplitude = 10;
        let frequency = convertToPixelFrequency(photonFrequency);
        let wavelength = 150;
        this.plotSine(amplitude, frequency, wavelength, this.props.photon.color);

        let end = -wavelength;
        this.initX -= this.speed;

        this.raf = requestAnimationFrame(this.animatePhotonFire);
        if (!this.props.photon.passThrough) {
            end = this.orbitalDistances[this.energyLevel - 1] - 20;
        }

        if (this.initX <= end) {
            this.initX = WIDTH;
            this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
            this.stopAnimation();
            this.props.stopPhotonAnimation();
            this.props.changeElectronState(true);
            this.props.startDeExcitation();
        }
    }

    render() {
        return(
            <div>
                <canvas ref={this.canvasRef} width={WIDTH} height={HEIGHT} />
            </div>
        )
    }
}

PhotonBeams.propTypes = {
    currentEnergyLevel: PropTypes.number.isRequired,
    startDeExcitation: PropTypes.func.isRequired,
    changeElectronState: PropTypes.func.isRequired,
    changeDeExcitationState: PropTypes.func.isRequired,
    stopPhotonAnimation: PropTypes.func.isRequired,
    deexcitation: PropTypes.bool.isRequired,
    photon: PropTypes.object.isRequired
}
