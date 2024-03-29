import React from 'react';
import PropTypes from 'prop-types';
import {
    IncrementRangeInput, PLANET_DISTANCES
} from './utils';
import {
    getLuminosityFromTempAndClass, forceNumber
} from '../../eclipsing-binary-simulator/src/utils.js';
import {shzStarData as STAR_DATA} from './shzStars.js';
import { LOG_BASE } from './main';
import {
    VictoryAxis, VictoryChart, VictoryLine, VictoryScatter
} from 'victory';


export default class CSHZStarProperties extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
        <div className='row mb-2'>
            <div className='col-6'>
                <div className='border rounded h-100 p-2'>
                    <form>
                        <div className={'form-group row'}>
                            <div className="col-sm-12">
                                <div className="form-check">
                                    <input
                                        id='show-orbits'
                                        type='checkbox'
                                        checked={this.props.showSolarSystemOrbits}
                                        onChange={this.props.handleShowSolarSystemOrbits}
                                        className={'form-check-input'} />
                                    <label className={'form-check-label'}>Show Solar System Orbits</label>
                                </div>
                            </div>
                        </div>
                        <div className={'form-group row'}>
                            <label className={'col-sm-4 col-form-label'}>Initial Star Mass:</label>
                            <div className="col-sm-3">
                                <select
                                    className={'form-control form-control-sm'}
                                    value={String(this.props.starMassIdx)}
                                    onChange={(evt) => {
                                        evt.preventDefault();
                                        this.props.setStarMassIdx(forceNumber(evt.target.value)) }}>
                                    {STAR_DATA.map((el, idx) => {
                                        return (<option value={idx} key={idx}>{el.mass}</option>)
                                    })}
                                </select>
                            </div>
                        </div>
                        <IncrementRangeInput
                            label={'Planet distance:'}
                            valueIdx={this.props.planetDistanceIdx}
                            values={PLANET_DISTANCES}
                            onChange={this.props.setPlanetDistanceIdx}
                            name={'planet-distance'}
                            getStepFunc={(val) => {
                                if (val < 0.1) {
                                    return 0.001;
                                } else if (0.1 <= val && val < 1) {
                                    return 0.01;
                                } else if (1 <= val && val < 10) {
                                    return 0.1;
                                } else if (10 <= val) {
                                    return 1;
                                }
                            }}/>

                    </form>
                </div>
            </div>
            <div className={'col-3'}>
                <div className={'border rounded h-100 p-2'}>
                    <strong>Star Properties:</strong>
                    <div>
                        <div>Mass: {STAR_DATA[this.props.starMassIdx].mass} M<sub>sun</sub></div>
                        <div>Luminosity: {this.props.starLuminosity} L<sub>sun</sub></div>
                        <div>Temperature: {this.props.starTemperature} K</div>
                        <div>Radius: {this.props.starRadius} R<sub>sun</sub></div>
                    </div>
                </div>
            </div>
            <div className='col-3'>
                <div className={'border rounded h-100 p-2'}>
                    <VictoryChart
                        domain={{
                            x: [50000, 2000],
                        }}
                        scale={'log'}
                        sortKey={'x'}
                        sortOrder='descending'
                        height={142}
                        width={142}
                        padding={18}>
                        <VictoryAxis
                            label={'← Temperature (K)'}
                            style={{
                                tickLabels: {display: 'none'},
                                axisLabel: {padding: 5}
                            }}
                            tickFormat={[]}/>
                        <VictoryAxis
                            dependentAxis={true}
                            tickFormat={[]}
                            style={{
                                tickLabels: {display: 'none'},
                                axisLabel: {padding: 5}
                            }}
                            label='Luminosity →'/>
                        <VictoryLine
                            domain={{x: [50000, 3000]}}
                            y={(temp) => {
                                return getLuminosityFromTempAndClass(temp.x, 'v') }}/>
                        <VictoryScatter
                            style={{data: { fill: '#FF0000' }}}
                            size={2.5}
                            data={STAR_DATA[this.props.starMassIdx].
                                    dataTable.slice(0, this.props.starAgeIdx + 1).
                                    reduce((acc, val) => {
                                acc.push({
                                    x: LOG_BASE ** val.logTemp,
                                    y: LOG_BASE ** val.logLum
                                })
                                return acc;
                            }, [])}/>
                    </VictoryChart>
                </div>
            </div>
        </div>)
    }
}

CSHZStarProperties.propTypes = {
    starMassIdx: PropTypes.number.isRequired,
    starAgeIdx: PropTypes.number.isRequired,
    starLuminosity: PropTypes.number.isRequired,
    starTemperature: PropTypes.number.isRequired,
    starRadius: PropTypes.number.isRequired,
    setStarMassIdx: PropTypes.func.isRequired,
    planetDistanceIdx: PropTypes.number.isRequired,
    setPlanetDistanceIdx: PropTypes.func.isRequired,
    showSolarSystemOrbits: PropTypes.bool.isRequired,
    handleShowSolarSystemOrbits: PropTypes.func.isRequired
}
