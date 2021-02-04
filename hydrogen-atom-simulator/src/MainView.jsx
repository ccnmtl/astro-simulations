import React from 'react';
import PropTypes from 'prop-types';
import Electron from './Electron';

const WIDTH = 950;
const HEIGHT = 280;

const renderOrbitalRadii = () => {
    return (data, index) => {
        const circleProperties = {
            cx: 0,
            cy: HEIGHT / 2,
            r: data.r,
            stroke: data.stroke,
            strokeWidth: 1.5,
            fill: "none",
            key: index
        };

        return <circle {...circleProperties} />;
    };
};

export default class MainView extends React.Component {
    constructor(props) {
        super(props);
        // Settings the properties of the curved lines
        this.orbitalRadii = [{r: 20}, {r: 40}, {r: 110}, {r: 250}, {r: 420}, {r: 620}, {r: 880}];
        // Setting the stroke property of the curved lines to grey
        this.orbitalRadii.forEach(element => { element.stroke = "grey" });
        // Setting the first energy level stroke to red to indicate that's our current level
        this.orbitalRadii[1].stroke = "white";

        this.plusSign = "";
        this.topText = "";
        this.bottomText = "";

    }

    componentDidUpdate() {
        this.updateCurrentCurve();
        this.updateVisibilityOfTexts();
    }

    updateVisibilityOfTexts () {
        this.plusSign = this.props.currentEnergyLevel === 7 ? "+" : "";
        this.topText = this.props.currentEnergyLevel === 7 ? "ATOM IS" : "";
        this.bottomText = this.props.currentEnergyLevel === 7 ? "IONIZED" : "";
    }

    updateCurrentCurve() {
        for (let i = 0; i < this.orbitalRadii.length; i++) {
            this.orbitalRadii[i].stroke = "grey";
        }

        if (this.props.currentEnergyLevel < 7) this.orbitalRadii[this.props.currentEnergyLevel].stroke = "white";
    }

    render() {
        const center = HEIGHT / 2;

        return (
            <g>
                {/*The following <g> tag will hold all the red orbital lines*/}
                <g>{ this.orbitalRadii.map(renderOrbitalRadii()) }</g>
                {/*The following circle and text are for the red proton with the letter p*/}
                <circle cx={0} cy={center} r={20} stroke={"red"} fill={"red"}/>
                <text x={2} y={center + 4} id={"HydrogenAtomText"}>p</text>

                {/*The Electron component returns a <g> tag that draws the draggable circle for us*/}
                <Electron
                    moveElectron={this.props.moveElectron}
                    emitted={this.props.emitted}
                    photonEnergyValue={this.props.photonEnergyValue}
                    currentEnergyLevel={this.props.currentEnergyLevel}
                    updateEnergyLevel={this.props.updateEnergyLevel}
                    startDeExcitation={this.props.startDeExcitation}
                    changeElectronState={this.props.changeElectronState}
                    electronIsBeingDragged={this.props.electronIsBeingDragged}
                />

                <text x={WIDTH - 65} y={30} id={"largePlusSign"}>{this.plusSign}</text>
                <text x={WIDTH - 80} y={50} id={"ionizedText"}>{this.topText}</text>
                <text x={WIDTH - 80} y={65} id={"ionizedText"}>{this.bottomText}</text>
            </g>
        );
    }
}

MainView.propTypes = {
    fired: PropTypes.bool,
    emitted: PropTypes.bool.isRequired,
    photonEnergyValue: PropTypes.number.isRequired,
    currentEnergyLevel: PropTypes.number.isRequired,
    startDeExcitation: PropTypes.func.isRequired,
    electronIsBeingDragged: PropTypes.bool.isRequired,
    moveElectron: PropTypes.bool.isRequired,
    changeElectronState: PropTypes.func.isRequired,
    updateEnergyLevel: PropTypes.func.isRequired
};
