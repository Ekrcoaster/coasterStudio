class CUIPolygon extends CUIElement {
    /**@type {DrawShapeOption} */
    options;

    /**@type {Point[]} */
    points;

    /**@param {Point[]} localPoints */
    constructor(x, y, localPoints = []) {
        super(x, y);
        this.points = localPoints || [];
        this.bounds.addPoints(...this.points);
    }

    /**@param {DrawShapeOption} options */
    setDrawOptions(options) {
        this.options = options;
        return this;
    }

    /**@param {CUICanvasSpace} info*/
    onDraw(info) {
        super.onDraw(info);
        this.options.fillColor.setAdd(this.hoveringMultiplier*100);
        const t = this;
        info.ui.drawPolygon(this.points.map((x) => {
            return {x: x.x + t.getX(), y: x.y + t.getY()}
        }), this.options, []);
    }

    addPoint(x, y) {
        this.points.push({x: x, y: y});
        this.bounds.addPoint(x, y);
        return this;
    }

    /**@param {...Point} points */
    addPoints(...points) {
        this.points.push(...points);
        this.bounds.addPoints(...this.points);
        return this;
    }
}

class CUIRect extends CUIPolygon {
    constructor(x, y, width, height) {
        super(x, y, [
            {x: 0, y: 0},
            {x: width, y: 0},
            {x: width, y: height},
            {x: 0, y: height}
        ]);
        
    }
}

class CUILine extends CUIElement {
    /**@type {DrawLineOption} */
    options;

    x2;
    y2;

    constructor(x1, y1, x2, y2) {
        super(x1, y1);
        this.x2 = x2-this.getX();
        this.y2 = y2-this.getY();
    }

    /**@param {DrawLineOption} options */
    setDrawOptions(options) {
        this.options = options;
        return this;
    }

    /**@param {CUICanvasSpace} info*/
    onDraw(info) {
        super.onDraw(info);
        info.ui.drawLine(this.getX(), this.getY(), this.getX() + this.x2, this.getY() + this.y2, this.options);
    }

    isInside(x, y) {
        return false;
    }
}