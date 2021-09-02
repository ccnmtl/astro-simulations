import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {
    VictoryAxis, VictoryBar, VictoryChart, VictoryContainer, VictoryLine, VictoryStack,
    Background
} from 'victory';
import { getHZone, DraggableCursor } from './utils';
import { LOG_BASE } from './main';
import {shzStarData as STAR_DATA} from './shzStars.js';
import {
    roundToTwoPlaces, forceNumber
} from '../../eclipsing-binary-simulator/src/utils.js';
import { RangeStepInput } from 'react-range-step-input';

// In milliseconds
const ANIMATION_INTERVAL = 25
// how far the timeline should move with each increment, in pct
const ANIMATION_INCREMENT = 0.005

export default class CSHZTimeline extends React.Component {
    constructor(props) {
        super(props)
        this.getPlanetTemp = this.getPlanetTemp.bind(this);
        this.handleTimelineUpdate = this.handleTimelineUpdate.bind(this);
        this.handleUpdateAnimationRate = this.handleUpdateAnimationRate.bind(this);
        this.annotateDataTable = this.annotateDataTable.bind(this);
        this.calculateZonePcts = this.calculateZonePcts.bind(this);
        this.incrementAnimation = this.incrementAnimation.bind(this);
        this.toggleTimelineAnimation = this.toggleTimelineAnimation.bind(this);
        this.clearInterval = this.clearInterval.bind(this);
        this.findStarAgeIdx = this.findStarAgeIdx.bind(this);
        this.handleTimelineMouseDown = this.handleTimelineMouseDown.bind(this);
        this.handleTimelineMouseUp = this.handleTimelineMouseUp.bind(this);
        this.moveTimelineToMouse = this.moveTimelineToMouse.bind(this);
        this.updateMousePosition = this.updateMousePosition.bind(this);
        this.clearTimelineInterval = this.clearTimelineInterval.bind(this);
        this.handleTimelineKeyDown = this.handleTimelineKeyDown.bind(this);
        this.handleTimelineKeyUp = this.handleTimelineKeyUp.bind(this);
        this.incrementTimeline = this.incrementTimeline.bind(this);
        this.decrementTimeline = this.decrementTimeline.bind(this);

        const dataTable = this.annotateDataTable(
                STAR_DATA[this.props.starMassIdx].dataTable, this.props.planetDistance);
        const [temperateZonePct, hotZonePct, whiteDwarfPct] = this.calculateZonePcts(dataTable, STAR_DATA[this.props.starMassIdx].timespan)
        this.interval = React.createRef(null);
        this.timelineMouseInterval = React.createRef(null);
        this.timelineKeyInterval = React.createRef(null);
        this.timelineContainer = React.createRef(null);
        this.mouseX = React.createRef(-1);
        this.mouseY = React.createRef(-1);

        this.state = {
            timelinePosition: 0.0,
            dataTable: dataTable,
            temperateZonePct: temperateZonePct,
            hotZonePct: hotZonePct,
            whiteDwarfPct: whiteDwarfPct,
            animationRate: 1,
            timelineClickDown: false,
        }
    }

    getPlanetTemp(solarRadii, starTemp, planetDistance) {
       // T(planet) = [R(star)^2 x T(star)^4 / 4 d(planet)^2]^0.25
       // convert solar radii to meters
       const radius = solarRadii * 6.96 * (10 ** 8)
       // return planet temp in C
       return ((((radius ** 2) * (starTemp ** 4)) / (4 * (planetDistance ** 2))) ** 0.25) - 273;
    }

    handleUpdateAnimationRate(evt) {
        const val = forceNumber(evt.target.value);
        if(0.1 <= val && val <= 2) {
            this.setState({animationRate: val})
        }
    }

