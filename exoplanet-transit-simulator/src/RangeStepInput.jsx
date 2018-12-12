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

        this.domRef = React.createRef();
    }
    render() {
        return <input
                   type="range"
                   ref={this.domRef}
                   className={this.props.className}
                   min={this.props.min}
                   max={this.props.max}
                   step={this.props.step}
                   value={this.props.value}
                   name={this.props.name}
                   id={this.props.id}
                   disabled={this.props.disabled}
                   onChange={this.props.onChange}
                   onMouseDown={this.onMouseDown}
                   onMouseUp={this.onMouseUp}
                   onMouseMove={this.onMouseMove}
                   onClick={this.onClick}
                   onInput={this.onInput} />;
    }
    onMouseDown() {
        this.setState({isMouseDown: true});

        const oldVal = this.props.value;
        const self = this;
        // Add some initial delay on the click-hold functionality.
        setTimeout(function() {
            self.holdLoop = self.makeHoldLoop(oldVal);
        }, 600);
    }
    onMouseUp() {
        this.setState({
            isMouseDown: false,
            isDragging: false
        });

        if (this.holdLoop) {
            clearInterval(this.holdLoop);
        }
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
    makeHoldLoop(oldVal) {
        const self = this;

        return setInterval(function() {
            if (!self.state.isMouseDown) {
                // The user isn't holding the cursor anymore: clean up
                // and cancel.
                if (self.holdLoop) {
                    clearInterval(self.holdLoop);
                }
                return false;
            }

            const input = self.domRef.current;

            let newVal = self.props.value;
            if (oldVal > newVal) {
                newVal -= self.props.step;
            } else if (oldVal < newVal) {
                newVal += self.props.step;
            } else {
                // The user is just holding the cursor at the current
                // value, so don't do anything.
                return false;
            }

            // Directly setting input.value will cause the new value
            // to not be recognized, because of React.
            // https://stackoverflow.com/a/46012210/173630
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype, 'value').set;
            nativeInputValueSetter.call(input, newVal);

            // Trigger an onChange event.
            const e = new Event('change', {bubbles: true});
            return input.dispatchEvent(e);
        }, 100);
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
    name: PropTypes.string,
    disabled: PropTypes.bool,
    allowHold: PropTypes.bool
};
