import React from 'react';
import NavigationBar from './NavigationBar.jsx';
import MainView from './MainView.jsx';
import Spectrum from './Spectrum.jsx';
import PhotonBeams from './PhotonBeams.jsx';
import {formatEnergy, formatFrequency, formatWavelength} from "./utils/FormatValues";
import {tickMarkEnergyValues, tickMarkFrequencyValues, tickMarkWavelengthValues} from "./utils/TickMarksData";
import Slider from "./Slider";
import EnergyLevelDiagram from "./EnergyLevelDiagram";
import EventLog from "./EventLog";
import { wavelengthToColor } from "./utils/WavelengthToHex";
import ManualDeexcitation from "./ManualDeexcitation";
import Color from 'color';

const WIDTH = 950;
const HEIGHT = 280;

const PLANCK_CONSTANT = 6.62607004e-34;
const COULOMB_CHARGE = 1.602176634e-19;
const LIGHT_SPEED = 299792458;

export default class HydrogenAtomSimulator extends React.Component {
    constructor(props) {
        super(props);
        this.initialState = {
            eventLog: [],
            currentEnergyLevel: 1,
            timeUntilDeExcitation: 0,
            electronIsBeingDragged: false,
            moveElectron: false,
            automaticDeExcitation: true,
            deexcitationEvent: false,
            photon: {
                fired: false,
                emitted: false,
                frequency: 6.0E15,
                wavelength: 495E-9,
                energyValue: 2.5,
                passThrough: true,
                color: 'rgb(0, 255, 192)'
            }
        };

        this.state = this.initialState;
        this.energyLevelValues = [-13.598, -3.400, -1.511, -0.850, -0.544, -0.378];

        this.timer = {
            id: null,
            started: false,
        };

        this.deExcitation = this.deExcitation.bind(this);
        this.onResetClick = this.onResetClick.bind(this);
    }

    render() {
        let photonButtonTextColor = 'black';

        const photonColor = Color(this.state.photon.color);
        if (photonColor.isDark()) {
            photonButtonTextColor = 'white';
        }

        return (
            <React.Fragment>
                <NavigationBar
                    onResetClick={this.onResetClick.bind(this)}
                />
                <div className="clearfix"></div>

                <div className={"TopHalf"}>
                    <div className={"MainView"}>
                        <div className={"BackgroundSVG"}>
                            <svg width={WIDTH} height={HEIGHT}>
                                <MainView
                                    fired={this.state.photon.fired}
                                    emitted={this.state.photon.emitted}
                                    currentEnergyLevel={this.state.currentEnergyLevel}
                                    moveElectron={this.state.moveElectron}
                                    updateEnergyLevel={this.updateEnergyLevel.bind(this)}
                                    startDeExcitation={this.startDeExcitation.bind(this)}
                                    changeElectronState={this.changeElectronState.bind(this)}
                                    electronIsBeingDragged={this.state.electronIsBeingDragged}
                                />
                            </svg>
                        </div>

                        <div className={"BackgroundCanvas"}>
                            <PhotonBeams
                                photon={this.state.photon}
                                deexcitation={this.state.deexcitationEvent}
                                currentEnergyLevel={this.state.currentEnergyLevel}
                                stopPhotonAnimation={this.stopPhotonAnimation.bind(this)}
                                startDeExcitation={this.startDeExcitation.bind(this)}
                                changeElectronState={this.changeElectronState.bind(this)}
                                changeDeExcitationState={this.changeDeExcitationState.bind(this)}
                            />
                        </div>
                    </div>

                    <div className={"Diagram"}>
                        <p className={"TitleText"}>Energy Level Diagram</p>
                        <div>
                            <EnergyLevelDiagram
                                currentEnergyLevel={this.state.currentEnergyLevel}
                            />
                        </div>
                    </div>
                </div>

                <div className={"BottomHalf"}>
                    <div className={"Controls"}>
                        <p className={"TitleText"}>Photon Selection</p>

                        <div className={"PhotonSpectrum"}>
                            <p id="frequencyLabel">
                                <em>Frequency</em>
                            </p>
                            <Spectrum
                                energyValue={this.state.photon.energyValue}
                                value={formatFrequency(this.state.photon.frequency)}
                                tickMarksData={tickMarkFrequencyValues}
                                id={0}
                            />
                        </div>

                        <div className={"PhotonSpectrum"}>
                            <p id="wavelengthLabel">
                                <em>Wavelength</em>
                            </p>
                            <Spectrum
                                energyValue={this.state.photon.energyValue}
                                value={formatWavelength(this.state.photon.wavelength)}
                                tickMarksData={tickMarkWavelengthValues}
                                id={1}
                            />
                        </div>

                        <div className={"PhotonSpectrum"}>
                            <p id="energyLabel">
                                <em>Energy</em>
                            </p>
                            <Spectrum
                                energyValue={this.state.photon.energyValue}
                                value={formatEnergy(this.state.photon.energyValue)}
                                tickMarksData={tickMarkEnergyValues}
                                id={2}
                            />
                        </div>

                        <div className={"sliderNames"}>
                            <p id={"infraredLabel"}>Infrared</p>
                            <p id={"visibleLabel"}>Visible</p>
                            <p id={"ultravioletLabel"}>Ultraviolet</p>
                        </div>

                        <Slider
                            photon={this.state.photon}
                            changePhoton={this.changePhoton.bind(this)}
                            firePhoton={this.firePhoton.bind(this)}
                        />

                        <div className="FirePhotonButton text-center mb-1">
                            <button type="button"
                                    className="fireButton btn btn-secondary"
                                    style={{
                                        backgroundColor: this.state.photon.color,
                                        color: photonButtonTextColor
                                    }}
                                    onClick={this.firePhoton.bind(this)}>
                                {"Fire Photon "}
                            </button>
                        </div>

                        <div className="clearfix"></div>
                    </div>

                    <div className="RightColumn">

                        <div className="EventLog">
                            <p className={"TitleText"}>Event Log</p>
                            <div className={"LogContainer"}>
                                <EventLog
                                    eventLog={this.state.eventLog}
                                />

                                {/*<button> Click to scroll </button>*/}
                            </div>


                            <form>
                                <button
                                    type="button"
                                    className="clearLogButton btn btn-secondary btn-sm mt-2 d-block mx-auto"
                                    onClick={this.clearLog.bind(this)}>
                                    Clear Log
                                </button>
                            </form>
                        </div>

                        <div className="ManualExcitations">
                            <label className="ml-1 mt-1">
                                Manual De-excitation

                                <span className="pauseSwitch ml-2">
                                    <span className="switch">
                                        <input
                                            type="checkbox"
                                            onChange={this.changePauseDeExcitation.bind(this)}
                                            checked={!this.state.automaticDeExcitation}
                                        />
                                        <span className="slider round"/>
                                    </span>
                                </span>
                            </label>

                            <ManualDeexcitation
                                currentEnergyLevel={this.state.currentEnergyLevel}
                                automaticDeExcitation={this.state.automaticDeExcitation}
                                manuallyEmit={this.manuallyEmit.bind(this)}
                            />
                        </div>

                    </div>

                </div>


            </React.Fragment>
        );
    }

