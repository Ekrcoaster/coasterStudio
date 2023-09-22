class DrawShapeOption {
    fillColor;
    outlineColor;
    outlineWidth;

    constructor(fillColor = "", outlineColor = "", outlineWidth = 0) {
        this.fillColor = fillColor;
        this.outlineColor = outlineColor;
        this.outlineWidth = outlineWidth || 0;
    }

    getFillColor() {return this.fillColor || "lime";}
    shouldFill() {return this.fillColor != null;}
    
    getStrokeStyle() {return this.outlineColor;}
    getStrokeWidth() {return this.outlineWidth;}
    shouldStroke() {return this.outlineWidth > 0;}
}

class Filter {}

const UI_LIBRARY = {

    /** Renders a rect using x1, y1, x2, y2
     * @param {Number} rotation 
     * @param {DrawShapeOption} shape 
     * @param {Filter[]} filters 
     */
    drawRectCoords: function (x1, y1, x2, y2, rotation, shape, filters = []) {
        this.drawPolygon([
            {x: x1, y: y1},
            {x: x2, y: y1},
            {x: x2, y: y2},
            {x: x1, y: y2}
        ], shape, filters);
    },

    /** Draws a polygon with the given points
     * @param {{x: Number, y: Number}[]} points 
     * @param {DrawShapeOption} shape 
     * @param {Filter[]} filters 
     */
    drawPolygon: function(points, shape, filters = []) {
        if(points.length < 3) {
            console.trace("ERROR: Attempting to draw polygon with less than 3 points!");
            return;
        }
        if(shape == null) shape = new DrawShapeOption();

        ctx.strokeStyle = shape.getStrokeStyle();
        ctx.lineWidth = shape.getStrokeWidth();
        ctx.fillStyle = shape.getFillColor();

        ctx.moveTo(points[0].x, points[0].y);
        ctx.beginPath();
        for(let i = 0; i < points.length; i++)
            ctx.lineTo(points[i].x, points[i].y);

        // if we are drawing an outline, then go back to the first point and draw a line (so all sides have a line)
        if(shape.shouldStroke()) {
            ctx.lineTo(points[0].x, points[0].y);
            ctx.stroke();   
        }

        if(shape.shouldFill())
            ctx.fill();
    }
}