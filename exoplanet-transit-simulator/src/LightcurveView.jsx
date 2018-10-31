import React from 'react';
import PropTypes from 'prop-types';
import Plot from './d3/Plot';
import {getDist} from './utils';

/**
 * Calculate the intersection area of two circles with
 * radii r and R. d is the distance between them.
 *
 * https://math.stackexchange.com/a/97886/604568
 */
const circleCircleIntersectionArea = function(r, R, d) {
    return (
        (r**2) * Math.acos(
            ((d**2) + (r**2) - (R**2)) /
            (2 * d * r)) +
        (R**2) * Math.acos(
            ((d**2) + (R**2) - (r**2)) /
            (2 * d * R))
    ) - 0.5 * Math.sqrt(
        (-d + r + R) *
        (d + r - R) *
        (d - r + R) *
        (d + r + R)
    );
};

/**
 * Make a 2d array of data points based on the current planet/star
 * scene. This creates the plot that displays amount of light
 * emitted based on planet phase. A bunch of parameters influence
 * this curve.
 *
 * Returns a 2d array of x/y values.
 */
const generateLightcurveData = function(
    planetRadius, starRadius
    //semimajorAxis, eccentricity, inclination, longitude
) {
    const a = [];

    // Hard-coded entity positions of the Pixi scene in TransitView.
    // This could be dynamic or smarter, if necessary.
    const starPos = {x: 175, y: 175};
    const planetLeft = {x: 60, y: 200};
    const planetRight = {x: 288, y: 200};
    const phaseDiff = planetRight.x - planetLeft.x;

    // Adjust this number to change the number of values sampled.
    const samples = 180;

    for (let i = 0; i < phaseDiff; i += phaseDiff / samples) {
        const currentPlanetPos = {x: planetLeft.x + i, y: planetLeft.y};
        const dist = getDist(currentPlanetPos, starPos);

        // Calculate the intersection of the planet and star at this
        // point.
        let y = circleCircleIntersectionArea(
            planetRadius, starRadius, dist);

        if (!isNaN(y)) {
            // X is the planet phase position, and Y is the amount
            // of light that the star/planet scene emits.  When the
            // planet is moving over the star, its brightness is
            // slightly less. Otherwise there's full brightness (y=1).
            a.push([i, 1 - y]);
        }
    }
    return a;
}

export default class LightcurveView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDragging: false,
            noiseData: this.randomDataSet(),
            lightcurveData: generateLightcurveData(
                7 * this.props.planetRadius,
                76 * this.props.starMass,
                this.props.planetSemimajorAxis,
                this.props.planetEccentricity,
                this.props.inclination,
                this.props.longitude
            )
        };

        this.onDragStart = this.onDragStart.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.onMove = this.onMove.bind(this);
    }
    updateLightcurveData() {
        const data = generateLightcurveData(
            7 * this.props.planetRadius,
            76 * this.props.starMass,
            this.props.planetSemimajorAxis,
            this.props.planetEccentricity,
            this.props.inclination,
            this.props.longitude
        );
        this.setState({lightcurveData: data});
    }
    randomDataSet() {
        if (!this.props.showSimulatedMeasurements) {
            return [];
        }
        return Array.from(Array(this.props.simMeasurementNumber)).map(
            () => [Math.random(), Math.random() + 0.5]);
    }
    render() {
        // d3 integration based on:
        // https://github.com/freddyrangel/playing-with-react-and-d3
        return (
            <Plot
                noiseData={this.state.noiseData}
                lightcurveData={this.state.lightcurveData}
                phase={this.props.phase}
                showTheoreticalCurve={this.props.showTheoreticalCurve}
                planetRadius={this.props.planetRadius}
                width={460} height={280}
                padding={30} />
        );

    }
    componentDidUpdate(prevProps) {
        if (this.props.showSimulatedMeasurements) {
            if (
                prevProps.planetRadius !== this.props.planetRadius
            ) {
                this.setState({noiseData: this.randomDataSet()});
            }
            if (
                prevProps.simMeasurementNumber !== this.props.simMeasurementNumber
            ) {
                this.setState({noiseData: this.randomDataSet()});
            }
        }

        if (
            prevProps.showSimulatedMeasurements !==
                this.props.showSimulatedMeasurements
        ) {
            this.setState({noiseData: this.randomDataSet()});
        }

        if (
            prevProps.planetRadius !== this.props.planetRadius ||
            prevProps.starMass !== this.props.starMass ||
            prevProps.planetSemimajorAxis !== this.props.planetSemimajorAxis ||
            prevProps.planetEccentricity !== this.props.planetEccentricity ||
            prevProps.inclination !== this.props.inclination ||
            prevProps.longitude !== this.props.longitude
        ) {
            this.updateLightcurveData();
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
    phase: PropTypes.number.isRequired
};
