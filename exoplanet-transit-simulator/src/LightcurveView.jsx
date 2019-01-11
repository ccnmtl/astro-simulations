import React from 'react';
import PropTypes from 'prop-types';
import Plot from './d3/Plot';
import {shuffleArray} from './utils';


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
        const self = this;

        if (!this.props.showSimulatedMeasurements) {
            return [];
        }

        // Find simMeasurementNumber random samples out of lightcurve
        // data. These will be the points where noise is generated.
        const randomizedData = shuffleArray(lightcurveData);
        // Get the first simMeasurementNumber samples out of the
        // randomized data.
        const samples = randomizedData.slice(
            0, this.props.simMeasurementNumber);

        const a = Array.from(
            Array(this.props.simMeasurementNumber)
        ).map(
            function(v, idx) {
                if (!samples[idx]) {
                    return [];
                }
                return [
                    // The x value is the same as the original sample.
                    samples[idx][0],
                    // y is the same as the original, plus some small
                    // random factor.
                    samples[idx][1] + (
                        // Scale the randomization factor by the value
                        // of the "noise" slider
                        (Math.random() - 0.5) * self.props.noise)
                ];
            }
        );
        return a;
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
    phase: PropTypes.number.isRequired,

    // orbitLeft is the min X co-ordinates of the
    // planet's orbitLine in the Pixi scene. This is needed to
    // calculate the lightcurve.
    orbitLeft: PropTypes.number.isRequired,
    orbitWidth: PropTypes.number.isRequired,

    curveCoords: PropTypes.array.isRequired
};
