import React from 'react';
import { getWavelengthHex, getWavelengthRGB } from "./utils/WavelengthToHex";
import Button from "./utils/Button";
import {RangeStepInput} from 'react-range-step-input';
import PropTypes from 'prop-types';

const PLANCK_CONSTANT = 6.62607004e-34;
const COULOMB_CHARGE = 1.602176634e-19;
const LIGHT_SPEED = 299792458;

export default class Slider extends React.Component {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
        this.bg = `linear-gradient(90deg, #00ffc0 16.5%, #d7dcdf 16.6%)`;
        this.criticalPhotonEVs = [0.66, 0.97, 1.13, 1.89, 2.55, 2.86, 3.02, 10.2, 12.09, 12.75, 13.06, 13.22];
    }

    onPhotonValueChange(e, fire) {
        // If the photon is currently being fired, then don't update anything
        if (this.props.photon.fired) return;

        const getSnappedOnEnergyValues = (energy) => {
            let epsilon = 0.04;
            let energyValue = energy;
            this.criticalPhotonEVs.forEach((element) => {
                if (energy < (element + epsilon) && energy > (element - epsilon)) energyValue = element;
            });

            return energyValue;
        };

        let newEnergyValue = getSnappedOnEnergyValues(Number.parseFloat(e.target.value));
        let photonFrequency = (newEnergyValue / PLANCK_CONSTANT) * COULOMB_CHARGE;
        let photonWavelength = ((PLANCK_CONSTANT * LIGHT_SPEED) / newEnergyValue) / COULOMB_CHARGE;
        let photonColorHex = getWavelengthHex(photonWavelength * 1e9);
        let photonColorRGB = getWavelengthRGB(photonWavelength * 1e9);

        let newPhoton = this.props.photon;

        newPhoton.frequency = photonFrequency;
        newPhoton.wavelength = photonWavelength;
        newPhoton.energyValue = newEnergyValue;
        newPhoton.color = photonColorRGB;

        this.styling(newEnergyValue, photonColorHex);
        this.props.changePhoton(newPhoton, fire);
    }

    styling(energy, color) {
        const settings = {
            fill: color,
            background: '#d7dcdf'
        };

        const percentage = 100 * (energy - 0.03) / (15 - 0.03);
        this.bg = `linear-gradient(90deg, ${settings.fill} ${percentage}%, ${settings.background} ${percentage+0.1}%)`;
    }

    changeSlider(e) {
        let value = {
            target: {
                value: 0
            }
        };

        value.target.value = e;
        this.onPhotonValueChange(value, true);
    }

    render() {
        return (
            <React.Fragment>
                <div className={"range-slider"}>
                    <RangeStepInput
                        type="range"
                        min={0.03}
                        max={15.00}
                        step={0.01}
                        style={{background: this.bg}}
                        className="range-slider__range form-control-range mb-3"
                        id={"slider"}
                        value={this.props.photon.energyValue}
                        onChange={this.onPhotonValueChange.bind(this)}
                    />
                </div>

                <Button
                    symbol={"Pα"}
                    id={"Pa"}
                    changeSliderValue={() => {
                        this.changeSlider(0.66);
                    }}
                />


                <Button
                    symbol={"Pᵦ"}
                    id={"Pb"}
                    changeSliderValue={() => { this.changeSlider(0.97)}}
                />

                <Button
                    symbol={"Pᵧ"}
                    id={"Py"}
                    changeSliderValue={() => { this.changeSlider(1.13)}}
                />

                <Button
                    symbol={"Hα"}
                    id={"Ha"}
                    changeSliderValue={() => { this.changeSlider(1.89)}}
                />

                <Button
                    symbol={"Hᵧ"}
                    id={"Hy"}
                    changeSliderValue={() => { this.changeSlider(2.86)}}
                />

                <Button
                    symbol={"Hᵦ"}
                    id={"Hb"}
                    changeSliderValue={() => { this.changeSlider(2.55)}}
                />

                <Button
                    symbol={"Hδ"}
                    id={"Hd"}
                    changeSliderValue={() => { this.changeSlider(3.02)}}
                />

                <Button
                    symbol={"Lα"}
                    id={"La"}
                    changeSliderValue={() => { this.changeSlider(10.2)}}
                />

                <Button
                    symbol={"Lᵦ"}
                    id={"Lb"}
                    changeSliderValue={() => { this.changeSlider(12.09)}}
                />

                <Button
                    symbol={"Lᵧ"}
                    id={"Ly"}
                    changeSliderValue={() => { this.changeSlider(12.75)}}
                />

                <Button
                    symbol={"Lε"}
                    id={"Le"}
                    changeSliderValue={() => { this.changeSlider(13.22)}}
                />

                <Button
                    symbol={"Lδ"}
                    id={"Ld"}
                    changeSliderValue={() => { this.changeSlider(13.06)}}
                />
            </React.Fragment>

        );
    }
}

Slider.propTypes = {
    changePhoton: PropTypes.func.isRequired,
    photon: PropTypes.object.isRequired
}
