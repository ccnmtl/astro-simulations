import React from 'react';
import ReactDOM from 'react-dom';
import Lightcurve from './Lightcurve';
import LightcurveView from './LightcurveView';
import TransitView from './TransitView';
import {RangeStepInput} from 'react-range-step-input';
import {
    forceNumber, getStarRadius, getStarTemp, getSpectralType,
    getEclipseDepth
} from './utils';

const systemPresets = [
    // 0: Option A
    {
        // Planet properties
        planetMass: 1,
        planetRadius: 1,
        planetSemimajorAxis: 1,
        planetEccentricity: 0,

        // Star properties
        starMass: 1,

        // System orientation and phase
        inclination: 90,
        longitude: 0
    },

    // 1: Option B
    {
        // Planet properties
        planetMass: 0.0032,
        planetRadius: 0.09,
        planetSemimajorAxis: 1,
        planetEccentricity: 0,

        // Star properties
        starMass: 1,

        // System orientation and phase
        inclination: 90,
        longitude: 0
    },

    // 2: OGLE-TR-113 b
    {
        // Planet properties
        planetMass: 1.32,
        planetRadius: 1.09,
        planetSemimajorAxis: 0.0229,
        planetEccentricity: 0,

        // Star properties
        starMass: 0.78,

        // System orientation and phase
        inclination: 89.4,
        longitude: 0
    },

    // 3: TrES-1
    {
        // Planet properties
        planetMass: 0.61,
        planetRadius: 1.08,
        planetSemimajorAxis: 0.0393,
        planetEccentricity: 0.14,

        // Star properties
        starMass: 0.87,

        // System orientation and phase
        inclination: 88.2,
        longitude: 0
    },

    // 4: XO-1 b
    {
        // Planet properties
        planetMass: 0.9,
        planetRadius: 1.3,
        planetSemimajorAxis: 0.0488,
        planetEccentricity: 0,

        // Star properties
        starMass: 1,

        // System orientation and phase
        inclination: 87.7,
        longitude: 0
    },

    // 5: HD 209458 b
    {
        // Planet properties
        planetMass: 0.69,
        planetRadius: 1.32,
        planetSemimajorAxis: 0.045,
        planetEccentricity: 0.07,

        // Star properties
        starMass: 1.01,

        // System orientation and phase
        inclination: 86.929,
        longitude: 83
    },

    // 6: OGLE-TR-111 b
    {
        // Planet properties
        planetMass: 0.53,
        planetRadius: 1,
        planetSemimajorAxis: 0.047,
        planetEccentricity: 0,

        // Star properties
        starMass: 0.82,

        // System orientation and phase
        inclination: 86.5,
        longitude: 0
    },

    // 7: OGLE-TR-10 b
    {
        // Planet properties
        planetMass: 0.54,
        planetRadius: 1.16,
        planetSemimajorAxis: 0.0416,
        planetEccentricity: 0,

        // Star properties
        starMass: 1.22,

        // System orientation and phase
        inclination: 86.46,
        longitude: 0
    },

    // 8: HD 189733 b
    {
        // Planet properties
        planetMass: 1.15,
        planetRadius: 1.15,
        planetSemimajorAxis: 0.0313,
        planetEccentricity: 0,

        // Star properties
        starMass: 0.82,

        // System orientation and phase
        inclination: 85.79,
        longitude: 0
    },

    // 9: HD 149026 b
    {
        // Planet properties
        planetMass: 0.36,
        planetRadius: 0.725,
        planetSemimajorAxis: 0.042,
        planetEccentricity: 0,

        // Star properties
        starMass: 1.3,

        // System orientation and phase
        inclination: 85.3,
        longitude: 0
    },

    // 10: OGLE-TR-132 b
    {
        // Planet properties
        planetMass: 1.19,
        planetRadius: 1.13,
        planetSemimajorAxis: 0.0306,
        planetEccentricity: 0,

        // Star properties
        starMass: 1.35,

        // System orientation and phase
        inclination: 85,
        longitude: 0
    }
];

