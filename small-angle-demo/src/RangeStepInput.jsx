import React from 'react';
import PropTypes from 'prop-types';
import {forceFloat} from './utils';

/**
 * This is an <input type=range> that steps up and down on click
 * instead of jumping immediately to the new value.
 *
 * Based on zcorpan's solution here:
 *   https://stackoverflow.com/a/51988783/173630
 */
export default class RangeStepInput extends React.Component {
    constructor(props) {
        super(props);
        this.handleRangeInput = this.handleRangeInput.bind(this);
    }
    render() {
        return <input
                   type="range"
                   className={this.props.className}
                   min={this.props.min}
                   max={this.props.max}
                   step={this.props.step}
                   value={this.props.value}
                   name={this.props.name}
                   id={this.props.id}
                   onChange={this.props.onChange}
                   onInput={this.handleRangeInput} />;
    }
    handleRangeInput(e) {
        const step = forceFloat(e.target.step);
        const val = forceFloat(e.target.value);
        const oldValue = this.props.value;
        if (oldValue) {
            e.target.value = (val > oldValue) ?
                             oldValue + step : oldValue - step;
        }
    }
}

RangeStepInput.propTypes = {
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    id: PropTypes.string,
    name: PropTypes.string
};
