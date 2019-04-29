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
        document.addEventListener('mousemove', this.onDrag.bind(this));
        document.addEventListener('mouseup', this.onDragStop.bind(this));
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
                        <svg viewport="0 0 12 12" version="1.1"
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
                        <img src="./img/minihrdiagram.png" width="383" height="245" />
                        {this.state.showMainSequence &&
                         <img className="main-sequence"
                              src="./img/mainsequence.png" width="280" height="186.6" />
                        }
                    </div>
                    <div className="main-seq-checkbox">
                        <input type="checkbox" name="showMainSequence"
                               id="showMainSequenceCheckbox"
                               onChange={this.toggleMainSequence} />
                        <label className="ml-1 small" htmlFor="showMainSequenceCheckbox">
                            Show main sequence track
                        </label>
                    </div>
                    <HRDiagram />
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
    isHidden: PropTypes.bool.isRequired,
    onWindowClose: PropTypes.func.isRequired
};