class ExoplanetTransitSimulator extends React.Component {
    constructor(props) {
        super(props);
        this.initialState = {
            preset: 0,

            // Lightcurve view settings
            showTheoreticalCurve: true,
            showSimulatedMeasurements: false,
            noise: 0.1,
            simMeasurementNumber: 50,

            // Planet properties
            planetMass: 0.657,
            planetRadius: 1.32,
            planetSemimajorAxis: 0.047,
            planetEccentricity: 0,

            // Star properties
            starMass: 1.09,

            // System orientation and phase
            inclination: 86.929,
            longitude: 0,
            phase: 0.5,

            // Pixi scene co-ordinates. Initialize these to accurate
            // values.
            // This is hardcoded because the TransitView doesn't know
            // its width and height right when the DOM is created, and these
            // values depend on that.
            orbitLeft: 45.61,
            orbitWidth: 260.62
        };
        this.state = this.initialState;

        this.handleInputChange = this.handleInputChange.bind(this);
        this.onPhaseCoordsChange = this.onPhaseCoordsChange.bind(this);
        this.onPresetSelect = this.onPresetSelect.bind(this);

        this.lightcurve = new Lightcurve();
    }
    render() {
        const starType = getSpectralType(this.state.starMass);
        const starTemp = getStarTemp(this.state.starMass);
        const starRadius = getStarRadius(this.state.starMass);
        const eclipseDepth = getEclipseDepth(this.state.planetRadius);
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
                        phase={this.state.phase}
                        planetRadius={this.state.planetRadius}
                        starMass={this.state.starMass}
                        inclination={this.state.inclination}
                        semimajorAxis={this.state.planetSemimajorAxis}
                        onPhaseCoordsChange={this.onPhaseCoordsChange} />
                    <h5>Presets</h5>
                    <select className="form-control form-control-sm" onChange={this.onPresetSelect}>
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
                </div>

                <div className="col-6">
                    <LightcurveView
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
                        orbitLeft={this.state.orbitLeft}
                        orbitWidth={this.state.orbitWidth}
                    />
                    <div className="text-center">
                        Eclipse takes 2.93 hours of 3.56 day orbit.
                    </div>
                    <div className="row mt-2">
                        <div className="col">
                            <div className="form-inline">
                                <div className="custom-control custom-checkbox">
                                    <input type="checkbox" className="custom-control-input"
                                           name="showTheoreticalCurve"
                                           id="showTheoreticalCurveToggle"
                                           checked={this.state.showTheoreticalCurve}
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
                                            value={this.state.noise}
                                            onChange={this.handleInputChange}
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
                                            value={this.state.simMeasurementNumber}
                                            onChange={this.handleInputChange}
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
                            Eclipse depth: {eclipseDepth}
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
                                    value={this.state.planetMass}
                                    onChange={this.handleInputChange}
                                    min={0.001} max={100}
                                    step={0.001} />
                                M<sub>jup</sub>

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
                                    value={this.state.planetRadius}
                                    onChange={this.handleInputChange}
                                    min={0.01} max={2}
                                    step={0.001} />
                                R<sub>jup</sub>

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
                                    value={this.state.planetSemimajorAxis}
                                    onChange={this.handleInputChange}
                                    min={0.01} max={2}
                                    step={0.001} />
                                AU

                                <RangeStepInput
                                    className="form-control"
                                    name="planetSemimajorAxis"
                                    value={this.state.planetSemimajorAxis}
                                    onChange={this.handleInputChange}
                                    min={0.01} max={2}
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
                                    value={this.state.planetEccentricity}
                                    onChange={this.handleInputChange}
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
                                       value={this.state.starMass}
                                       onChange={this.handleInputChange}
                                       min={0.5} max={2}
                                       step={0.01} />
                                M<sub>sun</sub>

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
                        spectral type {starType}, temperature {starTemp} K, and
                        radius {starRadius} R<sub>sun</sub>
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
                                    value={this.state.inclination}
                                    onChange={this.handleInputChange}
                                    min={0} max={180} step={0.001} />&deg;

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
                                    value={this.state.longitude}
                                    onChange={this.handleInputChange}
                                    step={0.1} />&deg;

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

        this.setState({
            [name]: value
        });
    }
    onPhaseCoordsChange(orbitLeft, orbitWidth) {
        this.setState({
            orbitLeft: orbitLeft,
            orbitWidth: orbitWidth
        });
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

        const data = systemPresets[idx];
        this.setState(data);
    }
}

const domContainer = document.querySelector('#sim-container');
ReactDOM.render(<ExoplanetTransitSimulator />, domContainer);
