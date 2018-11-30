import React from 'react';
import PropTypes from 'prop-types';
import Plot from './d3/Plot';


/**
 * Calculate the intersection area of two circles with
 * radii r0 and r1.
 *
 * This function handles the cases where one circle is completely
 * covering the other.
 *
 * https://stackoverflow.com/a/14646734/173630
 */
const areaOfIntersection = function(x0, y0, r0, x1, y1, r1) {
    const rr0 = r0 * r0;
    const rr1 = r1 * r1;
    const d = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));

    // Circles do not overlap
    if (d > r1 + r0) {
        return 0;
    }

    // Circle1 is completely inside circle0
    else if (d <= Math.abs(r0 - r1) && r0 >= r1) {
        // Return area of circle1
        return Math.PI * rr1;
    } else if (d <= Math.abs(r0 - r1) && r0 < r1) {
        // Circle0 is completely inside circle1
        // Return area of circle0
        return Math.PI * rr0;
    } else {
        // Circles partially overlap
        const phi = (Math.acos((rr0 + (d * d) - rr1) / (2 * r0 * d))) * 2;
        const theta = (Math.acos((rr1 + (d * d) - rr0) / (2 * r1 * d))) * 2;
        const area1 = 0.5 * theta * rr1 - 0.5 * rr1 * Math.sin(theta);
        const area2 = 0.5 * phi * rr0 - 0.5 * rr0 * Math.sin(phi);

        // Return area of intersection
        return area1 + area2;
    }
};

export default class LightcurveView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDragging: false,
            noiseData: this.randomDataSet(),
            lightcurveData: this.generateLightcurveData(
                7 * this.props.planetRadius,
                76 * this.props.starMass * 0.75,
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
        const data = this.generateLightcurveData(
            7 * this.props.planetRadius,
            76 * this.props.starMass * 0.75,
            this.props.planetSemimajorAxis,
            this.props.planetEccentricity,
            this.props.inclination,
            this.props.longitude
        );
        this.setState({lightcurveData: data});
    }
    /**
     * Make a 2d array of data points based on the current planet/star
     * scene. This creates the plot that displays amount of light
     * emitted based on planet phase. A bunch of parameters influence
     * this curve.
     *
     * Returns a 2d array of x/y values.
     */
    generateLightcurveData (
        planetRadius, starRadius
        //semimajorAxis, eccentricity, inclination, longitude
    ) {
        const a = [];

        const starPos = {x: 175, y: 175};
        const phaseWidth = this.props.phaseWidth;

        // Adjust this number to change the number of values sampled.
        const samples = 180;

        for (let i = 0; i < phaseWidth; i += phaseWidth / samples) {
            const currentPlanetPos = {
                x: this.props.phaseMin + i,
                y: 220
            };

            // Calculate the intersection of the planet and star at this
            // point.
            let y = areaOfIntersection(
                currentPlanetPos.x, currentPlanetPos.y,
                planetRadius,
                starPos.x, starPos.y, starRadius);

            if (!isNaN(y)) {
                // X is the planet phase position, and Y is the amount
                // of light that the star/planet scene emits.  When the
                // planet is moving over the star, its brightness is
                // slightly less. Otherwise there's full brightness (y=1).

                // Also, scale y to something small.
                // TODO: make this scale exactly like the original somehow.
                y = y * 0.0001;
                a.push([i, 1 - y]);
            } else {
                console.error('y is NaN. The area calculation is probably wrong.');
            }
        }
        return a;
    }
    randomDataSet() {
        if (!this.props.showSimulatedMeasurements) {
            return [];
        }
        return Array.from(Array(this.props.simMeasurementNumber)).map(
            () => [Math.random() * 200, Math.random() + 0.5]);
    }
    /**
     * Generate noise around the lightcurve data.
     */
    getNoiseData(lightcurveData) {
        if (!this.props.showSimulatedMeasurements) {
            return [];
        }

        // Find the middle x value.
        const i = Math.round(lightcurveData.length / 2);
        const mid = lightcurveData[i];

        return Array.from(Array(this.props.simMeasurementNumber)).map(
            () => [Math.random() * (mid[0] * 2), Math.random() + 0.5]);
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
                paddingLeft={60}
                padding={20} />
        );

    }
    componentDidUpdate(prevProps) {
        if (this.props.showSimulatedMeasurements) {
            if (
                prevProps.planetRadius !== this.props.planetRadius
            ) {
                this.setState({
                    noiseData: this.getNoiseData(this.state.lightcurveData)
                });
            }
            if (
                prevProps.simMeasurementNumber !== this.props.simMeasurementNumber
            ) {
                this.setState({
                    noiseData: this.getNoiseData(this.state.lightcurveData)
                });
            }
        }

        if (
            prevProps.showSimulatedMeasurements !==
                this.props.showSimulatedMeasurements
        ) {
            this.setState({
                noiseData: this.getNoiseData(this.state.lightcurveData)
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
            this.updateLightcurveData();

            if (this.props.showSimulatedMeasurements) {
                this.setState({
                    noiseData: this.getNoiseData(this.state.lightcurveData)
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

    // phaseMin and phaseMax are min and max X co-ordinates of the
    // planet's phaseLine in the Pixi scene. This is needed to
    // calculate the lightcurve.
    phaseMin: PropTypes.number.isRequired,
    phaseWidth: PropTypes.number.isRequired
};
