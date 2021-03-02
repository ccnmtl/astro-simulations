import React from 'react';
import ReactDOM from 'react-dom';
import {RangeStepInput} from 'react-range-step-input';
import LightcurveView from './LightcurveView';
import BinarySystemView from './BinarySystemView';
import Window from './Window';
import {
    forceNumber, roundToTwoPlaces,
    getRadiusFromTempAndLuminosity,
    getMassFromLuminosity,
    getTempFromRadius,
    getTempFromLuminosityAndRadius,
    getLuminosityFromTempAndClass,
    getLuminosityFromRadiusAndTemp
} from './utils';
import {systemPresets} from './presets';

class EclipsingBinarySimulator extends React.Component {
    constructor(props) {
        super(props);
        this.initialState = {
            isPlaying: false,
            showHRDiagram: false,

            // System Orientation
            longitude: 150,
            inclination: 80,

            showOrbitalPaths: true,
            showOrbitalPlane: true,

            animationSpeed: 1,
            phase: 0.7,
            visualPhase: 0.7,

            showLightcurve: true,

            // Star 1 Properties
            star1Mass: 1,
            star1Radius: 1.5,
            star1Temp: 8700,
            star1Lum: 0,

            // Dynamic range inputs
            star1MassMin: 0.1,
            star1MassMax: 85,
            star1RadiusMin: 0.1,
            star1RadiusMax: 50,
            star1TempMin: 3000,
            star1TempMax: 45000,

            // Star 2 Properties
            star2Mass: 1,
            star2Radius: 1.5,
            star2Temp: 5000,
            star2Lum: 0,

            // Dynamic range inputs
            star2MassMin: 0.1,
            star2MassMax: 85,
            star2RadiusMin: 0.1,
            star2RadiusMax: 50,
            star2TempMin: 3000,
            star2TempMax: 45000,

            // System Properties
            separation: 10,
            eccentricity: 0.3,

            // Dynamic range inputs
            separationMin: 0,
            separationMax: 60,
            eccentricityMin: 0,
            eccentricityMax: 0.6
        };

        this.inputs = [
            'longitude',
            'inclination',
            'phase',
            'star1Mass',
            'star1Radius',
            'star1Temp',
            'star2Mass',
            'star2Radius',
            'star2Temp',
            'separation',
            'eccentricity'
        ];

        this.initialState = this.initializeNumberInputs(
            this.initialState, this.inputs);

        this.state = this.initialState;

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleInputBlur = this.handleInputBlur.bind(this);
        this.onWindowOpen = this.onWindowOpen.bind(this);
        this.onWindowClose = this.onWindowClose.bind(this);
        this.onPhaseUpdate = this.onPhaseUpdate.bind(this);
        this.onPresetSelect = this.onPresetSelect.bind(this);
        this.onStartClick = this.onStartClick.bind(this);
        this.onDotMove = this.onDotMove.bind(this);

        this.animate = this.animate.bind(this);

        this.lightcurveViewRef = React.createRef();

        this.sysProps = {
            a: this.state.separation,
            e: this.state.eccentricity
        };

        this.star1 = {
            t: 8700,
            l: 0,
            m: 1,
            r: 1.5
        };
        this.star2 = {
            t: 5000,
            l: 0,
            m: 1,
            r: 1.5
        };

        this.Lmin = 0.001;
        this.Lmax = 1000000;

        this.AminSld = 0;
        this.AmaxSld = 60;
        this.EminSld = 0;
        this.EmaxSld = 100;
        this.RminMS = 0;
        this.RmaxMS = 100;
        this.MminMS = 0;
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
    render() {
        let startBtnText = 'Start Animation';
        if (this.state.isPlaying) {
            startBtnText = 'Pause Animation';
        }

        return <React.Fragment>
            <Window
                star1Temp={this.state.star1Temp}
                star1Radius={this.state.star1Radius}
                star2Temp={this.state.star2Temp}
                star2Radius={this.state.star2Radius}
                isHidden={!this.state.showHRDiagram}
                onWindowClose={this.onWindowClose}
                onDotMove={this.onDotMove}
            />
            <nav className="navbar navbar-expand-md navbar-light bg-light d-flex justify-content-between">
                <span className="navbar-brand mb-0 h1">Eclipsing Binary Simulator</span>

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
                <div className="col-6">
                    <BinarySystemView
                        phase={this.state.visualPhase}
                        star1Mass={this.state.star1Mass}
                        star2Mass={this.state.star2Mass}
                        star1Radius={this.state.star1Radius}
                        star2Radius={this.state.star2Radius}
                        star1Temp={this.state.star1Temp}
                        star2Temp={this.state.star2Temp}
                        separation={this.state.separation}
                        eccentricity={this.state.eccentricity}
                        inclination={this.state.inclination}
                        longitude={this.state.longitude}
                        showOrbitalPaths={this.state.showOrbitalPaths}
                        showOrbitalPlane={this.state.showOrbitalPlane}
                    />

                    <h6>System Orientation</h6>

                    <div className="form-inline">
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
                                    min={0} max={360}
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
                                    min={0} max={90} step={0.01} />&deg;

                                <RangeStepInput
                                    className="form-control"
                                    name="inclination"
                                    value={this.state.inclination}
                                    onChange={this.handleInputChange}
                                    min={0} max={90} step={0.01} />
                            </div>
                        </div>
                    </div>

                <h6>Animation and Visualization Controls</h6>

                <div className="form-inline">
                    <div className="form-group row">
                        <button type="button"
                                className="btn btn-primary btn-sm"
                                onClick={this.onStartClick}>
                            {startBtnText}
                        </button>
                        <div className="col-6">
                            <RangeStepInput
                                className="form-control-range"
                                name="animationSpeed"
                                min={0.01} max={2} step={0.01}
                                value={this.state.animationSpeed}
                                onChange={this.handleInputChange} />
                            <div className="small form-text text-muted mb-2">
                                <span>Slow</span>
                                <span className="float-right">Fast</span>
                            </div>
                        </div>
                    </div>

                    <div className="form-group row">
                        <label className="col-2 col-form-label col-form-label-sm">
                            Phase:
                        </label>

                        <div className="col-10">
                            <input
                                type="number"
                                className="form-control form-control-sm"
                                name="phase"
                                value={roundToTwoPlaces(this.state.phase)}
                                onFocus={this.handleFocus}
                                onChange={this.handleInputChange}
                                min={0} max={1} step={0.01} />

                            <RangeStepInput
                                className="form-control"
                                name="phase"
                                value={this.state.phase}
                                onChange={this.handleInputChange}
                                min={0} max={1} step={0.01} />
                        </div>
                    </div>
                </div>

                <div className="custom-control custom-checkbox">
                    <input type="checkbox" className="custom-control-input"
                           name="showOrbitalPaths"
                           onFocus={this.handleFocus}
                           onChange={this.handleInputChange}
                           checked={this.state.showOrbitalPaths}
                           id="showOrbitalPathsToggle" />
                    <label className="custom-control-label"
                           htmlFor="showOrbitalPathsToggle">
                        Show orbital paths
                    </label>
                </div>

                <div className="custom-control custom-checkbox">
                    <input type="checkbox" className="custom-control-input"
                           name="showOrbitalPlane"
                           onFocus={this.handleFocus}
                           onChange={this.handleInputChange}
                           checked={this.state.showOrbitalPlane}
                           id="showOrbitalPlaneToggle" />
                    <label className="custom-control-label"
                           htmlFor="showOrbitalPlaneToggle">
                        Show orbital plane
                    </label>
                </div>

                <button type="button"
                        onClick={this.onWindowOpen}
                        className="btn btn-primary btn-sm">
                    Show HR Diagram
                </button>

                </div>

                <div className="col-6">
                    <LightcurveView
                        ref={this.lightcurveViewRef}
                        showLightcurve={this.state.showLightcurve}
                        lightcurveDataImg={this.state.lightcurveDataImg}
                        phase={this.state.phase}
                        onPhaseUpdate={this.onPhaseUpdate} />

                    <h6>Presets</h6>

                    <form>
                        <div className="form-group">
                            <select className="form-control form-control-sm" onChange={this.onPresetSelect}>
                                <option value={-1}>- Select a preset -</option>
                                <option value={-1}></option>
                                <option value={-1}>Student guide examples</option>
                                <option value={1}>1. Example 1</option>
                                <option value={2}>2. Example 2</option>
                                <option value={3}>3. Example 3</option>
                                <option value={4}>4. Example 4</option>
                                <option value={5}>5. Example 5</option>
                                <option value={6}>6. Example 6</option>
                                <option value={7}>7. Example 7</option>
                                <option value={8}>8. Example 8</option>
                                <option value={-1}></option>
                                <option value={-1}>Datasets with Complete Parameters</option>
                                <option value={9}>9. KP Aql</option>
                                <option value={10}>10. EW Ori</option>
                                <option value={11}>11. FL Lyr</option>
                                <option value={12}>12. EK Cep</option>
                                <option value={13}>13. TW Cas</option>
                                <option value={14}>14. AD Her</option>
                                <option value={15}>15. AW UMa</option>
                                <option value={16}>16. AW Lac</option>
                                <option value={17}>17. DM Del</option>
                                <option value={-1}></option>
                                <option value={-1}>Datasets with Incomplete Parameters</option>
                                <option value={18}>18. RT CrB</option>
                                <option value={19}>19. V478 Cyg</option>
                                <option value={20}>20. V477 Cyg</option>
                                <option value={21}>21. DI Her</option>
                                <option value={22}>22. AG Phe</option>
                                <option value={23}>23. RZ Cas</option>
                                <option value={24}>24. AF Gem</option>
                                <option value={-1}></option>
                                <option value={-1}>More Datasets</option>
                                <option value={25}>25. CW CMa</option>
                                <option value={26}>26. RX Ari</option>
                                <option value={27}>27. MR Cyg</option>
                                <option value={28}>28. TX UMa</option>
                                <option value={29}>29. V442 Cyg</option>
                                <option value={30}>30. AD Boo</option>
                                <option value={31}>31. UZ Dra</option>
                                <option value={32}>32. AR Aur</option>
                                <option value={33}>33. HS Aur</option>
                                <option value={34}>34. AY Cam</option>
                                <option value={35}>35. CD Tau</option>
                                <option value={36}>36. FS Mon</option>
                                <option value={37}>37. BP Vul</option>
                                <option value={38}>38. V459 Cas</option>
                                <option value={39}>39. V364 Lac</option>
                                <option value={40}>40. V526 Sgr</option>
                                <option value={41}>41. GG Ori</option>
                                <option value={42}>42. SW CMa</option>
                                <option value={43}>43. V541 Cyg</option>
                                <option value={44}>44. IQ Per</option>
                                <option value={45}>45. IM Aur</option>
                                <option value={46}>46. TT Lyr</option>
                                <option value={47}>47. T LMi</option>
                                <option value={48}>48. SW Cyg</option>
                                <option value={49}>49. V380 Cyg</option>
                                <option value={50}>50. NN Cep</option>
                                <option value={51}>51. AE Phe</option>
                                <option value={52}>52. V885 Cyg</option>
                                <option value={53}>53. RS Ind</option>
                                <option value={54}>54. EF Dra</option>
                            </select>
                        </div>
                    </form>

                    <h6>Star 1 Properties</h6>

                    <div className="form-inline">
                        <div className="form-group row">
                            <label className="col-2 col-form-label col-form-label-sm">
                                Mass:
                            </label>

                            <div className="col-10">
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    name="star1Mass"
                                    value={this.state.star1MassField}
                                    onFocus={this.handleFocus}
                                    onChange={this.handleInputChange}
                                    onBlur={this.handleInputBlur}
                                    min={this.state.star1MassMin}
                                    max={this.state.star1MassMax}
                                    step={0.1} />

                                <RangeStepInput
                                    className="form-control"
                                    name="star1Mass"
                                    value={this.state.star1Mass}
                                    onChange={this.handleInputChange}
                                    min={this.state.star1MassMin}
                                    max={this.state.star1MassMax}
                                    step={0.1} />
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
                                    name="star1Radius"
                                    value={this.state.star1RadiusField}
                                    onFocus={this.handleFocus}
                                    onChange={this.handleInputChange}
                                    onBlur={this.handleInputBlur}
                                    min={this.state.star1RadiusMin}
                                    max={this.state.star1RadiusMax}
                                    step={0.1} />

                                <RangeStepInput
                                    className="form-control"
                                    name="star1Radius"
                                    value={this.state.star1Radius}
                                    onChange={this.handleInputChange}
                                    min={this.state.star1RadiusMin}
                                    max={this.state.star1RadiusMax}
                                    step={0.1} />

                                <div className="small form-text text-muted mb-2">
                                    <span>min: {
                                        roundToTwoPlaces(this.state.star1RadiusMin)
                                    }</span>
                                    <span className="ml-2">max: {
                                        roundToTwoPlaces(this.state.star1RadiusMax)
                                    }</span>
                                </div>
                            </div>
                        </div>

                        <div className="form-group row">
                            <label className="col-2 col-form-label col-form-label-sm">
                                Temperature:
                            </label>

                            <div className="col-10">
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    name="star1Temp"
                                    value={this.state.star1TempField}
                                    onFocus={this.handleFocus}
                                    onChange={this.handleInputChange}
                                    onBlur={this.handleInputBlur}
                                    min={this.state.star1TempMin}
                                    max={this.state.star1TempMax}
                                    step={1} />

                                <RangeStepInput
                                    className="form-control"
                                    name="star1Temp"
                                    value={this.state.star1Temp}
                                    onChange={this.handleInputChange}
                                    min={this.state.star1TempMin}
                                    max={this.state.star1TempMax}
                                    step={1} />

                                <div className="small form-text text-muted mb-2">
                                    <span>min: {
                                        roundToTwoPlaces(this.state.star1TempMin)
                                    }</span>
                                    <span className="ml-2">max: {
                                        roundToTwoPlaces(this.state.star1TempMax)
                                    }</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h6>Star 2 Properties</h6>

                    <div className="form-inline">
                        <div className="form-group row">
                            <label className="col-2 col-form-label col-form-label-sm">
                                Mass:
                            </label>

                            <div className="col-10">
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    name="star2Mass"
                                    value={this.state.star2MassField}
                                    onFocus={this.handleFocus}
                                    onChange={this.handleInputChange}
                                    onBlur={this.handleInputBlur}
                                    min={this.state.star2MassMin}
                                    max={this.state.star2MassMax}
                                    step={0.1} />

                                <RangeStepInput
                                    className="form-control"
                                    name="star2Mass"
                                    value={this.state.star2Mass}
                                    onChange={this.handleInputChange}
                                    min={this.state.star2MassMin}
                                    max={this.state.star2MassMax}
                                    step={0.1} />
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
                                    name="star2Radius"
                                    value={this.state.star2RadiusField}
                                    onFocus={this.handleFocus}
                                    onChange={this.handleInputChange}
                                    onBlur={this.handleInputBlur}
                                    min={this.state.star2RadiusMin}
                                    max={this.state.star2RadiusMax}
                                    step={0.1} />

                                <RangeStepInput
                                    className="form-control"
                                    name="star2Radius"
                                    value={this.state.star2Radius}
                                    onChange={this.handleInputChange}
                                    min={this.state.star2RadiusMin}
                                    max={this.state.star2RadiusMax}
                                    step={0.1} />

                                <div className="small form-text text-muted mb-2">
                                    <span>min: {
                                        roundToTwoPlaces(this.state.star2RadiusMin)
                                    }</span>
                                    <span className="ml-2">max: {
                                        roundToTwoPlaces(this.state.star2RadiusMax)
                                    }</span>
                                </div>
                            </div>
                        </div>

                        <div className="form-group row">
                            <label className="col-2 col-form-label col-form-label-sm">
                                Temperature:
                            </label>

                            <div className="col-10">
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    name="star2Temp"
                                    value={this.state.star2TempField}
                                    onFocus={this.handleFocus}
                                    onChange={this.handleInputChange}
                                    onBlur={this.handleInputBlur}
                                    min={this.state.star2TempMin}
                                    max={this.state.star2TempMax}
                                    step={1} />

                                <RangeStepInput
                                    className="form-control"
                                    name="star2Temp"
                                    value={this.state.star2Temp}
                                    onChange={this.handleInputChange}
                                    min={this.state.star2TempMin}
                                    max={this.state.star2TempMax}
                                    step={1} />

                                <div className="small form-text text-muted mb-2">
                                    <span>min: {
                                        roundToTwoPlaces(this.state.star2TempMin)
                                    }</span>
                                    <span className="ml-2">max: {
                                        roundToTwoPlaces(this.state.star2TempMax)
                                    }</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h6>System Properties</h6>

                    <div className="form-inline">
                        <div className="form-group row">
                            <label className="col-2 col-form-label col-form-label-sm">
                                Separation:
                            </label>

                            <div className="col-10">
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    name="separation"
                                    value={this.state.separationField}
                                    onFocus={this.handleFocus}
                                    onChange={this.handleInputChange}
                                    onBlur={this.handleInputBlur}
                                    min={this.state.separationMin}
                                    max={this.state.separationMax}
                                    step={0.01} />

                                <RangeStepInput
                                    className="form-control"
                                    name="separation"
                                    value={this.state.separation}
                                    onChange={this.handleInputChange}
                                    min={this.state.separationMin}
                                    max={this.state.separationMax}
                                    step={0.01} />

                                <div className="small form-text text-muted mb-2">
                                    <span>min: {
                                        roundToTwoPlaces(this.state.separationMin)
                                    }</span>
                                    <span className="ml-2">max: {
                                        roundToTwoPlaces(this.state.separationMax)
                                    }</span>
                                </div>
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
                                    name="eccentricity"
                                    value={this.state.eccentricityField}
                                    onFocus={this.handleFocus}
                                    onChange={this.handleInputChange}
                                    onBlur={this.handleInputBlur}
                                    min={this.state.eccentricityMin}
                                    max={this.state.eccentricityMax}
                                    step={0.01} />

                                <RangeStepInput
                                    className="form-control"
                                    name="eccentricity"
                                    value={this.state.eccentricity}
                                    onChange={this.handleInputChange}
                                    min={this.state.eccentricityMin}
                                    max={this.state.eccentricityMax}
                                    step={0.01} />

                                <div className="small form-text text-muted mb-2">
                                    <span>min: {
                                        roundToTwoPlaces(this.state.eccentricityMin)
                                    }</span>
                                    <span className="ml-2">max: {
                                        roundToTwoPlaces(this.state.eccentricityMax)
                                    }</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </React.Fragment>;
    }
    componentDidMount() {
        this.drawLightcurve();
        this.setState({
            visualPhase: this.getVisualPhase(this.state.phase)
        });
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
            prevState.inclination !== this.state.inclination ||
            prevState.longitude !== this.state.longitude ||
            prevState.showLightcurve !== this.state.showLightcurve ||

            prevState.star1Mass !== this.state.star1Mass ||
            prevState.star1Radius !== this.state.star1Radius ||
            prevState.star1Temp !== this.state.star1Temp ||

            prevState.star2Mass !== this.state.star2Mass ||
            prevState.star2Radius !== this.state.star2Radius ||
            prevState.star2Temp !== this.state.star2Temp ||

            prevState.separation !== this.state.separation ||
            prevState.eccentricity !== this.state.eccentricity
        ) {
            this.drawLightcurve();
        }

        if (
            prevState.star1Radius !== this.state.star1Radius ||
                prevState.star2Radius !== this.state.star2Radius ||
                prevState.separation !== this.state.separation ||
                prevState.eccentricity !== this.state.eccentricity
        ) {
            this.setRestrictToMainSequence(1);
            this.setRestrictToMainSequence(2);
        }
    }
    setEccentricityRange() {
        // the maximum eccentricity limit depends on the radii of both
        // stars and the system separation
        const EmaxVis = 1 - (
            (this.state.star1Radius + this.state.star2Radius) /
                this.state.separation
        );
        const Emin = this.EminSld;
        const Emax = Math.min(this.EmaxSld, EmaxVis);
        this.setState({
            eccentricityMin: Emin,
            eccentricityMax: Emax
        });
    }

