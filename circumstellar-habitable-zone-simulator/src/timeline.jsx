import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {
    VictoryAxis, VictoryBar, VictoryChart, VictoryContainer, VictoryLine
} from 'victory';
import { getHZone } from './utils.js';
import { LOG_BASE } from './main';
import {shzStarData as STAR_DATA} from './shzStars.js';

export default class CSHZTimeline extends React.Component {
    constructor(props) {
        super(props)
        this.getPlanetTemp = this.getPlanetTemp.bind(this);
    }

    getPlanetTemp(solarRadii, starTemp, planetDistance) {
       // T(planet) = [R(star)^2 x T(star)^4 / 4 d(planet)^2]^0.25  
       // convert solar radii to meters
       const radius = solarRadii * 6.96 * (10 ** 8) 
       // return planet temp in C
       return ((((radius ** 2) * (starTemp ** 4)) / (4 * (planetDistance ** 2))) ** 0.25) - 275;
    }

    render() {
        return(<div>
            <div>
                <h2>Timeline and Simulation Controls</h2>    
            </div>
            <div>
                Time since star system formation: {typeof this.props.starMassIdx == 'number' && (<>{STAR_DATA[this.props.starMassIdx].dataTable[this.props.starAgeIdx].time}</>)}
            </div>
            <div>
                {typeof this.props.starMassIdx == 'number' && this.props.planetDistance && (<>
                    <VictoryChart
                        // Domain is the stars age, range is surface temp of planet in C
                        domain={{x: [
                            0, Math.round(STAR_DATA[this.props.starMassIdx].timespan)]}} 
                        height={50}
                        width={960}>
                        <VictoryBar 
                            barWidth={2}
                            style={{
                                data: {fill: 'red'}
                            }}
                            data={[{x: STAR_DATA[this.props.starMassIdx].dataTable[this.props.starAgeIdx].time, y: 1}]}/>
                        <VictoryAxis 
                            tickCount={8}
                            style={{
                                ticks: {stroke: 'black', size: 10}
                            }}
                            tickFormat={(val) => {
                                return val < 1000 ? `${Math.round(val)} My` : `${Math.round(val / 1000)} Gy`  
                            }}/>
                    </VictoryChart>
                    <VictoryChart
                        // Domain is the stars age, range is surface temp of planet in C
                        domain={{x: [
                            0, Math.round(STAR_DATA[this.props.starMassIdx].timespan)],
                            y: [0, 100]}} 
                        height={200}
                        width={960}>
                        <VictoryAxis 
                            style={{
                                axis: {stroke: '#0000FF'},
                                tickLabels: {display: 'none'},
                                axisLabel: {padding: 5}
                            }}
                            tickFormat={[]}
                            label={'Too cold'}/>
                        <VictoryAxis 
                            orientation={'top'}
                            style={{
                                axis: {stroke: '#FF0000'},
                                tickLabels: {display: 'none'},
                                axisLabel: {padding: 5}
                            }}
                            tickFormat={[]}
                            label={'Too hot'}/>
                        <VictoryBar 
                            barWidth={2}
                            style={{
                                data: {fill: 'red'}
                            }}
                            data={[{x: STAR_DATA[this.props.starMassIdx].dataTable[this.props.starAgeIdx].time, y: 100}]}/>
                        <VictoryLine 
                            data={STAR_DATA[this.props.starMassIdx].dataTable}
                            x={(datum) => { return datum.time }}
                            y={(datum) => { 
                                // Calculate the temp
                                const starRadius = LOG_BASE ** datum.logRadius;
                                const starTemp = LOG_BASE ** datum.logTemp;
                                const planetDistance = this.props.planetDistance * (1.495978707 * (10 ** 11))
                                const temp = this.getPlanetTemp(
                                    starRadius,
                                    starTemp,
                                    planetDistance)
                                return temp;
                                }}
                            >
                        </VictoryLine>
                    </VictoryChart>
                    <VictoryChart
                        // Domain is the stars age, range is surface temp of planet in C
                        domain={{x: [
                            0, Math.round(STAR_DATA[this.props.starMassIdx].timespan)]}} 
                        height={25}
                        width={960}>
                        <VictoryAxis 
                            style={{
                                axis: {display: 'none'},
                                tickLabels: {display: 'none'},
                            }}
                            tickFormat={[]}
                            label={''}/>
                        <VictoryBar 
                            barWidth={2}
                            style={{
                                data: {fill: 'red'}
                            }}
                            data={[{x: STAR_DATA[this.props.starMassIdx].dataTable[this.props.starAgeIdx].time, y: 1}]}/>
                    </VictoryChart>
                </>)}
            </div>
        </div>)
    }
}

CSHZTimeline.propTypes = {
    starMassIdx: PropTypes.number.isRequired,
    starAge: PropTypes.number.isRequired,
    starAgeIdx: PropTypes.number.isRequired,
    planetDistance: PropTypes.number.isRequired,
}
