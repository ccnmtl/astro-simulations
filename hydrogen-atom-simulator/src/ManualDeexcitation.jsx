import React from 'react';

export default class ManualDeexcitation extends React.Component {
    constructor(props) {
        super(props);
        this.currentSelection = 0;
    }

    componentDidMount() {
        this.updateOptions();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
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
            <div style={{visibility: !this.props.automaticDeExcitation ? "" : "hidden",
                marginLeft: this.props.currentEnergyLevel > 1 ? "8px" : "50px"}}>
                <button type="box"
                        className="dropButton"
                    onClick={this.dropToNewLevel.bind(this)}
                >
                    {"Drop to: "}
                </button>

                <select
                    id="level-select"
                    onChange={this.changeCurrentSelection.bind(this)}
                >

                </select>
            </div>
        );
    }
}

// https://electrictoolbox.com/javascript-add-options-html-select/