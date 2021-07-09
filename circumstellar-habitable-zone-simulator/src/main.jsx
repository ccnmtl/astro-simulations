import React from 'react';
import ReactDOM from 'react-dom';

class CircumstellarHabitableZoneSim extends React.Component {
    constructor(props) {
        super(props);
        this.initialState = {
            someState: true,
        };
        this.state = this.initialState;
    }
    render() {
        return(<h1>Circumstellar Habitable Zone Simulator</h1>);
    }
}

const domContainer = document.querySelector('#sim-container');
ReactDOM.render(<CircumstellarHabitableZoneSim />, domContainer);
