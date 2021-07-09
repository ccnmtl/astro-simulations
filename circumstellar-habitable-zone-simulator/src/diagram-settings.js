import React from 'react';
import PropTypes from 'prop-types';

export default class CSHZSettings extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return(
        <div className='container'>
            <div className='row'>
                <div className='col-12'>
                    <h2>General Settings</h2>
                    <form>
                        Diagram Settings:
                        <div className='form-check'>
                            <input
                                id='scale-grid'
                                type='checkbox'
                                checked={this.props.showScaleGrid}
                                onChange={() => this.props.handleShowScaleGrid()}
                                className={'form-check-input'} />
                            <label
                                className='form-check-label'
                                htmlFor='scale-grid'>
                                Show Scale Grid
                            </label>
                        </div>
                        <div className='form-check'>
                            <input
                                id='show-orbits'
                                type='checkbox'
                                checked={this.props.showSolarSystemOrbits}
                                onChange={() => this.props.handleShowSolarSystemOrbits()}
                                className={'form-check-input'} />
                            <label
                                className='form-check-label'
                                htmlFor='show-orbits'>
                                Show Solar System Orbits
                            </label>
                        </div>
                    </form>
                </div>
            </div>
        </div>)
    }
}

CSHZSettings.propTypes = {
    showScaleGrid: PropTypes.bool.isRequired,
    handleShowScaleGrid: PropTypes.func.isRequired,
    showSolarSystemOrbits: PropTypes.bool.isRequired,
    handleShowSolarSystemOrbits: PropTypes.func.isRequired,
}
