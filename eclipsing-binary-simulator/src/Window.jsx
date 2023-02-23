import React from 'react';
import PropTypes from 'prop-types';
import HRDiagram from './HRDiagram';

const clamp = function(n) {
    return Math.min(
        Math.max(n, 0),
        // container width - window width
        1110 - 400);
};

export default class Window extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showMainSequence: false,
            isDragging: false,
            xDiff: 0,
            yDiff: 0,
            x: 50,
            y: 50
        };

        this.onDragStart = this.onDragStart.bind(this);

        this.toggleMainSequence = this.toggleMainSequence.bind(this);
    }
    componentDidMount() {
        document.addEventListener('pointermove', this.onDrag.bind(this));
        document.addEventListener('pointerup', this.onDragStop.bind(this));
    }
    render() {
        if (this.props.isHidden) {
            return null;
        }

        const style = {
            position: 'absolute',
            transform: `translate(${this.state.x}px, ${this.state.y}px)`
        };

        return (
            <div className="window" style={style}>
                <div className="window-bar"
                     onMouseDown={this.onDragStart}>
                    <div>HR Diagram</div>
                    <span className="window-close"
                          onClick={this.props.onWindowClose}>
                        <svg version="1.1"
                             width="16" height="16"
                             xmlns="http://www.w3.org/2000/svg">
                            <line x1="1" y1="11"
                                  x2="11" y2="1"
                                  stroke="black"
                                  strokeWidth="2" />
                            <line x1="1" y1="1"
                                  x2="11" y2="11"
                                  stroke="black"
                                  strokeWidth="2" />
                        </svg>
                    </span>
                </div>
                <div className="window-body">
                    <div className="hr-diagram">
                        <HRDiagram
                            star1Temp={this.props.star1Temp}
                            star1Radius={this.props.star1Radius}
                            star2Temp={this.props.star2Temp}
                            star2Radius={this.props.star2Radius}
                            showMainSequence={this.state.showMainSequence}
                            onDotMove={this.props.onDotMove}
                        />
                    </div>
                    <div className="main-seq-checkbox">
                        <input type="checkbox" name="showMainSequence"
                               id="showMainSequenceCheckbox"
                               defaultChecked={false}
                               onChange={this.toggleMainSequence} />
                        <label className="ml-1 small" htmlFor="showMainSequenceCheckbox">
                            Show main sequence track
                        </label>
                    </div>
                </div>
            </div>
        );

    }
    toggleMainSequence(e) {
        this.setState({
            showMainSequence: !!e.target.checked
        });
    }

    onDragStart(e) {
        this.setState({
            isDragging: true,
            xDiff: e.pageX - this.state.x,
            yDiff: e.pageY - this.state.y
        });
    }
    onDragStop() {
        this.setState({isDragging: false});
    }
    onDrag(e) {
        if (this.state.isDragging) {
            this.setState({
                x: clamp(e.pageX - this.state.xDiff),
                y: clamp(e.pageY - this.state.yDiff)
            });
        }
    }
}

Window.propTypes = {
    star1Temp: PropTypes.number.isRequired,
    star1Radius: PropTypes.number.isRequired,
    star2Temp: PropTypes.number.isRequired,
    star2Radius: PropTypes.number.isRequired,
    isHidden: PropTypes.bool.isRequired,
    onWindowClose: PropTypes.func.isRequired,
    onDotMove: PropTypes.func.isRequired
};