    setSeparationRange() {
        // the minimum separation limit depends on the radii of both
        // stars and the eccentricity
        const AminVis = (
            this.state.star1Radius + this.state.star2Radius) / (
                1 - this.state.eccentricity);
        const Amin = Math.max(this.AminSld, AminVis);
        const Amax = this.AmaxSld;
        this.setState({
            separationMin: Amin,
            separationMax: Amax
        });
    }
    setTempRange(star) {
        // in main sequence restrict mode the temperature limit for star A has the
        // same dependencies as the radius limit:
        //   - the system separation and eccentricity
        //   - the radius of the other star (star B)
        //  in unrestricted mode the temperature limit depends on:
        //   - the radius of star A
        const TminHR = getTempFromLuminosityAndRadius(
            this.Lmin, this.state[`star${star}Radius`]);
        const TmaxHR = getTempFromLuminosityAndRadius(
            this.Lmax, this.state[`star${star}Radius`]);
        const Tmin = Math.max(
            this.state[`star${star}TempMin`],
            TminHR);
        const Tmax = Math.min(
            this.state[`star${star}TempMax`],
            TmaxHR);

        this.setState({
            [`star${star}TempMin`]: Tmin,
            [`star${star}TempMax`]: Tmax
        });
    }
    setRadiusRange(star) {
        // the radius limit for star A always depends on:
        //   - the system separation and eccentricity
        //   - the radius of the other star (star B)
        //  when in main sequence restrict mode these are the only dependencies,
        //  but in unrestricted mode the radius limit also depends on:
        //   - the temperature of star A
        let thisStar, otherStarNumber;

        if (star === 1) {
            thisStar = this.star1;
            otherStarNumber = 2;
        } else if (star === 2) {
            thisStar = this.star2;
            otherStarNumber = 1;
        } else {
            return;
        }

        const starRadiusMin = 0.1;
        const starRadiusMax = 50;

        var RmaxVis = this.sysProps.a * (1 - this.sysProps.e) -
            this.state[`star${otherStarNumber}Radius`];
        var RminHR = getRadiusFromTempAndLuminosity(thisStar.t, this.Lmin);
        var RmaxHR = getRadiusFromTempAndLuminosity(thisStar.t, this.Lmax);
        const Rmin = Math.max(starRadiusMin, RminHR);
        const Rmax = Math.min(Math.min(starRadiusMax, RmaxHR), RmaxVis);

        this.setState({
            [`star${star}RadiusMin`]: Rmin,
            [`star${star}RadiusMax`]: Rmax
        });
    }
    setMassRange(star) {
        // in main sequence restrict mode the mass limit for star A has the
        // same dependencies as the radius limit:
        //   - the system separation and eccentricity
        //   - the radius of the other star (star B)
        //  in unrestricted mode the mass limit is unconstrained (except by the slider)
        const Mmin = this.MminSld;
        const Mmax = this.MmaxSld;

        this.setState({
            [`star${star}MassMin`]: Mmin,
            [`star${star}MassMax`]: Mmax
        });
    }
    /**
     * This function is unused.
     */
    setRestrictedStarRanges(star) {
        // determines the radius, temperature, and mass limits when the star
        // is restricted to the main sequence; the dependencies are:
        //   - the system separation and eccentricity
        //   - the radius of the other star

        let otherStar;
        if (star === 1) {
            otherStar = this.star2;
        } else if (star === 2) {
            otherStar = this.star1;
        } else {
            return;
        }

        //getLuminosityFromTempAndClass();
        //getRadiusFromTempAndLuminosity(this.state.star1TempMax, );
        const TminSld = this.state[`star${star}TempMin`];
        const LminMS = getLuminosityFromTempAndClass(TminSld);
        const RminMS = getRadiusFromTempAndLuminosity(TminSld, LminMS);

        const TmaxSld = this.state.star1TempMax;
        const LmaxMS = getLuminosityFromTempAndClass(TmaxSld);
        const RmaxMS = getRadiusFromTempAndLuminosity(TmaxSld, LmaxMS);

        const RmaxVis = this.sysProps.a * (1 - this.sysProps.e) - otherStar.r;
        const Rmin = RminMS;
        const Rmax = Math.min(RmaxMS, RmaxVis);

        const TmaxVis = getTempFromRadius(RmaxVis);
        const Tmin = TminSld;
        const Tmax = Math.min(
            this.state[`star${star}TempMax`],
            TmaxVis);

        const LmaxVis = getLuminosityFromRadiusAndTemp(RmaxVis, TmaxVis);
        const MmaxVis = getMassFromLuminosity(LmaxVis);
        const Mmin = this.MminMS;
        const Mmax = Math.min(this.MmaxMS, MmaxVis);

        this.setState({
            [`star${star}MassMin`]: Mmin,
            [`star${star}MassMax`]: Mmax,
            [`star${star}RadiusMin`]: Rmin,
            [`star${star}RadiusMax`]: Rmax,
            [`star${star}TempMin`]: Tmin,
            [`star${star}TempMax`]: Tmax
        });
    }
    getSystemTheta() {
        return ((90 - this.state.longitude) % 360 + 360) % 360;

    }
    getSystemPhi() {
        return 90 - this.state.inclination;
    }
    drawLightcurve() {
        const dataObj = {
            eccentricity: this.state.eccentricity,
            separation: this.state.separation,
            theta: this.getSystemTheta(),
            phi: this.getSystemPhi(),
            radius1: this.state.star1Radius,
            radius2: this.state.star2Radius,
            temperature1: this.state.star1Temp,
            temperature2: this.state.star2Temp
        };

        if (this.lightcurveViewRef) {
            this.lightcurveViewRef.current.setParameters(dataObj);
        }
    }

