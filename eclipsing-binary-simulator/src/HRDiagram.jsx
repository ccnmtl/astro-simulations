import React from 'react';
import PropTypes from 'prop-types';
import * as PIXI from 'pixi.js';
import {getLuminosityFromRadiusAndTemp} from './utils';

export default class HRDiagram extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isHoveringDot1: false,
            isHoveringDot2: false,
            isDraggingDot1: false,
            isDraggingDot2: false
        };

        // - these limits can't be changed, at least not without considerable effort
        // - some of these limits have to be manually adjusted to match the slider limits

        this.tMin = 3000;
        this.tMax = 45000;
        this.lMin = 1e-3;
        this.lMax = 1e6;
        this.graphW = 300;
        this.graphH = 200;
        this.leftMargin = 62;
        this.topMargin = 4;
        this.xScale = this.graphW / Math.log(this.tMax / this.tMin);
        this.yScale = this.graphH / Math.log(this.lMax / this.lMin);

        this.onDotMove = this.onDotMove.bind(this);
        this.onDragStart = this.onDragStart.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);

        this.dotRadius = 3.5;
    }

    constrainXValue(x) {
        return Math.min(360, Math.max(62, x));
    }

    constrainYValue(y) {
        return Math.min(202, Math.max(5, y));
    }

    componentDidMount() {
        this.app = new PIXI.Application({
            width: 383,
            height: 245,

            transparent: true,

            antialias: true,

            // as far as I know the ticker isn't necessary at the
            // moment, so don't instantiate a new one.
            sharedTicker: true
        });

        this.el.appendChild(this.app.view);

        this.app.loader.add('minihrdiagram', 'img/minihrdiagram.png')
            .add('mainsequence', 'img/mainsequence.png');

        const me = this;
        this.app.loader.load((loader, resources) => {
            me.resources = resources;

            const minihrdiagram = new PIXI.Sprite(resources.minihrdiagram.texture);
            minihrdiagram.cacheAsBitmap = true;
            me.app.stage.addChild(minihrdiagram);

            const mainsequence = new PIXI.Sprite(resources.mainsequence.texture);
            mainsequence.position.x = 66;
            mainsequence.position.y = 8;
            mainsequence.visible = me.props.showMainSequence;
            me.app.stage.addChild(mainsequence);
            me.mainsequence = mainsequence;

            me.drawDots();

            me.setPointPosition(
                1, me.props.star1Temp,
                getLuminosityFromRadiusAndTemp(
                    me.props.star1Radius, me.props.star1Temp));

            me.setPointPosition(
                2, me.props.star2Temp,
                getLuminosityFromRadiusAndTemp(
                    me.props.star2Radius, me.props.star2Temp));
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.showMainSequence !== this.props.showMainSequence) {
            this.mainsequence.visible = this.props.showMainSequence;
        }

        if (prevState.isHoveringDot1 !== this.state.isHoveringDot1) {
            this.dot1.getChildByName('dot').destroy();

            if (this.state.isHoveringDot1) {
                this.dot1.addChild(this.makeDot(0, 0, this.dotRadius * 1.5));
            } else {
                this.dot1.addChild(this.makeDot(0, 0, this.dotRadius));
            }
        }

        if (prevState.isHoveringDot2 !== this.state.isHoveringDot2) {
            this.dot2.getChildByName('dot').destroy();

            if (this.state.isHoveringDot2) {
                this.dot2.addChild(this.makeDot(0, 0, this.dotRadius * 1.5));
            } else {
                this.dot2.addChild(this.makeDot(0, 0, this.dotRadius));
            }
        }

        if (
            prevProps.star1Temp !== this.props.star1Temp ||
            prevProps.star1Radius !== this.props.star1Radius
        ) {
            this.setPointPosition(
                1, this.props.star1Temp,
                getLuminosityFromRadiusAndTemp(
                    this.props.star1Radius, this.props.star1Temp));
        }

        if (
            prevProps.star2Temp !== this.props.star2Temp ||
            prevProps.star2Radius !== this.props.star2Radius
        ) {
            this.setPointPosition(
                2, this.props.star2Temp,
                getLuminosityFromRadiusAndTemp(
                    this.props.star2Radius, this.props.star2Temp));
        }
    }

    makeDot(x, y, r) {
        const dot = new PIXI.Graphics();
        dot.name = 'dot';
        dot.beginFill(0xFF0000);
        dot.drawCircle(x, y, r);
        return dot;
    }

    drawDots() {
        this.dot1 = new PIXI.Container();
        this.dot1.name = 'dot1';
        this.dot1.interactive = true;
        this.dot1.addChild(this.makeDot(0, 0, this.dotRadius));

        const label1 = new PIXI.Text('1', {
            fontFamily: 'Arial',
            fontSize: 15,
            fill: 0x000000,
            align: 'center'
        });
        label1.x = -14;
        label1.y = -20;
        this.dot1.addChild(label1);

        this.app.stage.addChild(this.dot1);
        this.dot1
        // events for drag start
            .on('pointerdown', this.onDragStart)
            .on('touchstart', this.onDragStart)
        // events for drag end
            .on('pointerup', this.onDragEnd)
            .on('pointerupoutside', this.onDragEnd)
            .on('touchend', this.onDragEnd)
            .on('touchendoutside', this.onDragEnd)
        // events for drag move
            .on('pointermove', this.onDotMove)
            .on('touchmove', this.onDotMove);

        this.dot2 = new PIXI.Container();
        this.dot2.name = 'dot2';
        this.dot2.interactive = true;
        this.dot2.addChild(this.makeDot(0, 0, this.dotRadius));

        const label2 = new PIXI.Text('2', {
            fontFamily: 'Arial',
            fontSize: 15,
            fill: 0x000000,
            align: 'center'
        });
        label2.x = -14;
        label2.y = -20;
        this.dot2.addChild(label2);

        this.app.stage.addChild(this.dot2);
        this.dot2
        // events for drag start
            .on('pointerdown', this.onDragStart)
            .on('touchstart', this.onDragStart)
        // events for drag end
            .on('pointerup', this.onDragEnd)
            .on('pointerupoutside', this.onDragEnd)
            .on('touchend', this.onDragEnd)
            .on('touchendoutside', this.onDragEnd)
        // events for drag move
            .on('pointermove', this.onDotMove)
            .on('touchmove', this.onDotMove);
    }

    onDragStart(e) {
        if (e.target.name === 'dot1') {
            this.setState({isDraggingDot1: true});
        } else if (e.target.name === 'dot2') {
            this.setState({isDraggingDot2: true});
        }
    }

    onDragEnd() {
        this.setState({
            isDraggingDot1: false,
            isDraggingDot2: false
        });
    }

    onDotMove(e) {
        if (e.target && e.target.name === 'dot1' && !this.state.isHoveringDot1) {
            this.setState({isHoveringDot1: true});
        }

        if (e.target && e.target.name === 'dot2' && !this.state.isHoveringDot2) {
            this.setState({isHoveringDot2: true});
        }

        if (!e.target && (
            this.state.isHoveringDot1 || this.state.isHoveringDot2)
        ) {
            this.setState({
                isHoveringDot1: false,
                isHoveringDot2: false
            });
        }

        const pos = e.data.getLocalPosition(this.app.stage);
        if (this.state.isDraggingDot1) {
            this.dot1.position.x = this.constrainXValue(pos.x);
            this.dot1.position.y = this.constrainYValue(pos.y);
            this.props.onDotMove(1, this.findT(pos.x), this.findL(pos.y));
        }
        if (this.state.isDraggingDot2) {
            this.dot2.position.x = this.constrainXValue(pos.x);
            this.dot2.position.y = this.constrainYValue(pos.y);
            this.props.onDotMove(2, this.findT(pos.x), this.findL(pos.y));
        }
    }

    setPointPosition(id, t, l) {
        let thisPoint;
        //let otherPoint;

        if (id === 1) {
            thisPoint = this.dot1;
            //otherPoint = this.dot2;
        } else {
            thisPoint = this.dot2;
            //otherPoint = this.dot1;
        }

        var nx = this.findX(t);
        var ny = this.findY(l);
        thisPoint.position.x = nx;
        thisPoint.position.y = ny;
    }

    showRanges(star) {
        var radiusRange = this._parent._parent['radius'+star+'Slider'].getRange();
        var tempRange = this._parent._parent['temp'+star+'Slider'].getRange();

        if (!this._parent._parent['restrict'+star+'Check'].getValue()) tempRange.max = this._parent._parent.TmaxSld;

        var k1 = Math.pow((tempRange.max/5808.3), 4);
        var k2 = 0.071168672;

        var x1 = this.findX(tempRange.max);
        var x2 = this.graphW;
        var y1 = this.findY(radiusRange.min*radiusRange.min*k1);
        var y2 = this.findY(radiusRange.max*radiusRange.max*k1);
        var y3 = this.findY(radiusRange.max*radiusRange.max*k2);
        var y4 = this.findY(radiusRange.min*radiusRange.min*k2);

        var mc = this.rangesMC;
        //mc.clear();

        if (radiusRange.min === radiusRange.max) {
            mc.beginFill(0x999999, 30);
            mc.lineStyle(1, 0xffffff, 0);

            mc.moveTo(-10, 10);
            mc.lineTo(-10, -this.graphH-10);
            mc.lineTo(this.graphW+10, -this.graphH-10);
            mc.lineTo(this.graphW+10, 10);
            mc.lineTo(-10, 10);

            mc.endFill();


            mc.lineStyle(0, 0xffffff, 100);

            mc.moveTo(x1, y1);
            mc.lineTo(x2, y4);
        } else {
            mc.beginFill(0x999999, 30);
            mc.lineStyle(1, 0xffffff, 0);

            mc.moveTo(x1, y1);
            mc.lineTo(x1, y2);
            mc.lineTo(x2, y3);
            mc.lineTo(x2, y4);
            mc.lineTo(x1, y1);

            mc.moveTo(-10, 10);
            mc.lineTo(-10, -this.graphH-10);
            mc.lineTo(this.graphW+10, -this.graphH-10);
            mc.lineTo(this.graphW+10, 10);
            mc.lineTo(-10, 10);

            mc.endFill();
        }
    }

    findX(t) {
        return (this.graphW - this.xScale * Math.log(t / this.tMin))
            + this.leftMargin;
    }

    findY(l) {
        return (this.graphH - this.yScale * Math.log(l / this.lMin))
            + this.topMargin;
    }

    findT(x) {
        return this.tMin * Math.exp((
            this.graphW - x + this.leftMargin
        ) / this.xScale);
    }

    findL(y) {
        return this.lMin * Math.exp((
            this.graphH - y + this.topMargin
        ) / this.yScale);
    }

    render() {
        return <div ref={(thisDiv) => {
            this.el = thisDiv;
        }} />;
    }
}

HRDiagram.propTypes = {
    star1Temp: PropTypes.number.isRequired,
    star1Radius: PropTypes.number.isRequired,
    star2Temp: PropTypes.number.isRequired,
    star2Radius: PropTypes.number.isRequired,
    showMainSequence: PropTypes.bool.isRequired,
    onDotMove: PropTypes.func.isRequired
};
