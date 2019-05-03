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
    getLuminosityFromRadiusAndTemp,
    getSystemTheta, getSystemPhi
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

            lockOnPerspectiveFromEarth: true,
            showOrbitalPaths: true,
            showOrbitalPlane: true,

            animationSpeed: 1,
            phase: 0.7,

            showLightcurve: true,

            // Star 1 Properties
            star1Mass: 1,
            star1Radius: 1.5,
            star1Temp: 8700,
            star1Lum: 0,

            // Star 2 Properties
            star2Mass: 1,
            star2Radius: 1.5,
            star2Temp: 5000,
            star2Lum: 0,

            // System Properties
            separation: 10,
            eccentricity: 0.3
        };
        this.state = this.initialState;

        this.handleInputChange = this.handleInputChange.bind(this);
        this.onWindowOpen = this.onWindowOpen.bind(this);
        this.onWindowClose = this.onWindowClose.bind(this);
        this.onPhaseUpdate = this.onPhaseUpdate.bind(this);
        this.onPresetSelect = this.onPresetSelect.bind(this);
        this.onStartClick = this.onStartClick.bind(this);
        this.onDotMove = this.onDotMove.bind(this);

        this.animate = this.animate.bind(this);

        this.lightcurveViewRef = React.createRef();

        this.sysProps = {};
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
                        inclination={this.state.inclination}
                        longitude={this.state.longitude} />

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
                                    value={this.state.longitude}
                                    onFocus={this.handleFocus}
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
                            <label className="col-2 col-form-label col-form-label-sm">
                                Inclination:
                            </label>

                            <div className="col-10">
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    name="inclination"
                                    value={this.state.inclination}
                                    onFocus={this.handleFocus}
                                    onChange={this.handleInputChange}
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
                           name="lockOnPerspectiveFromEarth"
                           onFocus={this.handleFocus}
                           onChange={this.handleInputChange}
                           checked={this.state.lockOnPerspectiveFromEarth}
                           id="lockOnPerspectiveFromEarthToggle" />
                    <label className="custom-control-label"
                           htmlFor="lockOnPerspectiveFromEarthToggle">
                        Lock on perspective from earth
                    </label>
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
                                    value={this.state.star1Mass}
                                    onFocus={this.handleFocus}
                                    onChange={this.handleInputChange}
                                    step={0.1} />

                                <RangeStepInput
                                    className="form-control"
                                    name="star1Mass"
                                    value={this.state.star1Mass}
                                    onChange={this.handleInputChange}
                                    min={0.1} max={85} step={0.1} />
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
                                    value={this.state.star1Radius}
                                    onFocus={this.handleFocus}
                                    onChange={this.handleInputChange}
                                    step={0.1} />

                                <RangeStepInput
                                    className="form-control"
                                    name="star1Radius"
                                    value={this.state.star1Radius}
                                    onChange={this.handleInputChange}
                                    min={0.1} max={5} step={0.1} />
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
                                    value={this.state.star1Temp}
                                    onFocus={this.handleFocus}
                                    onChange={this.handleInputChange}
                                    min={3000} max={45000}
                                    step={1} />

                                <RangeStepInput
                                    className="form-control"
                                    name="star1Temp"
                                    value={this.state.star1Temp}
                                    onChange={this.handleInputChange}
                                    min={3000} max={45000}
                                    step={1} />
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
                                    value={this.state.star2Mass}
                                    onFocus={this.handleFocus}
                                    onChange={this.handleInputChange}
                                    step={0.1} />

                                <RangeStepInput
                                    className="form-control"
                                    name="star2Mass"
                                    value={this.state.star2Mass}
                                    onChange={this.handleInputChange}
                                    min={0.1} max={85} step={0.1} />
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
                                    value={this.state.star2Radius}
                                    onFocus={this.handleFocus}
                                    onChange={this.handleInputChange}
                                    step={0.1} />

                                <RangeStepInput
                                    className="form-control"
                                    name="star2Radius"
                                    value={this.state.star2Radius}
                                    onChange={this.handleInputChange}
                                    min={0.1} max={5} step={0.1} />
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
                                    value={this.state.star2Temp}
                                    onFocus={this.handleFocus}
                                    onChange={this.handleInputChange}
                                    min={3000} max={45000}
                                    step={1} />

                                <RangeStepInput
                                    className="form-control"
                                    name="star2Temp"
                                    value={this.state.star2Temp}
                                    onChange={this.handleInputChange}
                                    min={3000} max={45000}
                                    step={1} />
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
                                    value={this.state.separation}
                                    onFocus={this.handleFocus}
                                    onChange={this.handleInputChange}
                                    min={0.1} max={60}
                                    step={0.01} />

                                <RangeStepInput
                                    className="form-control"
                                    name="separation"
                                    value={this.state.separation}
                                    onChange={this.handleInputChange}
                                    min={0.1} max={60}
                                    step={0.01} />
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
                                    value={this.state.eccentricity}
                                    onFocus={this.handleFocus}
                                    onChange={this.handleInputChange}
                                    min={0.1} max={0.6}
                                    step={0.01} />

                                <RangeStepInput
                                    className="form-control"
                                    name="eccentricity"
                                    value={this.state.eccentricity}
                                    onChange={this.handleInputChange}
                                    min={0.1} max={0.6}
                                    step={0.01} />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </React.Fragment>;
    }
    componentDidMount() {
        this.drawLightcurve();
    }
    componentDidUpdate(prevProps, prevState) {
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

    animate() {
        this.frameId = requestAnimationFrame(this.animate);

        const now = Date.now();
        const elapsed = now - this.then;

        if (elapsed > 50) {
            const newPhase = (this.state.phase + (
                0.005 * this.state.animationSpeed)) % 1;
            this.setState({phase: newPhase});

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
            value = forceNumber(value);
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
            this.setState(values);
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

        let i = systemsList.getValue();

        if (i === " ") {
            return undefined;
        }

        let dataObject = systemsArray[i];
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

        /*setMassRange(1);
        setRadiusRange(1);
        setTempRange(1);
        setMassRange(2);
        setRadiusRange(2);
        setTempRange(2);
        setSeparationRange();
        setEccentricityRange();*/

        /*if (restrict1Check.getValue()) {
            restrict1Check.setValue(false);
        }

        if (restrict2Check.getValue()) {
            restrict2Check.setValue(false);
        }*/

        /*longitudeSlider.value = dataObject.w;
        inclinationSlider.value = dataObject.i;
        separationSlider.value = this.sysProps.a;
        eccentricitySlider.value = this.sysProps.e;
        mass1Slider.value = this.state.star1Mass;
        radius1Slider.value = this.state.star1Radius;
        temp1Slider.value = star1.t;
        mass2Slider.value = this.state.star2Mass;
        radius2Slider.value = this.state.star2Radius;
        temp2Slider.value = star2.t;
        hrDiagramWindowMC.hrDiagramMC.setPointPosition(1,star1.t,star1.l);
        hrDiagramWindowMC.hrDiagramMC.setPointPosition(2,star2.t,star2.l);*/

        const initObject = {
            separation: this.sysProps.a,
            eccentricity: this.sysProps.e,
            linePhi: getSystemPhi(),
            lineTheta: getSystemTheta(),
            mass1: this.state.star1Mass,
            mass2: this.state.star2Mass,
            radius1: this.state.star1Radius,
            radius2: this.state.star2Radius
        };

        console.log(initObject);

        /*if (perspectiveLockCheck.getValue()) {
            initObject.phi = initObject.linePhi;
            initObject.theta = initObject.lineTheta;
        }*/

        /*visualizationMC.initialize(initObject);
        visualizationMC.passObjectToIcon(1,{temp:star1.t});
        visualizationMC.passObjectToIcon(2,{temp:star2.t});*/
        this.drawLightCurve();
        //setPhase(curveMC.cursorPhase);
        //setParametersToMatchButton.setEnabled(false);
    }

    setTempAndLuminosity(star, temp, lum) {
        let otherStarNumber, thisStar, otherStar;

        if (star === 1) {
            otherStarNumber = 2;
            thisStar = 1;
            otherStar = 2;
        } else if (star === 2) {
            otherStarNumber = 1;
            thisStar = 2;
            otherStar = 1;
        } else {
            return undefined;
        }

        if (this["restrict" + star + "Check"].getValue()) {
            var RmaxVis = this.sysProps.a * (1 - this.sysProps.e) - otherStar.r;
            var TmaxVis = getTempFromRadius(RmaxVis);
            const TminSld = 0, TmaxSld = 100; // TODO
            var Tmin = TminSld;
            var Tmax = Math.min(TmaxSld,TmaxVis);
            if(temp < Tmin) {
                temp = Tmin;
            } else if(temp > Tmax) {
                temp = Tmax;
            }
            thisStar.t = temp;
            thisStar.l = getLuminosityFromTempAndClass(temp);
            thisStar.r = getRadiusFromTempAndLuminosity(temp,thisStar.l);
            thisStar.m = getMassFromLuminosity(thisStar.l);
            this["mass" + star + "Slider"].value = thisStar.m;
            this["radius" + star + "Slider"].value = thisStar.r;
            this["temp" + star + "Slider"].value = thisStar.t;
            var initObj = {};
            initObj["radius" + star] = thisStar.r;
            initObj["mass" + star] = thisStar.m;
            console.log(initObj);
            //visualizationMC.initialize(initObj);
            /*var period = 0.115496 * Math.sqrt(Math.pow(this.sysProps.a,3) / (
                this.state.star1Mass + this.state.star2Mass));*/
            //systemPeriodField.text = "system period: " + Math.toSigDigits(period,3) + " days";
        } else {
            const TminSld = 0, TmaxSld = 0; // TODO
            if (temp < TminSld) {
                temp = TminSld;
            } else if (temp > TmaxSld) {
                temp = TmaxSld;
            }
            const Lmin = 0, Lmax = 100; // TODO
            var rad = getRadiusFromTempAndLuminosity(temp, lum);
            var RminHR = getRadiusFromTempAndLuminosity(temp, Lmin);
            var RmaxHR = getRadiusFromTempAndLuminosity(temp, Lmax);
            RmaxVis = this.sysProps.a * (
                1 - this.sysProps.e) - otherStar.r;
            const RminSld = 0, RmaxSld = 100; // TODO
            var Rmin = Math.max(RminSld,RminHR);
            var Rmax = Math.min(Math.min(RmaxSld,RmaxHR),RmaxVis);
            if (Rmin > Rmax + 1.0e-8) {
                rad = RmaxVis;
                temp = getTempFromLuminosityAndRadius(Lmin, rad);
            } else if(rad < Rmin) {
                rad = Rmin;
            } else if(rad > Rmax) {
                rad = Rmax;
            }
            thisStar.r = rad;
            thisStar.t = temp;
            thisStar.l = getLuminosityFromRadiusAndTemp(rad, temp);
            this["radius" + star + "Slider"].value = rad;
            this["temp" + star + "Slider"].value = temp;
            //visualizationMC["radius" + star] = rad;
        }
        //hrDiagramWindowMC.hrDiagramMC.setPointPosition(star,thisStar.t,thisStar.l);
        //visualizationMC.passObjectToIcon(star,{temp:thisStar.t});
        this.drawLightCurve();
        /*if (systemsList.getValue() != " ") {
            setParametersToMatchButton.setEnabled(true);
        }*/
        var otherRestricted = this["restrict" + otherStarNumber + "Check"].getValue();
        var thisRestricted = this["restrict" + star + "Check"].getValue();
        this.setSeparationRange();
        this.setEccentricityRange();
        if (otherRestricted) {
            this.setRestrictedStarRanges(otherStarNumber);
        } else {
            this.setRadiusRange(otherStarNumber);
        }

        if (!thisRestricted) {
            this.setRadiusRange(star);
            this.setTempRange(star);
        }
    }

    onDotMove(id, temp, lum) {
        this.setTempAndLuminosity(id, temp, lum);
    }
}

const domContainer = document.querySelector('#sim-container');
ReactDOM.render(<EclipsingBinarySimulator />, domContainer);
