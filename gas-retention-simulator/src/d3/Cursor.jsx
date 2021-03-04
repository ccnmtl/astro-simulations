import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import 'd3-drag';

export default class Cursor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            xPos: 1000,
            isHovering: false
        };
    }
    render() {
        if (!this.props.showCursor) {
            return null;
        }

        const xPos = this.props.xScale(this.state.xPos) - 20;

        return <React.Fragment>
            {this.props.showDistInfo &&
            <text
                width="45px"
                x={xPos - 6}
                y={this.props.padding}
                dy=".8em"
                fontSize=".9em"
                textAnchor="end">98.9% of N<sub>2</sub> moves slower</text> }
            <line
                x1={xPos}
                y1={this.props.padding}

                x2={xPos}
                y2={this.props.height - (this.props.padding * 2) + 10}

                className="cursor"
                stroke="#ff7070"
                strokeWidth={this.state.isHovering ? 5 : 3} />
            <rect
                x={xPos - 25} y={this.props.height - (this.props.padding * 2) + 10}
                width="50" height="20"
                strokeWidth="1"
                stroke="#ff0000"
                fill="#ffffff" />
            {this.props.showDistInfo &&
            <text
                width="45px"
                x={xPos + 164}
                y={this.props.padding}
                dy=".8em"
                fontSize=".9em"
                textAnchor="end">98.9% of N<sub>2</sub> moves faster</text> }
        </React.Fragment>;
    }
    componentDidUpdate(prevProps) {
        if (prevProps.showCursor !== this.props.showCursor) {
            if (this.props.showCursor) {
                const el = d3.select('.cursor');
                el.call(d3.drag().on('drag', this.dragmove.bind(this)));
                el.on('pointerover', this.mouseover.bind(this));
                el.on('pointerout', this.mouseout.bind(this));
            }
        }
    }
    dragmove(e) {
        const w = this.props.width - this.props.paddingLeft;

        let newPos = ((
            e.x + 20 - this.props.paddingLeft) / w) * this.props.xMax;

        newPos = Math.max(
            this.props.xMin, Math.min(this.props.xMax, newPos));

        this.setState({xPos: newPos});
    }
    mouseover() {
        this.setState({isHovering: true});
    }
    mouseout() {
        this.setState({isHovering: false});
    }
};

Cursor.propTypes = {
    selectedActiveGas: PropTypes.number,
    showCursor: PropTypes.bool.isRequired,
    showDistInfo: PropTypes.bool.isRequired,
    xScale: PropTypes.func.isRequired,
    xMin: PropTypes.number.isRequired,
    xMax: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    padding: PropTypes.number.isRequired,
    paddingLeft: PropTypes.number.isRequired
};
