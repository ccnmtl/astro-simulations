import React from 'react';
import PropTypes from 'prop-types';
import Plot from './d3/Plot';


export default class MaxwellPlot extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDragging: false,
        };

        this.onDragStart = this.onDragStart.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.onMove = this.onMove.bind(this);

        this.width = 460;
        this.height = 280;
    }

    render() {
        // d3 integration based on:
        // https://github.com/freddyrangel/playing-with-react-and-d3
        return (
            <Plot
                showCursor={this.props.showCursor}
                showDistInfo={this.props.showDistInfo}
                activeGases={this.props.activeGases}
                gasProportions={this.props.gasProportions}
                selectedGas={this.props.selectedGas}
                temperature={this.props.temperature}
                allowEscape={this.props.allowEscape}
                escapeSpeed={this.props.escapeSpeed}
                width={this.width}
                height={this.height}
                paddingLeft={35}
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

MaxwellPlot.propTypes = {
    activeGases: PropTypes.array.isRequired,
    gasProportions: PropTypes.array.isRequired,
    selectedGas: PropTypes.number,
    temperature: PropTypes.number.isRequired,
    allowEscape: PropTypes.bool.isRequired,
    escapeSpeed: PropTypes.number.isRequired,
    showCursor: PropTypes.bool.isRequired,
    showDistInfo: PropTypes.bool.isRequired
};