    componentDidUpdate() {
        // Uncomment if Geoff wants to clear event log on drag

        // if (prevState !== this.state && this.state.electronIsBeingDragged) {
        //     let emptyArray = [];
        //     this.setState({ eventLog: emptyArray });
        // }
    }

    clearLog() {
        this.setState({ eventLog: [] });
    }

    changePauseDeExcitation() {
        this.setState({ automaticDeExcitation: !this.state.automaticDeExcitation});
        // The reason why it looks reversed is because when this function is called,
        // the setState is changing to !this.state.automaticDeExcitation, so we need to incorporate the new
        // excitation into the conditional.
        if (this.state.automaticDeExcitation) {
            clearInterval(this.timer.id);
            this.timer.started = false;
        } else {
            if (this.timer.started) { clearInterval(this.timer.id); }
            this.timer.started = true;
            this.timer.id = setTimeout(() => this.deExcitation(), 3000);
        }
    }

    startDeExcitation() {
        if (this.state.electronIsBeingDragged || !this.state.automaticDeExcitation) {
            clearInterval(this.timer.id);
            this.timer.started = false;
            return;
        }

        if (this.timer.started) { clearInterval(this.timer.id); }
        this.timer.started = true;
        this.timer.id = setTimeout(() => this.deExcitation(), 3000);
    }

    manuallyEmit(desiredEnergyLevel) {
        if (!this.state.automaticDeExcitation) {
            // this.deExcitation();
            if (desiredEnergyLevel >= 1) {
                this.deExcitation(desiredEnergyLevel);
            } else {
                this.deExcitation();
            }
        }
    }

