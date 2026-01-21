import React from 'react';
import PropTypes from 'prop-types';
import * as PIXI from 'pixi.js';
import Plot from './d3/Plot';
import * as d3 from 'd3';
import {degToRad, roundToFivePlaces} from './utils';


export default class LightcurveView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDragging: false,
            noiseData: []
        };

        this.onDragStart = this.onDragStart.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.onMove = this.onMove.bind(this);

        this.yAxisTopMargin = 5;
    }
    /**
     * Generate noise around the lightcurve data.
     */
    getNoiseData(lightcurveData) {
        if (!this.props.showSimulatedMeasurements) {
            return [];
        }

        const xExtent = d3.extent(lightcurveData, d => d[0]);

        const randomizedData = [];
        for (let i = 0; i < this.props.simMeasurementNumber; i++) {
            const randX = Math.random() * xExtent[1];

            // Find the closest real data point to this random x
            // value.
            const idx = d3.bisector(function(d) {
                return d[0];
            }).left(lightcurveData, randX);

            // Generate noise based on the real y val.
            const y = lightcurveData[parseInt(idx)][1];

            const newY = y + (
                // Scale the randomization factor by the value
                // of the "noise" slider
                ((Math.random() - 0.5) * 8000) * this.props.noise);

            randomizedData.push([randX, newY]);
        }

        return randomizedData;
    }
    render() {
        // d3 integration based on:
        // https://github.com/freddyrangel/playing-with-react-and-d3
        return (
            <div className="LightcurveView">
                <div className="LightcurveYAxis"
                    ref={(el) => {this.yAxisEl = el;}}></div>
                <Plot
                    noiseData={this.state.noiseData}
                    lightcurveData={this.props.curveCoords}
                    phase={this.props.phase}
                    showTheoreticalCurve={this.props.showTheoreticalCurve}
                    showSimulatedMeasurements={this.props.showSimulatedMeasurements}
                    planetRadius={this.props.planetRadius}
                    width={400}
                    height={221}
                    onPhaseUpdate={this.props.onPhaseUpdate}
                    paddingLeft={0}
                    padding={20} />
                <div className="clearfix"></div>
            </div>
        );
    }
    componentDidMount() {
        const axis = new PIXI.Application({
            backgroundColor: 0xffffff,
            width: 70,
            height: 221,
            sharedLoader: true,
            sharedTicker: true
        });

        this.axis = axis;
        this.yAxisEl.appendChild(axis.view);

        this.drawTitleText(axis);
        this.drawYAxisLabels(axis, this.props.labelCoords);
    }
    componentDidUpdate(prevProps) {
        if (this.props.showSimulatedMeasurements) {
            if (
                prevProps.simMeasurementNumber !== this.props.simMeasurementNumber ||
                prevProps.noise !== this.props.noise
            ) {
                this.setState({
                    noiseData: this.getNoiseData(this.props.curveCoords)
                });
            }
        }

        if (
            prevProps.showSimulatedMeasurements !==
                this.props.showSimulatedMeasurements
        ) {
            this.setState({
                noiseData: this.getNoiseData(this.props.curveCoords)
            });
        }

        if (
            prevProps.planetRadius !== this.props.planetRadius ||
            prevProps.starMass !== this.props.starMass ||
            prevProps.planetSemimajorAxis !== this.props.planetSemimajorAxis ||
            prevProps.planetEccentricity !== this.props.planetEccentricity ||
            prevProps.inclination !== this.props.inclination ||
            prevProps.longitude !== this.props.longitude
        ) {
            if (this.props.showSimulatedMeasurements) {
                this.setState({
                    noiseData: this.getNoiseData(this.props.curveCoords)
                });
            }
        }

        if (
            prevProps.labelCoords !== this.props.labelCoords
        ) {
            this.refreshAxisView(this.axis);
        }
    }

    refreshAxisView(app) {
        app.stage.removeChildren();

        this.drawTitleText(app);
        this.drawYAxisLabels(app, this.props.labelCoords);
    }

    drawTitleText(app) {
        const title = new PIXI.Text('Normalized Flux', {
            fontFamily: 'Arial',
            fontSize: 14,
            fontWeight: 'bold',
            fill: 0x000000,
            align: 'center'
        });
        title.name = 'title';
        title.position.x = 0;
        title.position.y = 180;
        title.rotation = degToRad(-90);
        app.stage.addChild(title);
    }

    drawYAxisLabels(app, labelCoords) {
        const me = this;
        labelCoords.forEach(function(label) {
            const labelText = roundToFivePlaces(label.value);
            const g = new PIXI.Text(labelText, {
                fontFamily: 'Arial',
                fontSize: 12,
                fill: 0x000000,
                align: 'center'
            });

            g.position.x = 20;
            g.position.y = label._y + me.yAxisTopMargin - 8;

            app.stage.addChild(g);

            const tickMark = new PIXI.Graphics();
            tickMark.lineStyle(1, 0x000000);
            tickMark.moveTo(65, label._y + me.yAxisTopMargin);
            tickMark.lineTo(70, label._y + me.yAxisTopMargin);
            app.stage.addChild(tickMark);
        });
    }

    onDragStart(e) {
        this.dragStartPos = e.data.getLocalPosition(this.app.stage);
        this.setState({isDragging: true});
    }
    onDragEnd() {
        this.setState({isDragging: false});
    }
    onMove() {
        if (this.state.isDragging) {
            //const pos = e.data.getLocalPosition(this.app.stage);
        }
    }
}

LightcurveView.propTypes = {
    showTheoreticalCurve: PropTypes.bool.isRequired,
    showSimulatedMeasurements: PropTypes.bool.isRequired,
    noise: PropTypes.number.isRequired,
    simMeasurementNumber: PropTypes.number.isRequired,
    planetMass: PropTypes.number.isRequired,
    planetRadius: PropTypes.number.isRequired,
    planetSemimajorAxis: PropTypes.number.isRequired,
    planetEccentricity: PropTypes.number.isRequired,
    starMass: PropTypes.number.isRequired,
    inclination: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
    curveCoords: PropTypes.array.isRequired,
    labelCoords: PropTypes.array.isRequired,
    phase: PropTypes.number.isRequired,
    onPhaseUpdate: PropTypes.func.isRequired
};
