import React from 'react';
import { arrayCompare } from './utils';
import { RangeStepInput } from 'react-range-step-input';
import PropTypes from 'prop-types';

import {forceNumber} from '../../eclipsing-binary-simulator/src/utils.js';

export class IncrementRangeInput extends React.Component {
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
        if (this.props.valueIdx >= 0 && this.props.valueIdx < this.props.values.length) {
            this.setState({
                inputVal: this.props.values[this.props.valueIdx],
                initialVal: this.props.values[this.props.valueIdx]
            })
        } else {
            throw new Error('Increment Range Input: passed index is out of range');
        }
    }

    componentDidUpdate(prevProps) {
        if(this.props.valueIdx !== prevProps.valueIdx
            || !arrayCompare(this.props.values, prevProps.values)) {
            if (this.props.valueIdx >= 0 && this.props.valueIdx < this.props.values.length) {
                this.setState({
                    inputVal: this.props.values[this.props.valueIdx],
                    initialVal: this.props.values[this.props.valueIdx]
                })
            } else {
                throw new Error('Numeric Range Input: passed value is outside min/max range');
            }
        }
    }

    handleNumericInput(evt) {
        evt.preventDefault();
        // TODO: update to valueIdx
        this.setState({
            inputVal: forceNumber(evt.target.value)
        });
    }

    handleRangeInput(evt) {
        evt.preventDefault();
        // TODO: may not need change, value should be a valueIdx
        this.props.onChange(forceNumber(evt.target.value));
    }

    handleFocus(evt) {
        evt.target.select();
    }

    handleBlur(evt) {
        // Validate value, else reset to initial value
        const val = evt.target.value;
        // TODO: round the value down to the closest value in values
        if (val < this.props.values[0] || val > this.props.values.slice(-1)[0]) {
            // Reset value if it fails validation
            this.setState((state) => ({
                inputVal: state.initialVal
            }))
        } else {
            // Else call the handler, but this should save an idx
            let i = 0;
            while (i < this.props.values.length &&
                   this.props.values[i] < this.state.inputVal) {
                i += 1
            }
            this.setState((state, props) => ({
                inputVal: props.values[i],
                initialVal: props.values[i]
            }))
            this.props.onChange(i);
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
                            this.state.inputVal ? this.state.inputVal : this.props.values[0]}
                        onFocus={this.handleFocus}
                        onChange={this.handleNumericInput}
                        onBlur={this.handleBlur}
                        min={this.props.values[0]}
                        max={this.props.values.slice(-1)[0]}
                        step={0.1} />
                </label>
                <div className='col-6'>
                    <RangeStepInput
                        className='form-control'
                        name={this.props.name + '-range-input'}
                        value={this.props.valueIdx}
                        onChange={this.handleRangeInput}
                        min={0}
                        max={this.props.values.length - 1}
                        step={1} />
                </div>
            </div>
        )
    }
}

IncrementRangeInput.propTypes = {
    label: PropTypes.string.isRequired,
    valueIdx: PropTypes.number.isRequired,
    values: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
}
