class Bounds {
    x1;
    y1;
    x2;
    y2;

    constructor() {
        this.x1 = Infinity;
        this.y1 = Infinity;
        this.x2 = -Infinity;
        this.y2 = -Infinity;
    }

    setBounds(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        return this;
    }

    addPoint(x, y) {
        if(x < this.x1) this.x1 = x;
        if(x > this.x2) this.x2 = x;
        if(y < this.y1) this.y1 = y;
        if(y > this.y2) this.y2 = y;
        return this;
    }

    /**@param {...Point} points  */
    addPoints(...points) {
        for(let i = 0; i < points.length; i++) {
            this.addPoint(points[i].x, points[i].y);
        }
        return this;
    }

    isInside(x, y, padding = 0) {
        return staticUISpace.utility.isInside(x, y, this.x1, this.y1, this.x2, this.y2, padding);
    }

    /**
     * This will convert (x,y) from my current bounds to the new x1,x2,y2,x2 provided. This
     * was designed for rendering a shape preview in a specific space, but could be used elsewhere!
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} nX1 
     * @param {Number} nY1 
     * @param {Number} nX2 
     * @param {Number} nY2 
     */
    transformPointToNewBounds(x, y, nX1, nY1, nX2, nY2) {
        let percentX = (x-this.x1) / (this.x2 - this.x1);
        let percentY = (y-this.y1) / (this.y2 - this.y1);

        return {
            x: (nX2-nX1) * percentX + nX1,
            y: (nY2-nY1) * percentY + nY1,
        }
    }
}