    deExcitation(desiredEnergyLevel) {
        let photonS = this.state.photon;
        photonS.emitted = true;
        let newEnergyLevel = Math.floor(Math.random() * (this.state.currentEnergyLevel - 1)) + 1;
        if (desiredEnergyLevel) newEnergyLevel = desiredEnergyLevel;
        let photonEnergy = this.energyLevelValues[this.state.currentEnergyLevel - 1]
            - this.energyLevelValues[newEnergyLevel - 1];

        let photonWavelength = ((PLANCK_CONSTANT * LIGHT_SPEED) / photonEnergy) / COULOMB_CHARGE;
        let photonColorRGB = Color(
            wavelengthToColor(photonWavelength * 1e9)
        ).rgb().string();

        let photonEvent = this.state.currentEnergyLevel === 7 ? "" : "emitted";
        let electronEvent = this.state.currentEnergyLevel === 7 ? "recombination" : "deexcitation";

        let newEvent = {
            previousEnergyLevel: this.state.currentEnergyLevel,
            newEnergyLevel: newEnergyLevel,
            photonEnergy: photonEnergy,
            photonEvent: photonEvent,
            electronEvent: electronEvent,
            emitted: true,
            color: photonColorRGB,
            absorbed: false,
        };

        let newEventLog = this.state.eventLog;
        if (!(newEnergyLevel === this.state.currentEnergyLevel)) {
            newEventLog = this.state.eventLog.slice();
            newEventLog.push(newEvent);
        }

        this.setState({
            photon: photonS,
            currentEnergyLevel: newEnergyLevel,
            eventLog: newEventLog,
            deexcitationEvent: this.state.currentEnergyLevel !== 7,
        }, this.stopPhotonEmission.bind(this));

        this.timer.started = false;
        clearInterval(this.timer.id);
        // this.stopPhotonEmission();
        // if (!manual) this.stopPhotonEmission();
        if (newEnergyLevel !== 1 && this.state.automaticDeExcitation) this.timer.id = setTimeout(() => this.deExcitation(), 3000);
    }

    changeDeExcitationState() {
        this.setState({ deexcitationEvent: false });
    }

    updateEnergyLevel(newEnergyLevel, beingDragged) {
        this.setState({
            currentEnergyLevel: newEnergyLevel,
            electronIsBeingDragged: beingDragged
        });
    }

    stopPhotonEmission() {
        let photonState = this.state.photon;
        photonState.emitted = false;
        this.setState({ photon: photonState });
    }

    stopPhotonAnimation() {
        let photonState = this.state.photon;
        photonState.fired = false;
        this.setState({ photon: photonState });
    }

    changeElectronState(moveElectron) {
        if (this.state.moveElectron !== moveElectron) this.setState( {moveElectron: moveElectron });
    }

    changePhoton(newPhoton, firePhotonNow) {
        this.setState({
            photon: newPhoton
        }, () => {
            if (firePhotonNow) this.firePhoton();
        });
    }

    firePhoton() {
        // If the photon has already been fired, you can't fire it again until it passes.
        // if (this.state.photon.fired || this.state.deexcitationEvent) return;
        if (this.state.photon.fired) return;

        // Clear the intervals so there's no deexcitations happening at the same time
        clearInterval(this.timer.id);
        this.timer.started = false;

        let photonEnergy = this.state.photon.energyValue;
        let electronEnergy = this.energyLevelValues[this.state.currentEnergyLevel - 1];
        let totalEnergy = Number.parseFloat((photonEnergy + electronEnergy).toFixed(3));

        let newEnergyLevel = totalEnergy >= 0 ? 7 : this.state.currentEnergyLevel;
        let delta = 0.005; // used to be 0.01 but caused errors sometimes
        this.energyLevelValues.forEach((element, index) => {
            if (totalEnergy >= (element - delta) && totalEnergy <= (element + delta)) {
                newEnergyLevel = index + 1;
            }
        });

        let photonState = this.state.photon;
        photonState.fired = true;
        photonState.passThrough = newEnergyLevel === this.state.currentEnergyLevel;

        let photonEvent = photonState.passThrough ? "not absorbed" : "absorbed";
        let electronEvent = photonState.passThrough ? "" : "excitation";
        if (newEnergyLevel === 7) electronEvent = "ionization";

        let newEvent = {
            previousEnergyLevel: this.state.currentEnergyLevel,
            newEnergyLevel: newEnergyLevel,
            photonEnergy: photonEnergy,
            photonEvent: photonEvent,
            electronEvent: electronEvent,
            color: photonState.color,
            emitted: false,
            absorbed: !photonState.passThrough,
        };

        const newEventLog = this.state.eventLog.slice();
        newEventLog.push(newEvent);

        this.setState({
            photon: photonState,
            currentEnergyLevel: newEnergyLevel,
            eventLog: newEventLog
        });
    }

    onResetClick(e) {
        e.preventDefault();
        this.setState(this.initialState);
    }
}
