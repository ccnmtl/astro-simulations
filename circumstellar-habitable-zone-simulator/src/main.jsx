import React from 'react';
import ReactDOM from 'react-dom';
import * as PIXI from 'pixi.js';

import CSHZNav from './nav';
import CSHZSettings from './diagram-settings';
import CSHZStarProperties from './star-properties';
import {
    getLuminosityFromMass, getTempFromLuminosity, getRadiusFromTempAndLuminosity,
    roundToTwoPlaces
} from '../../eclipsing-binary-simulator/src/utils.js';

class CircumstellarHabitableZoneSim extends React.Component {
    constructor(props) {
        super(props);
        this.initialState = {
            showScaleGrid: false,
            showSolarSystemOrbits: true,
            starMass: 1.0,
            starLuminosity: 1.0,
            starTemperature: 5700,
            starRadius: 1.0,
            planetDistance: 1.0,
        };
        this.state = this.initialState;
        this.cshzDiagram = React.createRef();

        this.handleShowScaleGrid = this.handleShowScaleGrid.bind(this);
        this.handleShowSolarSystemOrbits = this.handleShowSolarSystemOrbits.bind(this);
        this.setStarMass = this.setStarMass.bind(this);
        this.setPlanetDistance = this.setPlanetDistance.bind(this);
    }

    componentDidMount() {
        const app = new PIXI.Application({
            backgroundColor: 0x000000,
            width: this.cshzDiagram.current.clientWidth,
            height: 300,
            sharedLoader: true,
            sharedTicker: true
        });

        this.app = app;
        this.cshzDiagram.current.appendChild(app.view);
    }

    handleShowScaleGrid() {
        this.setState((state) => ({
            showScaleGrid: !state.showScaleGrid,
        }));
    }

    handleShowSolarSystemOrbits() {
        this.setState((state) => ({
            showSolarSystemOrbits: !state.showSolarSystemOrbits,
        }));
    }

    setStarMass(starMass) {
        // Given a star's mass, update luminosity, temp, and radius
        const luminosity = getLuminosityFromMass(starMass);
        const temp = getTempFromLuminosity(luminosity);
        const radius = getRadiusFromTempAndLuminosity(temp, luminosity);
        this.setState({
            starMass: starMass,
            starLuminosity: roundToTwoPlaces(luminosity),
            starTemperature: Math.round(temp),
            starRadius: roundToTwoPlaces(radius)
        })
    }

    setPlanetDistance(distance) {
        this.setState(() => ({
            planetDistance: distance
        }));
    }

    render() {
        return(<>
            <CSHZNav />
            <div className='row mt-2'>
                <div className='col-12' ref={this.cshzDiagram} />
            </div>
            <div className='row mt-2'>
                <div className='col-3'>
                    <CSHZSettings 
                        showScaleGrid={this.state.showScaleGrid}
                        handleShowScaleGrid={this.handleShowScaleGrid}
                        showSolarSystemOrbits={this.state.showSolarSystemOrbits}
                        handleShowSolarSystemOrbits={this.handleShowSolarSystemOrbits}
                        />
                </div>
                <div className='col-9'>
                    <CSHZStarProperties 
                        starMass={this.state.starMass}
                        starLuminosity={this.state.starLuminosity}
                        starTemperature={this.state.starTemperature}
                        starRadius={this.state.starRadius}
                        setStarMass={this.setStarMass}
                        planetDistance={this.state.planetDistance}
                        setPlanetDistance={this.setPlanetDistance} />
                </div>
            </div>
            <div className='row mt-2'>
                <div className='col-12'>
                Timeline
                </div>
            </div>
        </>);
    }
}

const domContainer = document.querySelector('#sim-container');
ReactDOM.render(<CircumstellarHabitableZoneSim />, domContainer);
