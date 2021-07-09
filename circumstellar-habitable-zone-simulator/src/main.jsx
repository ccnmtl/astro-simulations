import React from 'react';
import ReactDOM from 'react-dom';
import * as PIXI from 'pixi.js';

import CSHZNav from './nav.js';
import CSHZSettings from './diagram-settings.js';
import CSHZStarProperties from './star-properties.js';

class CircumstellarHabitableZoneSim extends React.Component {
    constructor(props) {
        super(props);
        this.initialState = {
            showScaleGrid: false,
            showSolarSystemOrbits: true,
            activeStar: 0,
        };
        this.state = this.initialState;
        this.cshzDiagram = React.createRef();

        this.handleShowScaleGrid = this.handleShowScaleGrid.bind(this);
        this.handleShowSolarSystemOrbits = this.handleShowSolarSystemOrbits.bind(this);

    }

    componentDidMount() {
        const app = new PIXI.Application({
            backgroundColor: 0x000000,
            width: this.cshzDiagram.current.clientWidth,
            height: 300,
            sharedLoader: true,
            sharedTicker: true
        });

        this.app = app;
        this.cshzDiagram.current.appendChild(app.view);
    }

    handleShowScaleGrid() {
        this.setState((state) => ({
            showScaleGrid: !state.showScaleGrid,
        }));
    }

    handleShowSolarSystemOrbits() {
        this.setState((state) => ({
            showSolarSystemOrbits: !state.showSolarSystemOrbits,
        }));
    }
    render() {
        return(<>
            <CSHZNav />
            <div className='row mt-2'>
                <div className='col-12' ref={this.cshzDiagram} />
            </div>
            <div className='row mt-2'>
                <div className='col-3'>
                    <CSHZSettings 
                        showScaleGrid={this.state.showScaleGrid}
                        handleShowScaleGrid={this.handleShowScaleGrid}
                        showSolarSystemOrbits={this.state.showSolarSystemOrbits}
                        handleShowSolarSystemOrbits={this.handleShowSolarSystemOrbits}
                        />
                </div>
                <div className='col-9'>
                    <CSHZStarProperties />
                </div>
            </div>
        </>);
    }
}

const domContainer = document.querySelector('#sim-container');
ReactDOM.render(<CircumstellarHabitableZoneSim />, domContainer);
