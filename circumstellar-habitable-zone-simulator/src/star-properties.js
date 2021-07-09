import React from 'react';
//import PropTypes from 'prop-types';

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
                <div className='col-3'>
                    foo
                </div>
                <div className='col-6'>
                    foo
                </div>
                <div className='col-3'>
                    foo
                </div>
            </div>
        </div>)
    }
}

CSHZStarProperties.propTypes = {
    //showScaleGrid: PropTypes.bool.isRequired,
    //handleShowScaleGrid: PropTypes.func.isRequired,
    //showSolarSystemOrbits: PropTypes.bool.isRequired,
    //handleShowSolarSystemOrbits: PropTypes.func.isRequired,
}
