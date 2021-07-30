import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {
    VictoryAxis, VictoryChart, VictoryContainer, VictoryLine
} from 'victory';
import { getHZone } from './utils.js';
import { LOG_BASE } from './main';
import {shzStarData as STAR_DATA} from './shzStars.js';

export default class CSHZTimeline extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return(<div>
            <div>
                <h2>Timeline and Simulation Controls</h2>    
            </div>
            <div>
                Time since star system formation:
            </div>
            <div>
                {this.props.starMassIdx && this.props.planetDistance && (
                    <VictoryChart
                        // Domain is the stars age
                        domain={{x: [
                            0, Math.round(STAR_DATA[this.props.starMassIdx].timespan)],
                            y: [0, 1]}}
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
                        <VictoryLine 
                            data={STAR_DATA[this.props.starMassIdx].dataTable}
                            x={(datum) => { return datum.time }}
                            // calculate the percentage of the planet's position within
                            // the habitable zone
                            y={(datum) => { 
                                const [hZoneInner, hZoneOuter] = getHZone(
                                    LOG_BASE ** datum.logLum);
                                if (this.props.planetDistance >= hZoneInner &&
                                        this.props.planetDistance <= hZoneOuter) {
                                    const hZoneWidth = hZoneOuter - hZoneInner;
                                    const planetPos = hZoneOuter - this.props.planetDistance;
                                    return planetPos / hZoneWidth;
                                } else if (this.props.planetDistance < hZoneInner) {
                                    return 1;
                                } else if (this.props.planetDistance > hZoneOuter) {
                                    return 0;
                                }}}
                            >
                        </VictoryLine>
                    </VictoryChart>
                )}
            </div>
        </div>)
    }
}

CSHZTimeline.propTypes = {
    starMassIdx: PropTypes.number.isRequired,
    starAge: PropTypes.number.isRequired,
    planetDistance: PropTypes.number.isRequired,
}
