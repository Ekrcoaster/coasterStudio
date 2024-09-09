class ShapeAsset extends Asset {
    /**@type {{x: 0, y: 0}[]} */
    points;
    /**@type {Bounds} */
    bounds;

    /**@param {{x: 0, y: 0}[]} points */
    constructor(points = []) {
        super();
        this.points = points;
        this.bounds = new Bounds().addPoints(this.points);
    }

    addPoint(x, y) {
        this.points.push({x: x, y: y});
        this.bounds.addPoint(x, y);
    }

    renderPreview(x1, y1, x2, y2) {
        let newPoints = [];
        for(let i = 0; i < this.points.length; i++) {
            newPoints.push(this.bounds.transformPointToNewBounds(this.points[i].x, this.points[i].y, x1, y1, x2, y2));
        }

        staticUISpace.ui.drawPolygon(newPoints, new DrawShapeOption("#1d6ea0", "#2aabb5", 5));
    }
}