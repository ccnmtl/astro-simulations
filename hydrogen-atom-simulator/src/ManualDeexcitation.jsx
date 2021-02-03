import React from 'react';
import PropTypes from 'prop-types'

export default class ManualDeexcitation extends React.Component {
    constructor(props) {
        super(props);
        this.currentSelection = 0;
    }

    componentDidMount() {
        this.updateOptions();
    }

    componentDidUpdate() {
        // if (prevProps !== this.props) this.updateOptions();
        this.updateOptions();
    }

    updateOptions() {
        const select = document.getElementById("level-select");
        select.options.length = 0;
        this.currentSelection = 0;
        if (this.props.currentEnergyLevel === 1) return;

        let possibleEnergyDrops = this.props.currentEnergyLevel - 1;
        select.options[select.options.length] = new Option(`Random Level`, `${0}`);

        for (let i = 1; i <= possibleEnergyDrops; i++) {
            select.options[select.options.length] = new Option(`Level ${i}`, `${i}`);
        }
    }

    changeCurrentSelection(e) {
        this.currentSelection = e.target.value;
        this.currentSelection = Number(this.currentSelection);
    }

    dropToNewLevel() {
        const select = document.getElementById("level-select");
        if (select.options.length !== 0) this.props.manuallyEmit(this.currentSelection);
    }

    render() {
        return (
            <form className="ml-2 mr-2 mb-2">
                <div className="input-group">
                    <div className="input-group-prepend">
                        <button
                            type="button"
                            className="dropButton btn btn-sm btn-secondary"
                            disabled={this.props.automaticDeExcitation}
                            onClick={this.dropToNewLevel.bind(this)}>
                            {"Drop to: "}
                        </button>
                    </div>

                    <select
                        id="level-select"
                        disabled={this.props.automaticDeExcitation}
                        className="custom-select custom-select-sm"
                        onChange={this.changeCurrentSelection.bind(this)}>

                    </select>
                </div>
            </form>
        );
    }
}

// https://electrictoolbox.com/javascript-add-options-html-select/

ManualDeexcitation.propTypes = {
    currentEnergyLevel: PropTypes.number.isRequired,
    automaticDeExcitation: PropTypes.bool.isRequired,
    manuallyEmit: PropTypes.func.isRequired
};
