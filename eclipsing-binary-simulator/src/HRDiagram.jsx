import React from 'react';
import PropTypes from 'prop-types';
import * as PIXI from 'pixi.js-legacy';
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
        this.xScale = this.graphW/Math.log(this.tMax/this.tMin);
        this.yScale = this.graphH/Math.log(this.lMax/this.lMin);

        /*var mc = {};
        mc.clear();
        mc.moveTo(0, 0);
        mc.beginFill(0xff0000);
        mc.lineTo(this.graphW, 0);
        mc.lineTo(this.graphW, -this.graphH);
        mc.lineTo(0, -this.graphH);
        mc.lineTo(0, 0);
        mc.endFill();*/

        //this.plotAreaMC.setMask(this.maskMC);

        /*this.plotAreaMC.point1MC.useHandCursor = false;
        this.plotAreaMC.point1MC.onRollOver = this.pointOnRollOver;
        this.plotAreaMC.point1MC.onPress = this.pointOnPress;
        this.plotAreaMC.point1MC.onMouseMoveFunc = this.pointOnMouseMoveFunc;
        this.plotAreaMC.point1MC.onRollOut = this.pointOnRollOut;
        this.plotAreaMC.point1MC.onReleaseOutside = this.pointOnReleaseOutside;
        this.plotAreaMC.point1MC.onRelease = this.pointOnRelease;

        this.plotAreaMC.point2MC.useHandCursor = false;
        this.plotAreaMC.point2MC.onRollOver = this.pointOnRollOver;
        this.plotAreaMC.point2MC.onPress = this.pointOnPress;
        this.plotAreaMC.point2MC.onMouseMoveFunc = this.pointOnMouseMoveFunc;
        this.plotAreaMC.point2MC.onRollOut = this.pointOnRollOut;
        this.plotAreaMC.point2MC.onReleaseOutside = this.pointOnReleaseOutside;
        this.plotAreaMC.point2MC.onRelease = this.pointOnRelease;

        this.plotAreaMC.point1MC.labelMC.labelField.text = "1";
        this.plotAreaMC.point2MC.labelMC.labelField.text = "2";

        this.lowerRadiusLimitMC._x = this.graphW;
        this.upperRadiusLimitMC._x = 0;*/

        /*mc = {};
         mc.clear();
        mc.lineStyle(1, 0xff0000);
        mc.beginFill(0xff00ff, 30);
        mc.moveTo(0, 0);
        mc.lineTo(this.graphW, 0);
        mc.lineTo(this.graphW, -this.graphH);
        mc.lineTo(0, -this.graphH);
        mc.lineTo(0, 0);
        mc.endFill();
        this.rangesMC.setMask(mc);*/

        this.onDotMove = this.onDotMove.bind(this);
        this.onDragStart = this.onDragStart.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);

        this.dotRadius = 3;
    }

    componentDidMount() {
        this.app = new PIXI.Application({
            width: 383,
            height: 245,

            transparent: true,

            // The default is webgl - I'll switch to that if necessary
            // but for now canvas just displays my images better. I'm
            // guessing there's just some filters or settings I can add
            // to make it look good in webgl.
            forceCanvas: true,
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
                    me.props.star1Temp, me.props.star1Radius));

            me.setPointPosition(
                2, me.props.star2Temp,
                getLuminosityFromRadiusAndTemp(
                    me.props.star2Temp, me.props.star2Radius));
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.showMainSequence !== this.props.showMainSequence) {
            this.mainsequence.visible = this.props.showMainSequence;
        }

        if (prevState.isHoveringDot1 !== this.state.isHoveringDot1) {
            this.dot1.children[0].destroy();

            if (this.state.isHoveringDot1) {
                this.dot1.addChild(this.makeDot(0, 0, this.dotRadius * 2));
            } else {
                this.dot1.addChild(this.makeDot(0, 0, this.dotRadius));
            }
        }

        if (prevState.isHoveringDot2 !== this.state.isHoveringDot2) {
            this.dot2.children[0].destroy();

            if (this.state.isHoveringDot2) {
                this.dot2.addChild(this.makeDot(0, 0, this.dotRadius * 2));
            } else {
                this.dot2.addChild(this.makeDot(0, 0, this.dotRadius));
            }
        }
    }

    makeDot(x, y, r) {
        const dot = new PIXI.Graphics();
        dot.beginFill(0xFF0000);
        dot.drawCircle(x, y, r);
        return dot;
    }

    drawDots() {
        this.dot1 = new PIXI.Container();
        this.dot1.name = 'dot1';
        this.dot1.interactive = true;
        this.dot1.addChild(this.makeDot(0, 0, this.dotRadius));
        this.app.stage.addChild(this.dot1);
        this.dot1
        // events for drag start
            .on('mousedown', this.onDragStart)
            .on('touchstart', this.onDragStart)
        // events for drag end
            .on('mouseup', this.onDragEnd)
            .on('mouseupoutside', this.onDragEnd)
            .on('touchend', this.onDragEnd)
            .on('touchendoutside', this.onDragEnd)
        // events for drag move
            .on('mousemove', this.onDotMove)
            .on('touchmove', this.onDotMove);

        this.dot2 = new PIXI.Container();
        this.dot2.name = 'dot2';
        this.dot2.interactive = true;
        this.dot2.addChild(this.makeDot(0, 0, this.dotRadius));
        this.app.stage.addChild(this.dot2);
        this.dot2
        // events for drag start
            .on('mousedown', this.onDragStart)
            .on('touchstart', this.onDragStart)
        // events for drag end
            .on('mouseup', this.onDragEnd)
            .on('mouseupoutside', this.onDragEnd)
            .on('touchend', this.onDragEnd)
            .on('touchendoutside', this.onDragEnd)
        // events for drag move
            .on('mousemove', this.onDotMove)
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
            this.dot1.position.x = pos.x;
            this.dot1.position.y = pos.y;
        }
        if (this.state.isDraggingDot2) {
            this.dot2.position.x = pos.x;
            this.dot2.position.y = pos.y;
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

        /*var dx = otherPoint.position.x - nx;
        var dy = otherPoint.position.y - ny;

        var s = 14/Math.sqrt(dx*dx + dy*dy);*/

        /*thisPoint.labelMC.position.x = -s*dx;
        thisPoint.labelMC.position.y = -s*dy;

        otherPoint.labelMC.position.x = -thisPoint.labelMC.position.x;
        otherPoint.labelMC.position.y = -thisPoint.labelMC.position.y;*/
    }

    showRanges(star) {
        var radiusRange = this._parent._parent["radius"+star+"Slider"].getRange();
        var tempRange = this._parent._parent["temp"+star+"Slider"].getRange();

        if (!this._parent._parent["restrict"+star+"Check"].getValue()) tempRange.max = this._parent._parent.TmaxSld;

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
        return this.graphW - this.xScale * Math.log(t/this.tMin);
    }

    findY(l) {
        return -this.yScale * Math.log(l/this.lMin);
    }

    findT(x) {
        return this.tMin * Math.exp((this.graphW-x)/this.xScale);
    }

    findL(y) {
        return this.lMin * Math.exp(-y/this.yScale);
    }

    render() {
        return <div ref={(thisDiv) => {this.el = thisDiv}} />;
    }
}

HRDiagram.propTypes = {
    star1Temp: PropTypes.number.isRequired,
    star1Radius: PropTypes.number.isRequired,
    star2Temp: PropTypes.number.isRequired,
    star2Radius: PropTypes.number.isRequired,
    showMainSequence: PropTypes.bool.isRequired
};
