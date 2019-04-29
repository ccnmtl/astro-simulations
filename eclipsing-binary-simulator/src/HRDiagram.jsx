import React from 'react';

export default class HRDiagram extends React.Component {
    constructor(props) {
        super(props);

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

        this.hideRanges();
    }

    setPointPosition(id, t, l) {
        let thisPoint, otherPoint;

        if (id==1) {
            thisPoint = this.plotAreaMC.point1MC;
            otherPoint = this.plotAreaMC.point2MC;
        }
        else {
            thisPoint = this.plotAreaMC.point2MC;
            otherPoint = this.plotAreaMC.point1MC;
        }

        var nx = this.findX(t);
        var ny = this.findY(l);
        thisPoint._x = nx;
        thisPoint._y = ny;

        var dx = otherPoint._x - nx;
        var dy = otherPoint._y - ny;

        var s = 14/Math.sqrt(dx*dx + dy*dy);

        thisPoint.labelMC._x = -s*dx;
        thisPoint.labelMC._y = -s*dy;

        otherPoint.labelMC._x = -thisPoint.labelMC._x;
        otherPoint.labelMC._y = -thisPoint.labelMC._y;
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

    hideRanges() {
        //this.rangesMC.clear();
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
        return <div></div>;
    }
}
