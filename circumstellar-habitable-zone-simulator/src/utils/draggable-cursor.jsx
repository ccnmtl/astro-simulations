import React from 'react';
import PropTypes from 'prop-types';


export class DraggableCursor extends React.Component {
    constructor(props) {
        super(props);

        this.initialState = {
            dragging: false,
            offset: 0
        }
        this.state = this.initialState;

        this.cursorContainer = React.createRef();

        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    // TODO: onFocus, onBlur
    componentDidMount() {
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
    }

    componentWillUnmount() {
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.cursorPosition !== this.props.cursorPosition) {
            const clientRect = this.cursorContainer.current.getBoundingClientRect();
            this.setState({
                offset: this.props.cursorPosition * clientRect.width
            })
        }
    }

    handleMouseDown(evt) {
        this.setState({dragging: true})
        evt.stopPropagation()
        evt.preventDefault()
    }

    handleMouseUp(evt) {
        if (this.state.dragging) {
            this.setState({dragging: false})
        }
        evt.stopPropagation()
        evt.preventDefault()
    }

    handleMouseMove(evt) {
        evt.stopPropagation()
        evt.preventDefault()
        if (this.state.dragging) {
            const clientRect = this.cursorContainer.current.getBoundingClientRect();
            const [containerX, containerWidth] = [clientRect.x, clientRect.width]
            let offset = evt.pageX - containerX;
            if (offset < 0) {
                offset = 0;
            } else if(offset > containerWidth) {
                offset = containerWidth;
            }
            this.props.onUpdate(offset / containerWidth);
        }
    }

    render() {
        return(
            <div
                ref={this.cursorContainer}
                id={'draggable-cursor-container'}
                style={{
                    width: '835px',
                    margin: '0 74px 0.5em 32px',
                }}>
                <div
                    id={'draggable-cursor'}
                    onMouseDown={this.handleMouseDown}
                    style={{
                        width: 0,
                        height: 0,
                        borderLeft: '15px solid transparent',
                        borderRight: '15px solid transparent',
                        borderTop: '15px solid #000000',
                        marginLeft: this.state.offset
                    }}/>
            </div>
        )
    }
}

DraggableCursor.propTypes = {
    cursorPosition: PropTypes.number.isRequired, // a number 0 <= n <= 1
    onUpdate: PropTypes.func.isRequired // a function that takes an updated postion, [0, 1],
}
