import React from 'react';
import STAR_SYSTEMS from './data.js';
import PropTypes from 'prop-types';
import {NumericRangeInput} from './numeric-range-input';

export default class CSHZStarProperties extends React.Component {
    constructor(props) {
        super(props);
        this.handleActiveStarSystem = this.handleActiveStarSystem.bind(this);
    }

    handleActiveStarSystem(evt) {
        evt.preventDefault();
        const activeStar = parseInt(evt.target.value);
        if (!isNaN(activeStar)) {
            this.setState({activeStarSystem: activeStar});
            this.props.setStarSystem(activeStar);
            this.props.setStarMass(STAR_SYSTEMS[activeStar].mass);
        }
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
                <div className='col-3'>
                    <form>
                        <div className='form-group'>
                            <label htmlFor='star-system-select'>
                                Star System
                            </label>
                            <select
                                id='star-system-select'
                                value={this.props.starSystem ? this.props.starSystem : 0}
                                onChange={this.handleActiveStarSystem}
                                className='form-group'>
                                {STAR_SYSTEMS.map((val, idx) => {
                                    return (
                                        <option
                                            key={idx}
                                            value={String(idx)}>
                                            {val.name}
                                        </option>
                                    )
                                })}
                            </select>
                        </div>
                    </form>
                </div>
                <div className='col-6'>
                    <NumericRangeInput
                        label={'Initial Star Mass:'}
                        value={this.props.starMass}
                        min={0}
                        max={30}
                        step={0.1}
                        onChange={this.props.setStarMass}
                        name={'star-mass'} />
                    <div className='form-group row'>
                        <label className='col-4 col-form-label col-form-label-sm'>
                            Star Properties:
                        </label>
                        <div className='col-8'>
                            <div>Mass: {this.props.starMass} M<sub>sun</sub></div>
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
                <div className='col-3'>
                    Herzsprung-Russell goes here
                </div>
            </div>
        </div>)
    }
}

CSHZStarProperties.propTypes = {
    starMass: PropTypes.number.isRequired,
    starLuminosity: PropTypes.number.isRequired,
    starTemperature: PropTypes.number.isRequired,
    starRadius: PropTypes.number.isRequired,
    setStarMass: PropTypes.func.isRequired,
    planetDistance: PropTypes.number.isRequired,
    setPlanetDistance: PropTypes.func.isRequired,
    starSystem: PropTypes.number.isRequired,
    setStarSystem: PropTypes.func.isRequired,
}
