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
        this._xscale = this._yscale = 100;
        this._xMin = 0;
        this._xMax = 2000;
        this.fraction = 1;

        this.__yScale = -50000;

        this.temperature = 300;
    }

    render() {
        // d3 integration based on:
        // https://github.com/freddyrangel/playing-with-react-and-d3
        return (
            <Plot
                showCursor={this.props.showCursor}
                showDistInfo={this.props.showDistInfo}
                activeGases={this.props.activeGases}
                selectedActiveGas={this.props.selectedActiveGas}
                allowEscape={this.props.allowEscape}
                escapeSpeed={this.props.escapeSpeed}
                width={this.width}
                height={this.height}
                paddingLeft={60}
                padding={20} />
        );

    }

    updateXAxis() {
        var xScale = this.__xScale;
        var min = this._xMin;
        var max = this._xMax;
        var majorExtent = this.majorTickmarkExtent;
        var minorExtent = this.minorTickmarkExtent;
        var minimumSpacing = this.minScreenXSpacing/xScale;
        var majorSpacing = Math.pow(10, Math.ceil(Math.log(minimumSpacing)/Math.LN10));
        let multiple;

        if ((majorSpacing/2) > minimumSpacing) {
            majorSpacing = majorSpacing / 2;
            multiple = 5;
        } else {
            multiple = 2;
        }
        var minorSpacing = majorSpacing/multiple;
        var xStep = minorSpacing*xScale;
        var startTickNum = Math.ceil(min/minorSpacing);
        var tickNumLimit = 1 + Math.floor(max/minorSpacing);
        var x = xScale*((minorSpacing*startTickNum) - min);
        var mc = this.createEmptyMovieClip("xAxisMC", 20);
        mc.lineStyle(this.axesThickness, this.axesColor, this.axesAlpha);
        var tf = this.axesTextFormat;
        var depthCounter = 1000;
        for (var i=startTickNum; i<tickNumLimit; i++) {
            if (i%multiple==0) {
                mc.moveTo(x, 0);
                mc.lineTo(x, majorExtent);
                var value = minorSpacing*i;
                var optionsObject = {
                    x: x,
                    y: majorExtent+2,
                    depth: depthCounter,
                    vAlign: "top",
                    hAlign: "center",
                    mc: mc,
                    embedFonts: true,
                    textFormat: tf
                };
                this.displayText(value, optionsObject);
                depthCounter++;
            }
            else {
                mc.moveTo(x, 0);
                mc.lineTo(x, minorExtent);
            }
            x += xStep;
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

MaxwellPlot.propTypes = {
    activeGases: PropTypes.array.isRequired,
    selectedActiveGas: PropTypes.number,
    allowEscape: PropTypes.bool.isRequired,
    escapeSpeed: PropTypes.number.isRequired,
    showCursor: PropTypes.bool.isRequired,
    showDistInfo: PropTypes.bool.isRequired
};
