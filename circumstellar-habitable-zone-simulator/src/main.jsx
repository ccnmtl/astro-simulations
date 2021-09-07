import React from 'react';
import ReactDOM from 'react-dom';

import CSHZNav from './nav';
import CSHZDiagram from './diagram';
import CSHZStarProperties from './star-properties';
import CSHZTimeline from './timeline';
import {
    roundToTwoPlaces
} from '../../eclipsing-binary-simulator/src/utils.js';
import { getHZone, PLANET_DISTANCES } from './utils';
import {shzStarData as STAR_DATA} from './shzStars.js';

const INIT_STAR_IDX = 7

export const LOG_BASE = 10;

class CircumstellarHabitableZoneSim extends React.Component {
    constructor(props) {
        super(props);
        const initLum = LOG_BASE ** STAR_DATA[INIT_STAR_IDX].dataTable[0].logLum;
        const [hZoneInner, hZoneOuter] = getHZone(initLum);
        const initPlanetDistIdx = 189;
        this.initialState = {
            starMassIdx: INIT_STAR_IDX,
            starMass: STAR_DATA[INIT_STAR_IDX].mass,
            starAge: 0.0,
            starAgeIdx: 0,
            // TODO: How should these values be initialized w/ respect to
            // the Sun's age? If values are taken for the Sun at the start
            // of it's life, then the values will be < 1, which might be
            // confusing for users
            starLuminosity: roundToTwoPlaces(initLum),
            starTemperature: Math.round(LOG_BASE ** STAR_DATA[INIT_STAR_IDX].dataTable[0].logTemp),
            starRadius: roundToTwoPlaces(LOG_BASE ** STAR_DATA[INIT_STAR_IDX].dataTable[0].logRadius),
            planetDistance: PLANET_DISTANCES[initPlanetDistIdx],
            planetDistanceIdx: initPlanetDistIdx,
            habitableZoneInner: hZoneInner,
            habitableZoneOuter: hZoneOuter,
            showSolarSystemOrbits: true,
        };
        this.state = this.initialState;

        this.setStarMassIdx = this.setStarMassIdx.bind(this);
        this.setPlanetDistanceIdx = this.setPlanetDistanceIdx.bind(this);
        this.setStarAgeIdx = this.setStarAgeIdx.bind(this);
        this.handleShowSolarSystemOrbits = this.handleShowSolarSystemOrbits.bind(this);
    }

    setStarMassIdx(starMassIdx) {
        // Given a star's mass, update luminosity, temp, and radius
        // Reset the star's age to zero, then lookup the other values in the data
        // also set the age range of the star and the increments of age range - you'll need those for the timeline
        const star = STAR_DATA[starMassIdx]

        const luminosity = LOG_BASE ** star.dataTable[0].logLum;
        const temp = LOG_BASE ** star.dataTable[0].logTemp;
        const radius = LOG_BASE ** star.dataTable[0].logRadius;
        const [hZoneInner, hZoneOuter] = getHZone(luminosity);

        this.setState({
            starMassIdx: starMassIdx,
            starAge: 0, // Reset the star age
            starAgeIdx: 0,
            starLuminosity: roundToTwoPlaces(luminosity),
            starTemperature: Math.round(temp),
            starRadius: roundToTwoPlaces(radius),
            habitableZoneInner: hZoneInner,
            habitableZoneOuter: hZoneOuter
        })
    }

    setPlanetDistanceIdx(distanceIdx) {
        if (0 <= distanceIdx && distanceIdx < PLANET_DISTANCES.length) {
            this.setState(() => ({
                planetDistance: PLANET_DISTANCES[distanceIdx],
                planetDistanceIdx: distanceIdx
            }));
        }
    }

    setStarAgeIdx(idx) {
        if (idx >= 0 && idx < STAR_DATA[this.state.starMassIdx].dataTable.length) {
            const star = STAR_DATA[this.state.starMassIdx]

            const luminosity = LOG_BASE ** star.dataTable[idx].logLum;
            const temp = LOG_BASE ** star.dataTable[idx].logTemp;
            const radius = LOG_BASE ** star.dataTable[idx].logRadius;
            const [hZoneInner, hZoneOuter] = getHZone(luminosity);

            this.setState({
                starAgeIdx: idx,
                starLuminosity: roundToTwoPlaces(luminosity),
                starTemperature: Math.round(temp),
                starRadius: roundToTwoPlaces(radius),
                habitableZoneInner: hZoneInner,
                habitableZoneOuter: hZoneOuter
            });
        }
    }

    handleShowSolarSystemOrbits() {
        this.setState((prevState) => {
            return {showSolarSystemOrbits: !prevState.showSolarSystemOrbits}
        })
    }

    render() {
        return(<>
            <CSHZNav />
            <div className='row mt-2'>
                <CSHZDiagram
                    starRadius={this.state.starRadius}
                    planetDistance={this.state.planetDistance}
                    habitableZoneInner={this.state.habitableZoneInner}
                    habitableZoneOuter={this.state.habitableZoneOuter}
                    showSolarSystemOrbits={this.state.showSolarSystemOrbits}/>
            </div>
            <div className='row mt-2'>
                <div className='col-12'>
                    <CSHZTimeline
                        starMassIdx={this.state.starMassIdx}
                        starAge={this.state.starAge}
                        starAgeIdx={this.state.starAgeIdx}
                        setStarAgeIdx={this.setStarAgeIdx}
                        planetDistance={this.state.planetDistance}/>
                </div>
            </div>
            <div className='row mt-2'>
                <div className='col-12'>
                    <CSHZStarProperties
                        starMassIdx={this.state.starMassIdx}
                        starAgeIdx={this.state.starAgeIdx}
                        starLuminosity={this.state.starLuminosity}
                        starTemperature={this.state.starTemperature}
                        starRadius={this.state.starRadius}
                        setStarMassIdx={this.setStarMassIdx}
                        planetDistanceIdx={this.state.planetDistanceIdx}
                        setPlanetDistanceIdx={this.setPlanetDistanceIdx}
                        showSolarSystemOrbits={this.state.showSolarSystemOrbits}
                        handleShowSolarSystemOrbits={this.handleShowSolarSystemOrbits}/>
                </div>
            </div>
        </>);
    }
}

const domContainer = document.querySelector('#sim-container');
ReactDOM.render(<CircumstellarHabitableZoneSim />, domContainer);
