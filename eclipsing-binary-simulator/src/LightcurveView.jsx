import React from 'react';
import PropTypes from 'prop-types';
import Plot from './d3/Plot';


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
    render() {
        // d3 integration based on:
        // https://github.com/freddyrangel/playing-with-react-and-d3
        return (
            <Plot
                lightcurveData={this.props.curveCoords}
                phase={this.props.phase}
                showLightcurve={this.props.showLightcurve}
                width={460}
                height={280}
                paddingLeft={60}
                padding={20} />
        );

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
    showLightcurve: PropTypes.bool.isRequired,
    phase: PropTypes.number.isRequired,
    curveCoords: PropTypes.array.isRequired
};