    annotateDataTable(dataTable, distP) {
        // Takes a dataTable, returns a new one with temp added
        return dataTable.reduce((acc, datum) => {
            // Calculate the temp
            const starRadius = LOG_BASE ** datum.logRadius;
            const starTemp = LOG_BASE ** datum.logTemp;
            const planetDistance = distP * (1.495978707 * (10 ** 11))
            const temp = this.getPlanetTemp(
                starRadius,
                starTemp,
                planetDistance)
            acc.push({time: datum.time, temp: temp});
            return acc;
        }, [])
    }

    calculateZonePcts(dataTable, lifetime) {
        const obj = dataTable.reduce((acc, val) => {
            if(acc.temperateZonePct == null && val.temp > 0 && val.temp < 100) {
                acc.temperateZonePct = Math.round((val.time / lifetime) * 100);
            } else if (acc.hotZonePct == null && val.temp > 100) {
                acc.hotZonePct = Math.round((val.time / lifetime) * 100);
            } else if (val.temp > acc.maxTemp) {
                acc.whiteDwarfPct = Math.round((val.time / lifetime) * 100);
                acc.maxTemp = val.temp
            }
            return acc
        }, {temperateZonePct: null, hotZonePct: null, whiteDwarfPct: null, maxTemp: Number.NEGATIVE_INFINITY});

        // Extra cases to consider:
        // - temperate is null, hot is not null
        //   means that the planet was too close to the star
        //   during the stars lifetime, and the planet was always
        //   too hot
        if (obj.temperateZonePct == null && obj.hotZonePct != null) {
            obj.temperateZonePct = 0;
        }

        // - temperate is not null, hot is null
        //   means that the planet reached the temperate zone
        //   but somehow the star never got too hot, possible
        //   but very unlikely
        if (obj.temperateZonePct != null && obj.hotZonePct == null) {
            obj.hotZonePct = obj.temperateZonePct;
        }

        // - temperate is null, hot is null
        //   means that the planet was always too cold for life
        if (obj.temperateZonePct == null && obj.hotZonePct == null) {
            obj.temperateZonePct = obj.whiteDwarfPct;
            obj.hotZonePct = obj.whiteDwarfPct;
        }

        return [
            obj.temperateZonePct, obj.hotZonePct, obj.whiteDwarfPct
        ]
    }

    componentDidMount() {
        document.addEventListener('mouseup', this.handleTimelineMouseUp);
        document.addEventListener('mousemove', this.updateMousePosition);
    }

