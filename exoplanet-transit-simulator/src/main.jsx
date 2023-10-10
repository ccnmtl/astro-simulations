import React from 'react';
import { createRoot } from 'react-dom/client';
import Lightcurve from './Lightcurve';
import LightcurveView from './LightcurveView';
import TransitView from './TransitView';
import {RangeStepInput} from 'react-range-step-input';

import {
    forceNumber, roundToOnePlace,
    formatNumber, getTimeString
} from './utils';

import {
    getLuminosityFromMass, getTempFromLuminosity,
    getRadiusFromTempAndLuminosity,
    getSpectralTypeFromTemp
} from './star-utils';

import {systemPresets} from './presets';


const getEclipseText = function(duration, period) {
    if (duration === null || duration === 0) {
        return '(no eclipse)';
    }

    return `Eclipse takes ${getTimeString(duration)} ` +
           `of ${getTimeString(period)} orbit.`;
};

const getEclipseDepthText = function(depth, duration) {
    if (duration === null || duration === 0) {
        return '(no eclipse)';
    }

    return 'Eclipse depth: ' + formatNumber(depth, 3);
}


class ExoplanetTransitSimulator extends React.Component {
    constructor(props) {
        super(props);
        this.initialState = {
            selectedPreset: 0,
            preset: 0,

            // Lightcurve view settings
            showTheoreticalCurve: true,
            showSimulatedMeasurements: false,
            noise: 0.1,
            simMeasurementNumber: 50,

            // Planet properties
            planetMass: 0.657,
            planetRadius: 1.32,
            // planetSemimajorAxis is "separation" in the actionscript sources
            planetSemimajorAxis: 0.047,
            planetEccentricity: 0,

            // Star properties
            starMass: 1.09,

            // System orientation and phase
            inclination: 86.929,
            longitude: 0,

            phase: 0.5,

            // These values change as the lightcurve changes. They
            // represent just a tiny part of the planet's orbit.
            minPhase: 0,
            maxPhase: 1
        };

        this.inputs = [
            'noise',
            'simMeasurementNumber',
            'planetMass',
            'planetRadius',
            'planetSemimajorAxis',
            'planetEccentricity',
            'starMass',
            'inclination',
            'longitude'
        ];

        this.initialState = this.initializeNumberInputs(
            this.initialState, this.inputs);

        this.state = this.initialState;

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleInputBlur = this.handleInputBlur.bind(this);
        this.onPhaseUpdate = this.onPhaseUpdate.bind(this);
        this.onPresetSelect = this.onPresetSelect.bind(this);
        this.onPresetSet = this.onPresetSet.bind(this);

        this.lightcurve = new Lightcurve();
        this.lightcurve.setCPhase(this.state.phase);
        this.lightcurveCoords = [];
        this.lightcurveLabelCoords = [];

        this.transitViewRef = React.createRef();

        this.updateParameters();
    }
    /**
     * Set up initial input field state.
     */
    initializeNumberInputs(state, inputs) {
        let newState = state;

        inputs.forEach(function(name) {
            newState[new String(name) + 'Field'] = state[new String(name)];
        });

        return newState;
    }
    componentDidMount() {
        this.updateParameters();
    }
    componentDidUpdate(prevProps, prevState) {
        const me = this;
        this.inputs.forEach(function(name) {
            if (prevState[new String(name)] !== me.state[new String(name)]) {
                // Update the number field
                me.setState({
                    [new String(name) + 'Field']: me.state[new String(name)]
                });
            }
        });

        if (
            prevState.starMass !== this.state.starMass ||
            prevState.planetSemimajorAxis !== this.state.planetSemimajorAxis ||
            prevState.planetMass !== this.state.planetMass ||
            prevState.planetRadius !== this.state.planetRadius ||
            prevState.inclination !== this.state.inclination ||
            prevState.longitude !== this.state.longitude ||
            prevState.planetEccentricity !== this.state.planetEccentricity
        ) {
            this.setState({
                minPhase: this.lightcurve._minPhase,
                maxPhase: this.lightcurve._maxPhase
            });
            this.updateParameters();
        }

        if (prevState.phase !== this.state.phase) {
            this.lightcurve.setCPhase(this.state.phase);
            if (this.transitViewRef) {
                this.transitViewRef.current.setPhase(
                    this.lightcurve.getCursorPhase());
            }
        }
    }
    render() {

        const lum = getLuminosityFromMass(this.state.starMass);
        const starTemp = getTempFromLuminosity(lum);
        const starRadius = getRadiusFromTempAndLuminosity(starTemp, lum);

        const st = getSpectralTypeFromTemp(starTemp);
        const starType = st.type + Math.round(st.number) + st.starClass;

        return <React.Fragment>
            <nav className="navbar navbar-expand-md navbar-light bg-light d-flex justify-content-between">
                <span className="navbar-brand mb-0 h1">Exoplanet Transit Simulator</span>

                <ul className="navbar-nav">
                    <li className="nav-item">
                        <a className="nav-link" href="#" onClick={this.onResetClick.bind(this)}>Reset</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#" data-toggle="modal" data-target="#helpModal">Help</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#" data-toggle="modal" data-target="#aboutModal">About</a>
                    </li>
                </ul>
            </nav>


            <div className="row mt-2">

                <div className="col-4">
                    <TransitView
                        ref={this.transitViewRef}
                        phase={this.state.phase}
                        minPhase={this.state.minPhase}
                        maxPhase={this.state.maxPhase}
                        planetRadius={this.state.planetRadius}
                        planetEccentricity={this.state.planetEccentricity}
                        planetMass={this.state.planetMass}
                        planetSemimajorAxis={this.state.planetSemimajorAxis}
                        starMass={this.state.starMass}
                        inclination={this.state.inclination}
                        longitude={this.state.longitude}
                        semimajorAxis={this.state.planetSemimajorAxis}
                        onPhaseUpdate={this.onPhaseUpdate} />
                    <h5>Presets</h5>
                    <form className="form-inline">
                        <select className="form-control form-control-sm mr-2"
                                onChange={this.onPresetSelect}>
                            <option value={-1}>--</option>
                            <option value={0}>1. Option A</option>
                            <option value={1}>2. Option B</option>
                            <option value={2}>3. OGLE-TR-113 b</option>
                            <option value={3}>4. TrES-1</option>
                            <option value={4}>5. XO-1 b</option>
                            <option value={5}>6. HD 209458 b</option>
                            <option value={6}>7. OGLE-TR-111 b</option>
                            <option value={7}>8. OGLE-TR-10 b</option>
                            <option value={8}>9. HD 189733 b</option>
                            <option value={9}>10. HD 149026 b</option>
                            <option value={10}>11. OGLE-TR-132 b</option>
                        </select>
                        <button onClick={this.onPresetSet}>Set</button>
                    </form>
                </div>

                <div className="col-6">
                    <LightcurveView
                        curveCoords={this.lightcurveCoords}
                        labelCoords={this.lightcurveLabelCoords}
                        showTheoreticalCurve={this.state.showTheoreticalCurve}
                        showSimulatedMeasurements={this.state.showSimulatedMeasurements}
                        noise={this.state.noise}
                        simMeasurementNumber={this.state.simMeasurementNumber}
                        planetMass={this.state.planetMass}
                        planetRadius={this.state.planetRadius}
                        planetSemimajorAxis={this.state.planetSemimajorAxis}
                        planetEccentricity={this.state.planetEccentricity}
                        starMass={this.state.starMass}
                        inclination={this.state.inclination}
                        longitude={this.state.longitude}
                        phase={this.state.phase}
                        onPhaseUpdate={this.onPhaseUpdate}
                    />
                    <div className="text-center">
                        {getEclipseText(
                             this.lightcurve.eclipseOfBody1Duration,
                             this.lightcurve.systemPeriod)}
                    </div>
                    <div className="row mt-2">
                        <div className="col">
                            <div className="form-inline">
                                <div className="custom-control custom-checkbox">
                                    <input type="checkbox" className="custom-control-input"
                                           name="showTheoreticalCurve"
                                           id="showTheoreticalCurveToggle"
                                           checked={this.state.showTheoreticalCurve}
                                           onFocus={this.handleFocus}
                                           onChange={this.handleInputChange}
                                    />
                                    <label className="custom-control-label" htmlFor="showTheoreticalCurveToggle">
                                        Show theoretical curve
                                    </label>
                                </div>
                                <div className="custom-control custom-checkbox">
                                    <input type="checkbox" className="custom-control-input"
                                           name="showSimulatedMeasurements"
                                           id="showSimulatedMeasurementsToggle"
                                           checked={this.state.showSimulatedMeasurements}
                                           onFocus={this.handleFocus}
                                           onChange={this.handleInputChange}
                                    />
                                    <label className="custom-control-label" htmlFor="showSimulatedMeasurementsToggle">
                                        Show simulated measurements
                                    </label>
                                </div>

                                <div className="form-group row">
                                    <label className="col-2 col-form-label col-form-label-sm">
                                        Noise:
                                    </label>
                                    <div className="col-10">
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            disabled={!this.state.showSimulatedMeasurements}
                                            name="noise"
                                            value={this.state.noiseField}
                                            onFocus={this.handleFocus}
                                            onChange={this.handleInputChange}
                                            onBlur={this.handleInputBlur}
                                            min={0.00001} max={0.2} step={0.01} />
                                        <RangeStepInput
                                            className="form-control"
                                            disabled={!this.state.showSimulatedMeasurements}
                                            name="noise"
                                            value={this.state.noise}
                                            onChange={this.handleInputChange}
                                            min={0.00001} max={0.2} step={0.01} />
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label className="col-2 col-form-label col-form-label-sm">
                                        Number:
                                    </label>
                                    <div className="col-10">
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            disabled={!this.state.showSimulatedMeasurements}
                                            name="simMeasurementNumber"
                                            value={this.state.simMeasurementNumberField}
                                            onFocus={this.handleFocus}
                                            onChange={this.handleInputChange}
                                            onBlur={this.handleInputBlur}
                                            min={5} max={250} step={1} />
                                        <RangeStepInput
                                            className="form-control"
                                            disabled={!this.state.showSimulatedMeasurements}
                                            name="simMeasurementNumber"
                                            value={this.state.simMeasurementNumber}
                                            onChange={this.handleInputChange}
                                            min={5} max={250} step={1} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            {getEclipseDepthText(
                                 this.lightcurve.plottedVisualFluxDepth,
                                 this.lightcurve.eclipseOfBody1Duration)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mt-2">
                <div className="col-4">
                    <h5>Planet Properties</h5>
                    <div className="form-inline">
                        <div className="form-group row">
                            <label className="col-2 col-form-label col-form-label-sm">
                                Mass:
                            </label>
                            <div className="col-10">
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    name="planetMass"
                                    value={this.state.planetMassField}
                                    onFocus={this.handleFocus}
                                    onChange={this.handleInputChange}
                                    onBlur={this.handleInputBlur}
                                    min={0.001} max={100}
                                    step={0.001} />
                                &nbsp;M<sub>jup</sub>&nbsp;

                                <RangeStepInput
                                    className="form-control"
                                    name="planetMass"
                                    value={this.state.planetMass}
                                    onChange={this.handleInputChange}
                                    min={0.01} max={100} step={0.001} />
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-2 col-form-label col-form-label-sm">
                                Radius:
                            </label>
                            <div className="col-10">
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    name="planetRadius"
                                    value={this.state.planetRadiusField}
                                    onFocus={this.handleFocus}
                                    onChange={this.handleInputChange}
                                    onBlur={this.handleInputBlur}
                                    min={0.01} max={2}
                                    step={0.001} />
                                &nbsp;R<sub>jup</sub>&nbsp;

                                <RangeStepInput
                                    className="form-control"
                                    name="planetRadius"
                                    value={this.state.planetRadius}
                                    onChange={this.handleInputChange}
                                    min={0.01} max={2} step={0.001} />
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-2 col-form-label col-form-label-sm">
                                Semimajor axis:
                            </label>
                            <div className="col-10">
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    name="planetSemimajorAxis"
                                    value={this.state.planetSemimajorAxisField}
                                    onFocus={this.handleFocus}
                                    onChange={this.handleInputChange}
                                    onBlur={this.handleInputBlur}
                                    min={0.015} max={2}
                                    step={0.001} />
                                &nbsp;AU&nbsp;

                                <RangeStepInput
                                    className="form-control"
                                    name="planetSemimajorAxis"
                                    value={this.state.planetSemimajorAxis}
                                    onChange={this.handleInputChange}
                                    min={0.015} max={2}
                                    step={0.001} />
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-2 col-form-label col-form-label-sm">
                                Eccentricity:
                            </label>
                            <div className="col-10">
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    name="planetEccentricity"
                                    value={this.state.planetEccentricityField}
                                    onFocus={this.handleFocus}
                                    onChange={this.handleInputChange}
                                    onBlur={this.handleInputBlur}
                                    min={0} max={0.4}
                                    step={0.01} />

                                <RangeStepInput
                                    className="form-control"
                                    name="planetEccentricity"
                                    value={this.state.planetEccentricity}
                                    onChange={this.handleInputChange}
                                    min={0} max={0.4}
                                    step={0.01} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-4">
                    <h5>Star Properties</h5>
                    <div className="form-inline">
                        <div className="form-group row">
                            <label className="col-2 col-form-label col-form-label-sm">
                                Mass:
                            </label>

                            <div className="col-10">
                                <input type="number"
                                       className="form-control form-control-sm"
                                       name="starMass"
                                       value={this.state.starMassField}
                                       onFocus={this.handleFocus}
                                       onChange={this.handleInputChange}
                                       onBlur={this.handleInputBlur}
                                       min={0.5} max={2}
                                       step={0.01} />
                                &nbsp;M<sub>sun</sub>&nbsp;

                                <RangeStepInput
                                    className="form-control"
                                    name="starMass"
                                    value={this.state.starMass}
                                    onChange={this.handleInputChange}
                                    min={0.5} max={2} step={0.01} />
                            </div>
                        </div>
                    </div>
                    <p>
                        A main sequence star of this mass would have
                        spectral type {starType}, temperature {Math.round(starTemp)} K, and
                        radius {roundToOnePlace(starRadius)} R<sub>sun</sub>
                    </p>
                </div>

                <div className="col-4">
                    <h5>System Orientation and Phase</h5>

                    <div className="form-inline">
                        <div className="form-group row">
                            <label className="col-2 col-form-label col-form-label-sm">
                                Inclination:
                            </label>

                            <div className="col-10">
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    name="inclination"
                                    value={this.state.inclinationField}
                                    onFocus={this.handleFocus}
                                    onChange={this.handleInputChange}
                                    onBlur={this.handleInputBlur}
                                    min={0} max={180} step={0.001} />&deg;&nbsp;

        <RangeStepInput
            className="form-control"
            name="inclination"
            value={this.state.inclination}
            onChange={this.handleInputChange}
            min={0} max={180} step={0.001} />
                            </div>
                        </div>

                        <div className="form-group row">
                            <label className="col-2 col-form-label col-form-label-sm">
                                Longitude:
                            </label>

                            <div className="col-10">
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    name="longitude"
                                    value={this.state.longitudeField}
                                    onFocus={this.handleFocus}
                                    onChange={this.handleInputChange}
                                    onBlur={this.handleInputBlur}
                                    step={0.1} />&deg;&nbsp;

        <RangeStepInput
            className="form-control"
            name="longitude"
            value={this.state.longitude}
            onChange={this.handleInputChange}
            min={0} max={360} step={0.1} />
                            </div>
                        </div>

                        <div className="form-group row">
                            <label htmlFor="phaseSlider"
                                   className="col-2 col-form-label col-form-label-sm">
                                Phase:
                            </label>

                            <div className="col-10">
                                <RangeStepInput
                                    className="form-control"
                                    name="phase" id="phaseSlider"
                                    value={this.state.phase}
                                    onChange={this.handleInputChange}
                                    min={0} max={1} step={0.01} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>;
    }
    /**
     * https://gist.github.com/chris-siedell/662dd6f5dd253519f172b288520bf537#file-main-code-as-L76
     */
    updateParameters() {
        const starMass = this.state.starMass;
        const starLum = getLuminosityFromMass(starMass);
        const starTemp = getTempFromLuminosity(starLum);
        const starRadius = getRadiusFromTempAndLuminosity(starTemp, starLum);
        //const starType = getSpectralTypeFromTemp(starTemp);

        //displayStarInfo(starType, starTemp, starRadius);

        let params = {};
        params.mass1 = starMass * 1.98892e30;
        params.radius1 = starRadius * 6.955e8;
        params.temperature1 = starTemp;
        params.mass2 = this.state.planetMass * 1.8987e27;
        params.radius2 = this.state.planetRadius * 7.1492e7;
        params.temperature2 = 500;
        params.inclination = this.state.inclination;
        params.longitude = this.state.longitude;
        params.eccentricity = this.state.planetEccentricity;
        params.separation = this.state.planetSemimajorAxis * 1.49598e11;

        this.lightcurve.setParameters(params);
        this.lightcurveCoords = this.lightcurve.update();
        this.lightcurveLabelCoords = this.lightcurve.labelCoords;

        params.minPhase = this.lightcurve._minPhase;
        params.maxPhase = this.lightcurve._maxPhase;
        params.phase = this.lightcurve.getCursorPhase();

        if (this.transitViewRef && this.transitViewRef.current) {
            this.transitViewRef.current.setParameters(params);
        }
    }
    handleInputChange(event) {
        const target = event.target;
        const name = target.name;
        let value = target.type === 'checkbox' ?
                    target.checked : target.value;

        if (target.type === 'radio') {
            value = target.id === (target.name + 'Radio');
        } else if (target.type === 'range' || target.type === 'number') {
            value = forceNumber(value);
        }

        // Free-form text fields (i.e. number fields) set state on blur,
        // not on change.
        if (target.type === 'number') {
            this.setState({
                [name + 'Field']: value
            });
        } else {
            this.setState({
                [name]: value
            });
        }
    }
    handleInputBlur(event) {
        const target = event.target;
        const name = target.name;
        const value = forceNumber(target.value);
        const min = forceNumber(target.min);
        const max = forceNumber(target.max);

        // Don't update the state if the user is out of bounds.
        if (value < min || value > max) {
            // In fact, revert the input to its internal value.
            this.setState({
                [new String(name) + 'Field']: this.state[new String(name)]
            });
            return;
        }

        this.setState({
            [name]: value
        });
    }
    handleFocus(e) {
        e.target.select();
    }
    onPhaseUpdate(newPhase) {
        this.setState({phase: newPhase});
    }
    onResetClick(e) {
        e.preventDefault();
        this.setState(this.initialState);
    }
    onPresetSelect(e) {
        const idx = forceNumber(e.target.value);
        if (idx < 0) {
            return;
        }

        this.setState({selectedPreset: idx});
    }
    onPresetSet(e) {
        e.preventDefault();

        const idx = this.state.selectedPreset;
        if (idx < 0) {
            return;
        }

        const data = systemPresets[parseInt(idx)];
        this.setState(data);
    }
}

const domContainer = document.querySelector('#sim-container');
const root = createRoot(domContainer);
root.render(<ExoplanetTransitSimulator />);