    getVisualPhase(phase) {
        return phase + (
            this.lightcurveViewRef.current._closestIndex /
                this.lightcurveViewRef.current._numCurvePoints);
    }

    animate() {
        this.frameId = requestAnimationFrame(this.animate);

        const now = Date.now();
        const elapsed = now - this.then;

        if (elapsed > 50) {
            const newPhase = (this.state.phase + (
                0.005 * this.state.animationSpeed)) % 1;

            this.setState({
                phase: newPhase,
                visualPhase: this.getVisualPhase(newPhase)
            });

            this.then = now;
        }
    }

    onResetClick(e) {
        e.preventDefault();
        this.setState(this.initialState);
    }
    handleInputChange(event) {
        const target = event.target;
        const name = target.name;
        let value = target.type === 'checkbox' ?
                    target.checked : target.value;

        if (target.type === 'radio') {
            value = target.id === (target.name + 'Radio');
        } else if (target.type === 'range' || target.type === 'number') {
            value = roundToTwoPlaces(forceNumber(value));

            if (name === 'phase') {
                value = Math.max(value, target.min);
                value = Math.min(value, target.max);
            }
        }

        // Free-form text fields (i.e. number fields) set state on blur,
        // not on change.
        if (target.type === 'number' && name !== 'phase') {
            this.setState({
                [name + 'Field']: value
            });
        } else {
            this.setState({
                [name]: value
            });
        }

        if (name === 'phase') {
            this.setState({
                visualPhase: this.getVisualPhase(value)
            });
        } else if (name === 'longitude') {
            this.setState({
                visualPhase: this.getVisualPhase(this.state.phase)
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
        this.setState({
            phase: newPhase,
            visualPhase: this.getVisualPhase(newPhase)
        });
    }
    onPresetSelect(e) {
        if (!e.target || typeof e.target.value === 'undefined') {
            return;
        }

        const preset = forceNumber(e.target.value);
        if (preset === -1) {
            return;
        }

        if ((preset - 1) < systemPresets.length) {
            const values = systemPresets[preset - 1];

            if (values.img) {
                const filename = `./img/caleb/${values.img}.png`;
                values['lightcurveDataImg'] = filename;
            } else {
                values['lightcurveDataImg'] = null;
            }

            const me = this;
            this.setState(values, function() {
                const visualPhase = me.getVisualPhase(me.state.phase);
                me.setState({visualPhase: visualPhase});
            });
        }
    }
    onStartClick() {
        if (!this.state.isPlaying) {
            this.then = Date.now();
            this.animate();
        } else {
            cancelAnimationFrame(this.frameId);
        }

        this.setState({
            isPlaying: !this.state.isPlaying
        });
    }
    onWindowOpen() {
        this.setState({showHRDiagram: true});
    }
    onWindowClose() {
        this.setState({showHRDiagram: false});
    }

    setParametersToMatch() {
        const systemsList = {};
        const systemsArray = {};

        let i = systemsList;

        if (i === " ") {
            return undefined;
        }

        let dataObject = systemsArray[parseInt(i)];
        this.sysProps.a = dataObject.a;
        this.sysProps.e = dataObject.e;
        //star1.m = dataObject.m1;
        //star2.m = dataObject.m2;
        this.setState({
            star1Mass: dataObject.m1,
            star2Mass: dataObject.m2
        });

        /*let period = 0.115496 * Math.sqrt(
            Math.pow(this.sysProps.a, 3) / (
                this.state.star1Mass + this.state.star2Mass));*/
        //systemPeriodField.text =
        //    "system period: " + Math.toSigDigits(period,3) + " days";
        //let infoString = "";

        if (dataObject.r1 === -1) {
            this.setState({star1Radius: 0.1});
            //infoString = "r1 = -1, ";
        } else {
            this.setState({star1Radius: dataObject.a * dataObject.r1});
        }

        if (dataObject.r2 === -1) {
            this.setState({star2Radius: 0.1});
            //infoString = infoString + "r2 = -1";
        } else {
            this.setState({star2Radius: dataObject.a * dataObject.r2});
        }

        this.setState({
            star1Temp: dataObject.t1,
            star2Temp: dataObject.t2,
            star1Lum: getLuminosityFromRadiusAndTemp(
                this.state.star1Radius, this.state.star1Temp),
            star2Lum: getLuminosityFromRadiusAndTemp(
                this.state.star2Radius, this.state.star2Temp)
        });

        this.setMassRange(1);
        this.setRadiusRange(1);
        this.setTempRange(1);
        this.setMassRange(2);
        this.setRadiusRange(2);
        this.setTempRange(2);
        this.setSeparationRange();
        this.setEccentricityRange();
    }

    setRestrictToMainSequence(star) {
        let thisStar, otherStar, otherStarNumber;
        if (star === 1) {
            otherStarNumber = 2;
            thisStar = this.star1;
            otherStar = this.star2;
        } else if (star === 2) {
            otherStarNumber = 1;
            thisStar = this.star2;
            otherStar = this.star1;
        } else {
            return;
        }

        var RmaxVis = this.sysProps.a * (1 - this.sysProps.e) - otherStar.r;
        var TmaxVis = getTempFromRadius(RmaxVis);

        var Tmin = this.state[`star${star}TempMin`];
        var Tmax = Math.min(
            this.state[`star${star}TempMax`],
            TmaxVis);

        if (Tmin > Tmax) {
            console.error("case where T is too big");

            // need to adjust a and e to allow a main sequence star to fit

            // make the star as small as possible
            thisStar.t = Tmin;
            thisStar.l = getLuminosityFromTempAndClass(thisStar.t);
            thisStar.m = getMassFromLuminosity(thisStar.l);
            thisStar.r = getRadiusFromTempAndLuminosity(thisStar.t, thisStar.l);

            // how big of a separation is needed at the current eccentricity?
            var sep = (thisStar.r + otherStar.r)/(1-this.sysProps.e);

            // is this separation too big?
            if (sep>this.AmaxSld) {
                // it is too big
                this.sysProps.a = this.AmaxSld;

                // now adjust e as needed
                this.sysProps.e = 1 - ((thisStar.r + otherStar.r) / this.sysProps.a);
            } else if (sep < this.AminSld) {
                this.sysProps.a = this.AminSld;
            } else {
                this.sysProps.a = sep;
            }

            this.setState({
                eccentricity: this.sysProps.e,
                separation: this.sysProps.a,
            });

            let initObj = {};
            initObj["radius" + star] = thisStar.r;
            initObj["mass" + star] = thisStar.m;
            initObj.eccentricity = this.sysProps.e;
            initObj.separation = this.sysProps.a;
            //visualizationMC.initialize(initObj);
        } else {
            var temp = thisStar.t;

            if (temp<Tmin) temp = Tmin;
            else if (temp>Tmax) temp = Tmax;

            thisStar.t = temp;
            thisStar.l = getLuminosityFromTempAndClass(temp);
            thisStar.r = getRadiusFromTempAndLuminosity(temp, thisStar.l);
            thisStar.m = getMassFromLuminosity(thisStar.l);

            let initObj = {};
            initObj["radius"+star] = thisStar.r;
            initObj["mass"+star] = thisStar.m;
            //visualizationMC.initialize(initObj);
        }

        this["mass"+star+"Slider"] = thisStar.m;
        this["radius"+star+"Slider"] = thisStar.r;
        this["temp"+star+"Slider"] = thisStar.t;

        //hrDiagramWindowMC.hrDiagramMC.setPointPosition(star, thisStar.t, thisStar.l);

        //visualizationMC.passObjectToIcon(star, {temp: thisStar.t});
        //this.drawLightCurve();

        // since the eccentricity might have changed...
        //visualizationMC.phase = curveMC._cursorPhase + (curveMC._closestIndex/curveMC._numCurvePoints);

        /*var period = 0.115496 * Math.sqrt(
            Math.pow(this.sysProps.a, 3) / (this.star1.m + this.star2.m));*/
        //systemPeriodField.text = "system period: " + Math.toSigDigits(period, 3) + " days";

        if (this.systemsList !== ' ') {
            //setParametersToMatchButton.setEnabled(true);
        }

        this.setSeparationRange();
        this.setEccentricityRange();

        this.setRadiusRange(otherStarNumber);
    }

    setTempAndLuminosity(star, temp, lum) {
        let otherStarNumber, thisStar;

        if (star === 1) {
            otherStarNumber = 2;
            thisStar = this.star1;
        } else if (star === 2) {
            otherStarNumber = 1;
            thisStar = this.star2;
        } else {
            return undefined;
        }

        const TminSld = this.state[`star${star}TempMin`];
        const TmaxSld = this.state[`star${star}TempMax`];

        if (temp < TminSld) {
            temp = TminSld;
        } else if (temp > TmaxSld) {
            temp = TmaxSld;
        }

        let rad = getRadiusFromTempAndLuminosity(temp, lum);
        let RminHR = getRadiusFromTempAndLuminosity(temp, this.Lmin);
        let RmaxHR = getRadiusFromTempAndLuminosity(temp, this.Lmax);
        const RmaxVis = this.state.separation * (
            1 - this.state.eccentricity
        ) - this.state[`star${otherStarNumber}Radius`];

        //otherStar.r;
        let Rmin = Math.max(
            this.state[`star${star}RadiusMin`],
            RminHR);
        let Rmax = Math.min(Math.min(
            this.state[`star${star}RadiusMax`],
            RmaxHR), RmaxVis);

        if (Rmin > Rmax + 1.0e-8) {
            rad = RmaxVis;
            temp = getTempFromLuminosityAndRadius(this.Lmin, rad);
        } else if (rad < Rmin) {
            rad = Rmin;
        } else if (rad > Rmax) {
            rad = Rmax;
        }
        thisStar.r = rad;
        thisStar.t = temp;
        thisStar.l = getLuminosityFromRadiusAndTemp(rad, temp);
        //this["radius" + star + "Slider"] = rad;
        //this["temp" + star + "Slider"] = temp;

        this.setState({
            [`star${star}Radius`]: rad,
            [`star${star}Temp`]: temp,
            [`star${star}Lum`]: thisStar.l
        });

        //visualizationMC["radius" + star] = rad;
        //hrDiagramWindowMC.hrDiagramMC.setPointPosition(star,thisStar.t,thisStar.l);
        //visualizationMC.passObjectToIcon(star,{temp:thisStar.t});
        //this.drawLightCurve();
        /*if (systemsList.getValue() != " ") {
            setParametersToMatchButton.setEnabled(true);
            }*/

        this.setSeparationRange();
        this.setEccentricityRange();
        this.setRadiusRange(otherStarNumber);

        this.setRadiusRange(star);
        this.setTempRange(star);
    }

    onDotMove(id, temp, lum) {
        this.setTempAndLuminosity(id, temp, lum);
    }
}

const domContainer = document.querySelector('#sim-container');
ReactDOM.render(<EclipsingBinarySimulator />, domContainer);
