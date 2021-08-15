import React from 'react';
import PropTypes from 'prop-types';
import { IncrementRangeInput, NumericRangeInput } from './utils';
import {
    getLuminosityFromTempAndClass
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
        <div className='container'>
            <div className='row'>
                <div className='col-12'>
                    <h2>Star and Planet Settings and Properties</h2>
                </div>
            </div>
            <div className='row'>
                <div className='col-6'>
                    <IncrementRangeInput
                        label={'Initial Star Mass:'}
                        valueIdx={this.props.starMassIdx}
                        values={
                            STAR_DATA.reduce((acc, val) => {
                                acc.push(val.mass);
                                return acc;
                            }, [])}
                        onChange={this.props.setStarMassIdx}
                        name={'star-mass'} />
                    <div className='form-group row'>
                        <label className='col-4 col-form-label col-form-label-sm'>
                            Star Properties:
                        </label>
                        <div className='col-8'>
                            <div>Mass: {STAR_DATA[this.props.starMassIdx].mass} M<sub>sun</sub></div>
                            <div>Luminosity: {this.props.starLuminosity} L<sub>sun</sub></div>
                            <div>Temperature: {this.props.starTemperature} K</div>
                            <div>Radius: {this.props.starRadius} R<sub>sun</sub></div>
                        </div>
                    </div>
                    <NumericRangeInput
                        label={'Initial Planet Distance:'}
                        value={this.props.planetDistance}
                        min={0.01}
                        max={500}
                        step={0.1}
                        onChange={this.props.setPlanetDistance}
                        name={'star-mass'} />
                </div>
                <div className='col-6'>
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
                            label={'Temperature (K)'}
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
                            label='Luminosity'/>
                        <VictoryLine
                            domain={{x: [50000, 3000]}}
                            y={(temp) => {
                                return getLuminosityFromTempAndClass(temp.x, 'v') }}/>
                        <VictoryScatter
                            style={{data: { fill: '#FF0000' }}}
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
    planetDistance: PropTypes.number.isRequired,
    setPlanetDistance: PropTypes.func.isRequired,
}
