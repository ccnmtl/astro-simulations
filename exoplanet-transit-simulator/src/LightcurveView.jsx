import React from 'react';
import PropTypes from 'prop-types';
import Plot from './d3/Plot';

export default class LightcurveView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDragging: false,
            data: this.randomDataSet()
        };

        this.onDragStart = this.onDragStart.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.onMove = this.onMove.bind(this);
    }
    randomNum() {
        return Math.floor(Math.random() * 1000);
    }
    randomDataSet() {
        if (!this.props.showSimulatedMeasurements) {
            return [];
        }
        return Array.from(Array(this.props.simMeasurementNumber)).map(
            () => [this.randomNum(), this.randomNum()]);
    }
    render() {
        // d3 integration based on:
        // https://github.com/freddyrangel/playing-with-react-and-d3
        return (
            <Plot
                data={this.state.data}
                phase={this.props.phase}
                showTheoreticalCurve={this.props.showTheoreticalCurve}
                planetRadius={this.props.planetRadius}
                width={460} height={280}
                padding={30} />
        );

    }
    componentDidUpdate(prevProps) {
        if (prevProps.planetRadius !== this.props.planetRadius) {
            this.setState({data: this.randomDataSet()});
        }
        if (
            prevProps.simMeasurementNumber !== this.props.simMeasurementNumber
        ) {
            this.setState({data: this.randomDataSet()});
        }
        if (
            prevProps.showSimulatedMeasurements !==
                this.props.showSimulatedMeasurements
        ) {
            this.setState({data: this.randomDataSet()});
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
