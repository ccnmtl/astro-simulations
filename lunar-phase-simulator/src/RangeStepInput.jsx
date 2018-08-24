import React from 'react';
import PropTypes from 'prop-types';
import {forceNumber} from './utils';

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
        this.state = {
            isMouseDown: false,
            isDragging: false
        }
        this.onInput = this.onInput.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
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
                   onMouseDown={this.onMouseDown}
                   onMouseUp={this.onMouseUp}
                   onMouseMove={this.onMouseMove}
                   onClick={this.onClick}
                   onInput={this.onInput} />;
    }
    onMouseDown() {
        this.setState({isMouseDown: true});
    }
    onMouseUp() {
        this.setState({
            isMouseDown: false,
            isDragging: false
        });
    }
    onMouseMove() {
        if (this.state.isMouseDown) {
            this.setState({isDragging: true});
        }
    }
    onInput(e) {
        const step = forceNumber(e.target.step);
        const newVal = forceNumber(e.target.value);
        const oldVal = this.props.value;

        if (
            // Disable the oninput filter with the user is dragging
            // the slider's knob.
            !(this.state.isMouseDown && this.state.isDragging) &&
            oldVal
        ) {
            e.target.value = (newVal > oldVal) ?
                             oldVal + step : oldVal - step;
        }
    }
}

RangeStepInput.propTypes = {
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    step: PropTypes.number.isRequired,
    className: PropTypes.string,
    min: PropTypes.number,
    max: PropTypes.number,
    id: PropTypes.string,
    name: PropTypes.string
};
