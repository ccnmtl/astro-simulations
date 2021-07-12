import React from 'react';
import {RangeStepInput} from 'react-range-step-input';
import PropTypes from 'prop-types';

import {forceNumber} from '../../eclipsing-binary-simulator/src/utils.js';

export class NumericRangeInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputVal: null,
            initialVal: null,
        }
        this.handleNumericInput = this.handleNumericInput.bind(this);
        this.handleRangeInput = this.handleRangeInput.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
    }

    componentDidMount() {
        if (this.props.value >= this.props.min && this.props.value <= this.props.max) {
            this.setState({
                inputVal: this.props.value,
                initialVal: this.props.value
            })
        } else {
            throw new Error('Numeric Range Input: passed value is outside min/max range');
        }
    }

    componentDidUpdate(prevProps) {
        if(this.props.value !== prevProps.value
            || this.props.min !== prevProps.min
            || this.props.max !== prevProps.max) {
            if (this.props.value >= this.props.min && this.props.value <= this.props.max) {
                this.setState({
                    inputVal: this.props.value,
                    initialVal: this.props.value
                })
            } else {
                throw new Error('Numeric Range Input: passed value is outside min/max range');
            }
        }
    }

    handleNumericInput(evt) {
        evt.preventDefault();
        this.setState({
            inputVal: forceNumber(evt.target.value)
        });
    }

    handleRangeInput(evt) {
        evt.preventDefault();
        this.props.onChange(forceNumber(evt.target.value));
    }

    handleFocus(evt) {
        evt.target.select();
    }

    handleBlur(evt) {
        // Validate value, else reset to initial value
        const val = evt.target.value;
        if (val < this.props.min || val > this.props.max) {
            this.setState((state) => ({
                inputVal: state.initialVal
            }))
        } else {
            this.props.onChange(this.state.inputVal);
        }
    }

    render() {
        return (
            <div className='form-group row'>
                <label className='col-6 col-form-label col-form-label-sm'>
                    {this.props.label}
                    <input
                        type="number"
                        className="form-control form-control-sm"
                        name={this.props.name + '-input'}
                        value={
                            this.state.inputVal ? this.state.inputVal : this.props.min}
                        onFocus={this.handleFocus}
                        onChange={this.handleNumericInput}
                        onBlur={this.handleBlur}
                        min={this.props.min}
                        max={this.props.max}
                        step={this.props.step} />
                </label>
                <div className='col-6'>
                    <RangeStepInput
                        className='form-control'
                        name={this.props.name + '-range-input'}
                        value={this.props.value}
                        onChange={this.handleRangeInput}
                        min={this.props.min}
                        max={this.props.max}
                        step={this.props.step} />
                </div>
            </div>
        )
    }
}

NumericRangeInput.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    step: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
}