    componentWillUnmount() {
        document.removeEventListener('mouseup', this.handleTimelineMouseUp);
        document.removeEventListener('mousemove', this.updateMousePosition);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.planetDistance !== prevProps.planetDistance ||
            this.props.starAge !== prevProps.starAge ||
            this.props.starMassIdx !== prevProps.starMassIdx) {

            const dataTable = this.annotateDataTable(
                    STAR_DATA[this.props.starMassIdx].dataTable, this.props.planetDistance);
            const [temperateZonePct, hotZonePct, whiteDwarfPct] = this.calculateZonePcts(dataTable, STAR_DATA[this.props.starMassIdx].timespan)

            // Update the timeline position only if the star changes
            let timelinePosition = prevState.timelinePosition;
            if (this.props.starAge !== prevProps.starAge ||
                this.props.starMassIdx !== prevProps.starMassIdx) {
               timelinePosition = 0.0;
            }

            this.setState({
                timelinePosition: timelinePosition,
                dataTable: dataTable,
                temperateZonePct: temperateZonePct,
                hotZonePct: hotZonePct,
                whiteDwarfPct: whiteDwarfPct
            })
        }
    }

    handleTimelineUpdate(position) {
        // 0 <= position <= 1
        this.setState({timelinePosition: position});

        // Find the closest index
        const yearsAfterFormation = position * Math.round(STAR_DATA[this.props.starMassIdx].timespan);
        this.props.setStarAgeIdx(this.findStarAgeIdx(yearsAfterFormation, this.state.dataTable));
    }

    clearInterval() {
        window.clearInterval(this.interval.current);
        this.interval.current = null;
    }

    incrementAnimation() {
        if (this.interval.current !== null) {
            this.setState((state, props) => {
                if (state.timelinePosition >= 1) {
                    this.clearInterval();
                    return {timelinePosition: 1}
                } else {
                    const nextPosition = state.timelinePosition + (ANIMATION_INCREMENT * this.state.animationRate);
                    const position = nextPosition <= 1 ? nextPosition : 1;
                    // Find the closest index
                    const yearsAfterFormation = position * Math.round(STAR_DATA[props.starMassIdx].timespan);
                    props.setStarAgeIdx(this.findStarAgeIdx(yearsAfterFormation, state.dataTable));
                    return {timelinePosition: position}
                }
            })
        }
    }

    findStarAgeIdx(yearsAfterFormation, dataTable) {
        // Note, this is called within a set state call, so it needs to be thread-safe
        let [low, mid, high, found] = [0, 0, dataTable.length - 1, false]
        while (!found) {
            mid = Math.floor((high + low) / 2);
            if (dataTable[mid].time <= yearsAfterFormation && yearsAfterFormation < dataTable[mid + 1].time) {
                found = true;
            } else if (dataTable[mid].time < yearsAfterFormation) {
                low = mid;
            } else {
                high = mid;
            }
        }
        return mid;
    }

    toggleTimelineAnimation(evt) {
        evt.stopPropagation()
        evt.preventDefault()

        if (this.interval.current) {
            this.clearInterval();
            // Force an update to update the Play/Stop button label
            this.forceUpdate();
        } else {
            this.interval.current = window.setInterval(this.incrementAnimation, ANIMATION_INTERVAL)
        }
    }

    moveTimelineToMouse() {
        // Increment/decrement timeline to the mouse position

        // calculate the mouse position over the timeline
        this.setState((state, props) => {
            const el = this.timelineContainer.current.getElementsByTagName('g');
            const cursor = el[1];
            const cursorX = cursor.getBoundingClientRect().x;
            // if the mouse is within some small number of pixels of the cursor, clear the callback
            const epsilon = 5;
            if (Math.abs(this.mouseX.current - cursorX) < epsilon) {
                this.clearTimelineInterval();
                return {timelinePosition: state.timelinePosition}
            } else if (this.mouseX.current < cursorX) {
                // if the mouse is the left of the cursor, decrement timelinePosition
                if (state.timelinePosition <= 0) {
                    return {timelinePosition: 0}
                } else {
                    const position = state.timelinePosition - 0.01;
                    const yearsAfterFormation = position * Math.round(STAR_DATA[props.starMassIdx].timespan);
                    props.setStarAgeIdx(this.findStarAgeIdx(yearsAfterFormation, state.dataTable));
                    return {timelinePosition: position}
                }
            } else {
                // if the mouse is the right of the cursor, increment timelinePosition
                if (state.timelinePosition >= 1) {
                    return {timelinePosition: 1}
                } else {
                    const position = state.timelinePosition + 0.01;
                    const yearsAfterFormation = position * Math.round(STAR_DATA[props.starMassIdx].timespan);
                    props.setStarAgeIdx(this.findStarAgeIdx(yearsAfterFormation, state.dataTable));
                    return {timelinePosition: position}
                }
            }
        })
    }

    handleTimelineMouseDown() {
        this.setState({timelineClickDown: true});
        // set an interval here
        this.timelineMouseInterval.current = window.setInterval(this.moveTimelineToMouse, 25);
    }

    handleTimelineMouseUp() {
        if (this.state.timelineClickDown !== null) {
            this.setState({timelineClickDown: false});
        }

        // clear the interval here
        if (this.timelineMouseInterval.current !== null) {
            this.clearTimelineInterval();
        }
    }

    clearTimelineInterval() {
        window.clearInterval(this.timelineMouseInterval.current);
        this.timelineMouseInterval.current = null;
    }

    updateMousePosition(evt) {
        this.mouseX.current = evt.clientX;
        this.mouseY.current = evt.clientY;
    }

    incrementTimeline() {
        // Increment
        this.setState((state, props) => {
            const position = state.timelinePosition + 0.01;
            if (position <= 1) {
                const yearsAfterFormation = position * Math.round(STAR_DATA[props.starMassIdx].timespan);
                props.setStarAgeIdx(this.findStarAgeIdx(yearsAfterFormation, state.dataTable));
                return {timelinePosition: position}
            } else {
                return {timelinePosition: 1}
            }
        })
    }

    decrementTimeline() {
        // Decrement
        this.setState((state, props) => {
            const position = state.timelinePosition - 0.01;
            if (position >= 0) {
                const yearsAfterFormation = position * Math.round(STAR_DATA[props.starMassIdx].timespan);
                props.setStarAgeIdx(this.findStarAgeIdx(yearsAfterFormation, state.dataTable));
                return {timelinePosition: position}
            } else {
                return {timelinePosition: 0}
            }
        })
    }

    handleTimelineKeyDown(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        if (this.timelineKeyInterval.current === null) {
            if (evt.keyCode == 37) {
                // Decrement
                this.timelineKeyInterval.current = window.setInterval(this.decrementTimeline, 100);
            } else if (evt.keyCode == 39) {
                // Increment
                this.timelineKeyInterval.current = window.setInterval(this.incrementTimeline, 100);
            }
        }
    }

    handleTimelineKeyUp(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        if (this.timelineKeyInterval.current !== null) {
            window.clearInterval(this.timelineKeyInterval.current);
            this.timelineKeyInterval.current = null;
        }
    }

    render() {
        return(<div>
            <div>
                <h2>Timeline and Simulation Controls</h2>
            </div>
            <div className={'d-flex justify-content-between'}>
                <div>
                    Time since star system formation: {typeof this.props.starMassIdx === 'number' && (
                            (() => {
                                let starAge = Math.floor(this.state.dataTable[this.props.starAgeIdx].time)
                                return starAge < 1000 ? `${starAge} My` : `${roundToTwoPlaces(starAge / 1000)} Gy`
                            } )()
                    )}
                </div>
                <div>
                    <RangeStepInput
                        className='form-control'
                        name={'animation-rate-range-input'}
                        value={this.state.animationRate}
                        onChange={this.handleUpdateAnimationRate}
                        min={0.1}
                        max={2}
                        step={0.1} />
                    <button
                        type={'button'}
                        onClick={this.toggleTimelineAnimation}
                        className={'btn btn-primary'}>
                        {this.interval.current ? ('Stop') : ('Play')}
                    </button>
                </div>
            </div>
            <div>
                <DraggableCursor
                    cursorPosition={this.state.timelinePosition}
                    onUpdate={this.handleTimelineUpdate}/>
                {typeof this.props.starMassIdx === 'number' && this.props.planetDistance && (<>
                    <svg
                        width={960}
                        height={50}
                        viewBox={'0 0 960 50'}
                        style={{pointerEvents: 'all', width: '100%', height: '100%'}}
                        tabIndex={0}
                        ref={this.timelineContainer}
                        onKeyDown={this.handleTimelineKeyDown}
                        onKeyUp={this.handleTimelineKeyUp}
                        onMouseDown={this.handleTimelineMouseDown}
                        onMouseUp={this.handleTimelineMouseUp}>
                        <VictoryChart
                            // Domain is the stars age, range is surface temp of planet in C
                            domain={{x: [
                                0, Math.round(STAR_DATA[this.props.starMassIdx].timespan)]}}
                            standalone={false}
                            height={50}
                            width={960}>
                            <VictoryBar
                                barWidth={2}
                                domain={{x: [0, 100]}}
                                style={{
                                    data: {fill: 'red'}
                                }}
                                data={[{x: this.state.timelinePosition * Math.round(STAR_DATA[this.props.starMassIdx].timespan), y: 1}]}/>
                            <VictoryAxis
                                tickCount={8}
                                style={{
                                    ticks: {stroke: 'black', size: 10}
                                }}
                                tickFormat={(val) => {
                                    return val < 1000 ? `${Math.round(val)} My` : `${Math.round(val / 1000)} Gy`
                                }}/>
                        </VictoryChart>
                    </svg>
                    <VictoryChart
                        // Domain is the stars age, range is surface temp of planet in C
                        domain={{x: [
                            0, Math.round(STAR_DATA[this.props.starMassIdx].timespan)],
                            y: [0, 100]}}
                        height={200}
                        width={960}>
                        <VictoryAxis
                            style={{
                                axis: {stroke: '#0000FF'},
                                tickLabels: {display: 'none'},
                                axisLabel: {padding: 5}
                            }}
                            tickFormat={[]}
                            label={'Too cold'}/>
                        <VictoryAxis
                            orientation={'top'}
                            style={{
                                axis: {stroke: '#FF0000'},
                                tickLabels: {display: 'none'},
                                axisLabel: {padding: 5}
                            }}
                            tickFormat={[]}
                            label={'Too hot'}/>
                        <VictoryBar
                            barWidth={2}
                            style={{
                                data: {fill: 'red'}
                            }}
                            data={[{x: this.state.timelinePosition * Math.round(STAR_DATA[this.props.starMassIdx].timespan), y: 100}]}/>
                        <VictoryLine
                            data={this.state.dataTable}
                            interpolation={'natural'}
                            x={(datum) => { return datum.time }}
                            y={(datum) => { return datum.temp }}
                            >
                        </VictoryLine>
                    </VictoryChart>

                    <svg
                        width={960}
                        height={25}
                        viewBox={'0 0 960 25'}
                        style={{pointerEvents: 'all', width: '100%', height: '100%'}}>
                        <defs>
                            <linearGradient id={'temp-gradient'}>
                                <stop style={{stopColor: 'lightblue'}} offset={`${this.state.temperateZonePct}%`} />
                                <stop style={{stopColor: 'blue'}} offset={`${this.state.temperateZonePct}%`} />
                                <stop style={{stopColor: 'blue'}} offset={`${this.state.hotZonePct}%`} />
                                <stop style={{stopColor: 'red'}} offset={`${this.state.hotZonePct}%`} />
                                <stop style={{stopColor: 'red'}} offset={`${this.state.whiteDwarfPct}%`} />
                                <stop style={{stopColor: 'grey'}} offset={`${this.state.whiteDwarfPct}%`} />
                            </linearGradient>
                        </defs>
                        <VictoryChart
                            // Domain is the stars age, range is surface temp of planet in C
                            domain={{x: [
                                0, Math.round(STAR_DATA[this.props.starMassIdx].timespan)]}}
                            style={{
                                background: {fill: 'url(#temp-gradient)'}
                            }}
                            backgroundComponent={<Background x={50} y={7} height={10}/>}
                            standalone={false}
                            height={25}
                            width={960}>
                            <VictoryAxis
                                style={{
                                    axis: {display: 'none'},
                                    tickLabels: {display: 'none'},
                                }}
                                tickFormat={[]}
                                label={''}/>
                            <VictoryBar
                                barWidth={2}
                                style={{
                                    data: {fill: 'red'},
                                }}
                                data={[{x: this.state.dataTable[this.props.starAgeIdx].time, y: 1}]}/>
                        </VictoryChart>
                    </svg>
                    <div className={'mb-3'}></div>
                </>)}
            </div>
        </div>)
    }
}

CSHZTimeline.propTypes = {
    starMassIdx: PropTypes.number.isRequired,
    starAge: PropTypes.number.isRequired,
    setStarAgeIdx: PropTypes.func.isRequired,
    starAgeIdx: PropTypes.number.isRequired,
    planetDistance: PropTypes.number.isRequired,
}
