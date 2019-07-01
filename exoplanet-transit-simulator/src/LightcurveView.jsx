import React from 'react';
import PropTypes from 'prop-types';
import Plot from './d3/Plot';
import * as d3 from 'd3';


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
            const idx = d3.bisector(function (d) {
                return d[0];
            }).left(lightcurveData, randX);

            // Generate noise based on the real y val.
            const y = lightcurveData[parseInt(idx)][1];

            const newY = y + (
                // Scale the randomization factor by the value
                // of the "noise" slider
                (Math.random() - 0.5) * this.props.noise);

            randomizedData.push([randX, newY]);
        }

        return randomizedData;
    }
    render() {
        // d3 integration based on:
        // https://github.com/freddyrangel/playing-with-react-and-d3
        return (
            <Plot
                noiseData={this.state.noiseData}
                lightcurveData={this.props.curveCoords}
                phase={this.props.phase}
                showTheoreticalCurve={this.props.showTheoreticalCurve}
                showSimulatedMeasurements={this.props.showSimulatedMeasurements}
                planetRadius={this.props.planetRadius}
                width={460}
                height={280}
                onPhaseUpdate={this.props.onPhaseUpdate}
                paddingLeft={60}
                padding={20} />
        );

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
    phase: PropTypes.number.isRequired,
    onPhaseUpdate: PropTypes.func.isRequired
};
